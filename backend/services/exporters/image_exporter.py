import io
import qrcode
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple

from .base import BaseExporter, ExportFormat, SlideData, TemplateConfig


class BaseImageExporter(BaseExporter):
    """Base class for image exporters (PNG/JPG)"""

    # Output dimensions (1920x1080 for 16:9 at Full HD)
    WIDTH = 1920
    HEIGHT = 1080

    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def _create_gradient(self, template: TemplateConfig) -> Image.Image:
        """Create gradient background image"""
        img = Image.new('RGB', (self.WIDTH, self.HEIGHT))
        draw = ImageDraw.Draw(img)

        start_color = self._hex_to_rgb(template.background_color)
        end_color = self._hex_to_rgb(template.background_gradient_end)

        # Create diagonal gradient (135 degrees approximation)
        for y in range(self.HEIGHT):
            for x in range(self.WIDTH):
                # Blend factor based on position (diagonal)
                blend = (x / self.WIDTH + y / self.HEIGHT) / 2
                r = int(start_color[0] * (1 - blend) + end_color[0] * blend)
                g = int(start_color[1] * (1 - blend) + end_color[1] * blend)
                b = int(start_color[2] * (1 - blend) + end_color[2] * blend)
                draw.point((x, y), fill=(r, g, b))

        return img

    def _create_gradient_fast(self, template: TemplateConfig) -> Image.Image:
        """Create gradient background image (faster version)"""
        import numpy as np

        start_color = self._hex_to_rgb(template.background_color)
        end_color = self._hex_to_rgb(template.background_gradient_end)

        # Create coordinate grids
        x = np.linspace(0, 1, self.WIDTH)
        y = np.linspace(0, 1, self.HEIGHT)
        xv, yv = np.meshgrid(x, y)

        # Blend factor (diagonal gradient at 135 degrees)
        blend = (xv + yv) / 2

        # Create RGB channels
        r = (start_color[0] * (1 - blend) + end_color[0] * blend).astype(np.uint8)
        g = (start_color[1] * (1 - blend) + end_color[1] * blend).astype(np.uint8)
        b = (start_color[2] * (1 - blend) + end_color[2] * blend).astype(np.uint8)

        # Stack and create image
        rgb_array = np.stack([r, g, b], axis=-1)
        return Image.fromarray(rgb_array, 'RGB')

    def _get_font(self, size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
        """Get font with fallback to default"""
        # Try Neue Haas Grotesk Display Pro first, then common system fonts
        font_names = [
            "/Library/Fonts/NeueHaasGroteskDisplayPro.ttf",  # macOS custom
            "/Library/Fonts/Neue Haas Grotesk Display Pro.ttf",  # macOS custom alt
            "~/Library/Fonts/NeueHaasGroteskDisplayPro.ttf",  # macOS user
            "~/Library/Fonts/Neue Haas Grotesk Display Pro.ttf",  # macOS user alt
            "/System/Library/Fonts/Helvetica.ttc",  # macOS
            "/System/Library/Fonts/SFNSText.ttf",   # macOS SF
            "Arial.ttf",                             # Windows
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",  # Linux
        ]

        if bold:
            font_names = [
                "/Library/Fonts/NeueHaasGroteskDisplayPro-Bold.ttf",  # macOS custom
                "/Library/Fonts/Neue Haas Grotesk Display Pro Bold.ttf",  # macOS custom alt
                "~/Library/Fonts/NeueHaasGroteskDisplayPro-Bold.ttf",  # macOS user
                "~/Library/Fonts/Neue Haas Grotesk Display Pro Bold.ttf",  # macOS user alt
                "/System/Library/Fonts/Helvetica.ttc",
                "/System/Library/Fonts/SFNSText-Bold.otf",
                "Arial Bold.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            ] + font_names

        import os
        for font_name in font_names:
            try:
                expanded_path = os.path.expanduser(font_name)
                return ImageFont.truetype(expanded_path, size)
            except (IOError, OSError):
                continue

        # Fallback to default
        return ImageFont.load_default()

    def _draw_text_wrapped(
        self,
        draw: ImageDraw.Draw,
        text: str,
        position: Tuple[int, int],
        font: ImageFont.FreeTypeFont,
        fill: Tuple[int, int, int],
        max_width: int,
        max_lines: int = 10
    ) -> int:
        """Draw text with word wrapping, return total height used"""
        words = text.split()
        lines = []
        current_line = []

        for word in words:
            current_line.append(word)
            test_line = ' '.join(current_line)
            bbox = draw.textbbox((0, 0), test_line, font=font)
            if bbox[2] > max_width:
                if len(current_line) > 1:
                    current_line.pop()
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    lines.append(test_line)
                    current_line = []

        if current_line:
            lines.append(' '.join(current_line))

        # Limit lines
        lines = lines[:max_lines]

        # Draw each line
        y = position[1]
        line_height = font.size + 8

        for line in lines:
            draw.text((position[0], y), line, font=font, fill=fill)
            y += line_height

        return y - position[1]

    def _create_circular_mask(self, size: int) -> Image.Image:
        """Create a circular mask"""
        mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size-1, size-1), fill=255)
        return mask

    def _add_circular_image(
        self,
        base_img: Image.Image,
        image_data: bytes,
        position: Tuple[int, int],
        size: int,
        border_color: Tuple[int, int, int],
        border_width: int = 8
    ):
        """Add circular image with border to base image"""
        # Load and resize the image
        img = Image.open(io.BytesIO(image_data))
        img = img.convert('RGB')

        # Crop to square (center crop)
        min_dim = min(img.width, img.height)
        left = (img.width - min_dim) // 2
        top = (img.height - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))

        # Resize to target size
        img = img.resize((size, size), Image.Resampling.LANCZOS)

        # Create circular mask
        mask = self._create_circular_mask(size)

        # Create circular border
        border_size = size + border_width * 2
        border_img = Image.new('RGBA', (border_size, border_size), (0, 0, 0, 0))
        border_draw = ImageDraw.Draw(border_img)
        border_draw.ellipse(
            (0, 0, border_size-1, border_size-1),
            fill=(*border_color, 255)
        )

        # Apply mask to image
        output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        output.paste(img, mask=mask)

        # Composite: border first, then image
        border_pos = (position[0] - border_width, position[1] - border_width)
        base_img.paste(border_img, border_pos, border_img)
        base_img.paste(output, position, output)

    def _generate_qr_code(self, url: str, size: int) -> Image.Image:
        """Generate QR code image from URL"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=2,
        )
        qr.add_data(url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        img = img.convert('RGBA')

        # Resize to desired size
        img = img.resize((size, size), Image.Resampling.LANCZOS)

        return img

    def _add_qr_code(
        self,
        base_img: Image.Image,
        url: str,
        position: Tuple[int, int],
        size: int
    ):
        """Add QR code to base image"""
        qr_img = self._generate_qr_code(url, size)
        base_img.paste(qr_img, position, qr_img)

    async def _render_slide(self, slide_data: SlideData) -> Image.Image:
        """Render slide to PIL Image"""
        template = slide_data.template

        # Try fast gradient first, fall back to slow if numpy not available
        try:
            img = self._create_gradient_fast(template)
        except ImportError:
            img = self._create_gradient(template)

        # Convert to RGBA for compositing
        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(template.text_color)
        accent_color = self._hex_to_rgb(template.accent_color)

        # Layout constants (scaled from 13.333x7.5 inches to 1920x1080)
        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5

        left_margin = int(0.6 * scale_x)
        content_width = int(8.0 * scale_x)

        # Caption (top, small, uppercase)
        if slide_data.caption:
            caption_font = self._get_font(24)
            caption_top = int(0.5 * scale_y)
            draw.text(
                (left_margin, caption_top),
                slide_data.caption.upper(),
                font=caption_font,
                fill=(*text_color, 200)  # Slightly transparent
            )

        # Headline
        headline_font = self._get_font(72, bold=True)
        headline_top = int((1.2 if slide_data.caption else 0.8) * scale_y)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (left_margin, headline_top),
            headline_font,
            text_color,
            content_width,
            max_lines=3
        )

        # Description
        desc_font = self._get_font(36)
        desc_top = headline_top + int(1.8 * scale_y)
        self._draw_text_wrapped(
            draw,
            slide_data.description,
            (left_margin, desc_top),
            desc_font,
            text_color,
            content_width,
            max_lines=5
        )

        # Author name (accent color)
        if slide_data.author_name:
            author_font = self._get_font(32, bold=True)
            author_top = int(6.0 * scale_y)
            draw.text(
                (left_margin, author_top),
                slide_data.author_name,
                font=author_font,
                fill=accent_color
            )

        # CBS branding
        brand_font = self._get_font(22)
        brand_top = int(6.8 * scale_y)
        draw.text(
            (left_margin, brand_top),
            "Columbia Business School",
            font=brand_font,
            fill=(*text_color, 180)
        )

        # Add circular image on right side
        if slide_data.image_data:
            image_size = int(3.0 * scale_x)
            image_left = int(9.5 * scale_x)
            image_top = int(2.0 * scale_y)
            self._add_circular_image(
                img,
                slide_data.image_data,
                (image_left, image_top),
                image_size,
                accent_color,
                border_width=8
            )

        # Add QR code if publication link exists
        if slide_data.publication_link:
            qr_size = int(1.2 * scale_x)
            qr_left = int(10.4 * scale_x)  # Center under image
            qr_top = int(5.5 * scale_y)
            self._add_qr_code(
                img,
                slide_data.publication_link,
                (qr_left, qr_top),
                qr_size
            )
            # Add "Scan for more" label below QR code
            qr_label_font = self._get_font(20)
            qr_label_top = qr_top + qr_size + 10
            # Center the text under QR code
            draw.text(
                (int(9.5 * scale_x), qr_label_top),
                "Scan for more",
                font=qr_label_font,
                fill=(*text_color, 180)
            )

        return img


class PNGExporter(BaseImageExporter):
    """Export slides to PNG format"""

    @property
    def format(self) -> ExportFormat:
        return ExportFormat.PNG

    @property
    def content_type(self) -> str:
        return "image/png"

    @property
    def file_extension(self) -> str:
        return ".png"

    async def export(self, slide_data: SlideData) -> bytes:
        """Generate PNG image from slide data"""
        img = await self._render_slide(slide_data)

        # Convert to RGB for PNG (remove alpha)
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background

        output = io.BytesIO()
        img.save(output, format='PNG', optimize=True)
        output.seek(0)

        return output.getvalue()


class JPGExporter(BaseImageExporter):
    """Export slides to JPEG format"""

    @property
    def format(self) -> ExportFormat:
        return ExportFormat.JPG

    @property
    def content_type(self) -> str:
        return "image/jpeg"

    @property
    def file_extension(self) -> str:
        return ".jpg"

    async def export(self, slide_data: SlideData) -> bytes:
        """Generate JPEG image from slide data"""
        img = await self._render_slide(slide_data)

        # Convert to RGB for JPEG (no alpha support)
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background

        output = io.BytesIO()
        img.save(output, format='JPEG', quality=95, optimize=True)
        output.seek(0)

        return output.getvalue()
