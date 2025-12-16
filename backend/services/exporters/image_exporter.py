import io
import qrcode
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple, Optional

from .base import BaseExporter, ExportFormat, SlideData, TemplateConfig, TemplateStyle


class BaseImageExporter(BaseExporter):
    """Base class for image exporters (PNG/JPG)"""

    # Output dimensions (1920x1080 for 16:9 at Full HD)
    WIDTH = 1920
    HEIGHT = 1080

    def _hex_to_rgb(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def _create_gradient(self, start_color: str, end_color: str) -> Image.Image:
        """Create gradient background image"""
        img = Image.new('RGB', (self.WIDTH, self.HEIGHT))
        draw = ImageDraw.Draw(img)

        start_rgb = self._hex_to_rgb(start_color)
        end_rgb = self._hex_to_rgb(end_color)

        # Create diagonal gradient (135 degrees approximation)
        for y in range(self.HEIGHT):
            for x in range(self.WIDTH):
                # Blend factor based on position (diagonal)
                blend = (x / self.WIDTH + y / self.HEIGHT) / 2
                r = int(start_rgb[0] * (1 - blend) + end_rgb[0] * blend)
                g = int(start_rgb[1] * (1 - blend) + end_rgb[1] * blend)
                b = int(start_rgb[2] * (1 - blend) + end_rgb[2] * blend)
                draw.point((x, y), fill=(r, g, b))

        return img

    def _create_gradient_fast(self, start_color: str, end_color: str) -> Image.Image:
        """Create gradient background image (faster version)"""
        import numpy as np

        start_rgb = self._hex_to_rgb(start_color)
        end_rgb = self._hex_to_rgb(end_color)

        # Create coordinate grids
        x = np.linspace(0, 1, self.WIDTH)
        y = np.linspace(0, 1, self.HEIGHT)
        xv, yv = np.meshgrid(x, y)

        # Blend factor (diagonal gradient at 135 degrees)
        blend = (xv + yv) / 2

        # Create RGB channels
        r = (start_rgb[0] * (1 - blend) + end_rgb[0] * blend).astype(np.uint8)
        g = (start_rgb[1] * (1 - blend) + end_rgb[1] * blend).astype(np.uint8)
        b = (start_rgb[2] * (1 - blend) + end_rgb[2] * blend).astype(np.uint8)

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
        max_lines: int = 10,
        alignment: str = "left"
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
            x = position[0]
            if alignment == "center":
                bbox = draw.textbbox((0, 0), line, font=font)
                line_width = bbox[2] - bbox[0]
                x = position[0] + (max_width - line_width) // 2
            elif alignment == "right":
                bbox = draw.textbbox((0, 0), line, font=font)
                line_width = bbox[2] - bbox[0]
                x = position[0] + max_width - line_width
            draw.text((x, y), line, font=font, fill=fill)
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

    def _add_rectangular_image(
        self,
        base_img: Image.Image,
        image_data: bytes,
        position: Tuple[int, int],
        size: Tuple[int, int]
    ):
        """Add rectangular image to base image"""
        img = Image.open(io.BytesIO(image_data))
        img = img.convert('RGB')
        img = img.resize(size, Image.Resampling.LANCZOS)
        base_img.paste(img, position)

    def _add_full_background_image(
        self,
        base_img: Image.Image,
        image_data: bytes,
        overlay_opacity: float = 0.5
    ):
        """Add full-bleed background image with dark overlay"""
        img = Image.open(io.BytesIO(image_data))
        img = img.convert('RGB')

        # Resize to cover entire slide
        img = img.resize((self.WIDTH, self.HEIGHT), Image.Resampling.LANCZOS)

        # Paste the background image
        base_img.paste(img, (0, 0))

        # Add dark gradient overlay from bottom
        overlay = Image.new('RGBA', (self.WIDTH, self.HEIGHT), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)

        # Create gradient from transparent at top to semi-opaque at bottom
        for y in range(self.HEIGHT):
            opacity = int(255 * (y / self.HEIGHT) * overlay_opacity)
            overlay_draw.line([(0, y), (self.WIDTH, y)], fill=(0, 0, 0, opacity))

        base_img.paste(overlay, (0, 0), overlay)

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

    def _get_template_colors(self, slide_data: SlideData) -> dict:
        """Get colors from template_style or fall back to legacy template"""
        template_style = slide_data.template_style
        template = slide_data.template

        if template_style:
            return {
                'background_color': template_style.background_color,
                'background_gradient_end': template_style.background_gradient_end,
                'text_color': template_style.text_color,
                'accent_color': template_style.accent_color,
                'layout_type': template_style.layout_type,
                'image_position': template_style.image_position,
                'image_size': template_style.image_size,
                'text_alignment': template_style.text_alignment,
            }
        else:
            return {
                'background_color': template.background_color,
                'background_gradient_end': template.background_gradient_end,
                'text_color': template.text_color,
                'accent_color': template.accent_color,
                'layout_type': 'split_text_primary',
                'image_position': 'right',
                'image_size': 'medium',
                'text_alignment': 'left',
            }

    def _render_full_hero_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Full hero layout - large background image with text overlay at bottom"""
        # Create base with gradient or image
        if slide_data.image_data:
            try:
                img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
            except ImportError:
                img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])
            img = img.convert('RGBA')
            self._add_full_background_image(img, slide_data.image_data, overlay_opacity=0.7)
        else:
            try:
                img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
            except ImportError:
                img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])
            img = img.convert('RGBA')

        draw = ImageDraw.Draw(img)
        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        # Layout constants
        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5
        left_margin = int(0.8 * scale_x)
        content_width = int(10.0 * scale_x)

        # Caption at bottom area
        if slide_data.caption:
            caption_font = self._get_font(24)
            caption_top = int(4.5 * scale_y)
            draw.text(
                (left_margin, caption_top),
                slide_data.caption.upper(),
                font=caption_font,
                fill=(*text_color, 200)
            )

        # Headline
        headline_font = self._get_font(64, bold=True)
        headline_top = int(5.0 * scale_y)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (left_margin, headline_top),
            headline_font,
            text_color,
            content_width,
            max_lines=2
        )

        # Description
        if slide_data.description:
            desc_font = self._get_font(28)
            desc_top = headline_top + int(1.2 * scale_y)
            self._draw_text_wrapped(
                draw,
                slide_data.description,
                (left_margin, desc_top),
                desc_font,
                text_color,
                int(8.0 * scale_x),
                max_lines=2
            )

        # Author name (bottom left)
        if slide_data.author_name:
            author_font = self._get_font(28, bold=True)
            author_top = int(7.0 * scale_y)
            draw.text(
                (left_margin, author_top),
                slide_data.author_name,
                font=author_font,
                fill=accent_color
            )

        # QR code (bottom right)
        if slide_data.publication_link:
            qr_size = int(1.2 * scale_x)
            qr_left = int(11.5 * scale_x)
            qr_top = int(5.8 * scale_y)
            self._add_qr_code(img, slide_data.publication_link, (qr_left, qr_top), qr_size)
            # Label
            qr_label_font = self._get_font(18)
            draw.text(
                (int(11.2 * scale_x), qr_top + qr_size + 10),
                "Scan for more",
                font=qr_label_font,
                fill=(*text_color, 180)
            )

        return img

    def _render_split_text_primary_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Split layout with text on left (2/3) and circular image on right (1/3)"""
        try:
            img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
        except ImportError:
            img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])

        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        # Layout constants
        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5
        left_margin = int(0.6 * scale_x)
        content_width = int(8.0 * scale_x)

        # Caption
        if slide_data.caption:
            caption_font = self._get_font(24)
            caption_top = int(0.5 * scale_y)
            draw.text(
                (left_margin, caption_top),
                slide_data.caption.upper(),
                font=caption_font,
                fill=(*text_color, 200)
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

        # Event details
        if slide_data.event_date or slide_data.event_time or slide_data.event_location:
            event_font = self._get_font(28, bold=True)
            event_top = headline_top + int(4.0 * scale_y)
            event_parts = []
            if slide_data.event_date:
                event_parts.append(f"Date: {slide_data.event_date}")
            if slide_data.event_time:
                event_parts.append(f"Time: {slide_data.event_time}")
            if slide_data.event_location:
                event_parts.append(f"Location: {slide_data.event_location}")
            event_text = "   |   ".join(event_parts)
            draw.text(
                (left_margin, event_top),
                event_text,
                font=event_font,
                fill=accent_color
            )

        # Author name
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

        # Circular image on right
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

        # QR code
        if slide_data.publication_link:
            qr_size = int(1.2 * scale_x)
            qr_left = int(10.4 * scale_x)
            qr_top = int(5.5 * scale_y)
            self._add_qr_code(img, slide_data.publication_link, (qr_left, qr_top), qr_size)
            qr_label_font = self._get_font(20)
            draw.text(
                (int(9.5 * scale_x), qr_top + qr_size + 10),
                "Scan for more",
                font=qr_label_font,
                fill=(*text_color, 180)
            )

        return img

    def _render_split_image_primary_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Split layout with large image on left (1/2) and text on right (1/2)"""
        try:
            img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
        except ImportError:
            img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])

        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5

        # Large image on left half
        if slide_data.image_data:
            image_width = int(6.5 * scale_x)
            self._add_rectangular_image(
                img,
                slide_data.image_data,
                (0, 0),
                (image_width, self.HEIGHT)
            )

        # Text content on right
        right_margin = int(7.0 * scale_x)
        content_width = int(5.8 * scale_x)

        # Caption
        if slide_data.caption:
            caption_font = self._get_font(24)
            draw.text(
                (right_margin, int(0.8 * scale_y)),
                slide_data.caption.upper(),
                font=caption_font,
                fill=(*text_color, 200)
            )

        # Headline
        headline_font = self._get_font(56, bold=True)
        headline_top = int((1.5 if slide_data.caption else 1.0) * scale_y)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (right_margin, headline_top),
            headline_font,
            text_color,
            content_width,
            max_lines=3
        )

        # Description
        desc_font = self._get_font(28)
        desc_top = headline_top + int(1.8 * scale_y)
        self._draw_text_wrapped(
            draw,
            slide_data.description,
            (right_margin, desc_top),
            desc_font,
            text_color,
            content_width,
            max_lines=4
        )

        # Event details
        if slide_data.event_date or slide_data.event_time or slide_data.event_location:
            event_font = self._get_font(24)
            event_top = headline_top + int(3.8 * scale_y)
            event_parts = []
            if slide_data.event_date:
                event_parts.append(f"Date: {slide_data.event_date}")
            if slide_data.event_time:
                event_parts.append(f"Time: {slide_data.event_time}")
            if slide_data.event_location:
                event_parts.append(f"Location: {slide_data.event_location}")
            event_text = "\n".join(event_parts)
            self._draw_text_wrapped(
                draw,
                event_text,
                (right_margin, event_top),
                event_font,
                accent_color,
                content_width,
                max_lines=3
            )

        # Author name
        if slide_data.author_name:
            author_font = self._get_font(28, bold=True)
            draw.text(
                (right_margin, int(6.0 * scale_y)),
                slide_data.author_name,
                font=author_font,
                fill=accent_color
            )

        # CBS branding
        brand_font = self._get_font(20)
        draw.text(
            (right_margin, int(6.8 * scale_y)),
            "Columbia Business School",
            font=brand_font,
            fill=(*text_color, 180)
        )

        # QR code
        if slide_data.publication_link:
            qr_size = int(1.0 * scale_x)
            self._add_qr_code(img, slide_data.publication_link, (int(11.5 * scale_x), int(5.8 * scale_y)), qr_size)

        return img

    def _render_circular_speaker_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Centered circular image with text below - ideal for speaker highlights"""
        try:
            img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
        except ImportError:
            img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])

        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5
        center_x = self.WIDTH // 2

        # Caption at top
        if slide_data.caption:
            caption_font = self._get_font(24)
            bbox = draw.textbbox((0, 0), slide_data.caption.upper(), font=caption_font)
            caption_width = bbox[2] - bbox[0]
            draw.text(
                (center_x - caption_width // 2, int(0.5 * scale_y)),
                slide_data.caption.upper(),
                font=caption_font,
                fill=(*text_color, 200)
            )

        # Centered circular image
        image_size = int(3.0 * scale_x)
        if slide_data.image_data:
            self._add_circular_image(
                img,
                slide_data.image_data,
                (center_x - image_size // 2, int(1.0 * scale_y)),
                image_size,
                accent_color,
                border_width=8
            )

        # Author name (prominent)
        if slide_data.author_name:
            author_font = self._get_font(48, bold=True)
            bbox = draw.textbbox((0, 0), slide_data.author_name, font=author_font)
            author_width = bbox[2] - bbox[0]
            draw.text(
                (center_x - author_width // 2, int(4.2 * scale_y)),
                slide_data.author_name,
                font=author_font,
                fill=accent_color
            )

        # Headline
        headline_font = self._get_font(52, bold=True)
        headline_top = int(4.8 * scale_y)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (int(1.5 * scale_x), headline_top),
            headline_font,
            text_color,
            int(10.333 * scale_x),
            max_lines=2,
            alignment="center"
        )

        # Description
        if slide_data.description:
            desc_font = self._get_font(28)
            desc_top = int(5.9 * scale_y)
            self._draw_text_wrapped(
                draw,
                slide_data.description,
                (int(2.0 * scale_x), desc_top),
                desc_font,
                text_color,
                int(9.333 * scale_x),
                max_lines=2,
                alignment="center"
            )

        # Event details
        if slide_data.event_date or slide_data.event_time or slide_data.event_location:
            event_font = self._get_font(24)
            event_parts = []
            if slide_data.event_date:
                event_parts.append(slide_data.event_date)
            if slide_data.event_time:
                event_parts.append(slide_data.event_time)
            if slide_data.event_location:
                event_parts.append(slide_data.event_location)
            event_text = "  |  ".join(event_parts)
            bbox = draw.textbbox((0, 0), event_text, font=event_font)
            event_width = bbox[2] - bbox[0]
            draw.text(
                (center_x - event_width // 2, int(6.7 * scale_y)),
                event_text,
                font=event_font,
                fill=accent_color
            )

        # CBS branding
        brand_font = self._get_font(20)
        draw.text(
            (int(0.5 * scale_x), int(7.0 * scale_y)),
            "Columbia Business School",
            font=brand_font,
            fill=(*text_color, 180)
        )

        # QR code
        if slide_data.publication_link:
            qr_size = int(1.0 * scale_x)
            self._add_qr_code(img, slide_data.publication_link, (int(11.5 * scale_x), int(6.0 * scale_y)), qr_size)

        return img

    def _render_text_only_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Bold text-only layout with centered content"""
        try:
            img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
        except ImportError:
            img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])

        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5
        center_x = self.WIDTH // 2

        # Caption at top
        if slide_data.caption:
            caption_font = self._get_font(32)
            bbox = draw.textbbox((0, 0), slide_data.caption.upper(), font=caption_font)
            caption_width = bbox[2] - bbox[0]
            draw.text(
                (center_x - caption_width // 2, int(1.5 * scale_y)),
                slide_data.caption.upper(),
                font=caption_font,
                fill=(*text_color, 200)
            )

        # Large centered headline
        headline_font = self._get_font(96, bold=True)
        headline_top = int(2.5 * scale_y)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (int(1.0 * scale_x), headline_top),
            headline_font,
            text_color,
            int(11.333 * scale_x),
            max_lines=3,
            alignment="center"
        )

        # Description
        if slide_data.description:
            desc_font = self._get_font(36)
            desc_top = int(4.8 * scale_y)
            self._draw_text_wrapped(
                draw,
                slide_data.description,
                (int(2.0 * scale_x), desc_top),
                desc_font,
                text_color,
                int(9.333 * scale_x),
                max_lines=3,
                alignment="center"
            )

        # Author name
        if slide_data.author_name:
            author_font = self._get_font(32, bold=True)
            bbox = draw.textbbox((0, 0), slide_data.author_name, font=author_font)
            author_width = bbox[2] - bbox[0]
            draw.text(
                (center_x - author_width // 2, int(6.2 * scale_y)),
                slide_data.author_name,
                font=author_font,
                fill=accent_color
            )

        # CBS branding
        brand_font = self._get_font(22)
        bbox = draw.textbbox((0, 0), "Columbia Business School", font=brand_font)
        brand_width = bbox[2] - bbox[0]
        draw.text(
            (center_x - brand_width // 2, int(6.9 * scale_y)),
            "Columbia Business School",
            font=brand_font,
            fill=(*text_color, 180)
        )

        # QR code
        if slide_data.publication_link:
            qr_size = int(1.0 * scale_x)
            self._add_qr_code(img, slide_data.publication_link, (int(11.5 * scale_x), int(6.0 * scale_y)), qr_size)

        return img

    def _render_media_vertical_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Media mention layout with article card style"""
        try:
            img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
        except ImportError:
            img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])

        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5

        # Article card on left (white background)
        card_left = int(0.5 * scale_x)
        card_top = int(0.5 * scale_y)
        card_width = int(7.5 * scale_x)
        card_height = int(6.5 * scale_y)

        # Draw rounded rectangle for card
        card_rect = Image.new('RGBA', (card_width, card_height), (255, 255, 255, 255))
        img.paste(card_rect, (card_left, card_top))

        # Image at top of card
        if slide_data.image_data:
            image_height = int(3.0 * scale_y)
            self._add_rectangular_image(
                img,
                slide_data.image_data,
                (card_left + int(0.1 * scale_x), card_top + int(0.1 * scale_y)),
                (card_width - int(0.2 * scale_x), image_height)
            )

        # Article content in card (dark text on white)
        card_text_color = self._hex_to_rgb("#181a1c")

        if slide_data.caption:
            caption_font = self._get_font(20)
            draw.text(
                (card_left + int(0.3 * scale_x), card_top + int(3.3 * scale_y)),
                slide_data.caption.upper(),
                font=caption_font,
                fill=(*card_text_color, 180)
            )

        headline_font = self._get_font(44, bold=True)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (card_left + int(0.3 * scale_x), card_top + int(3.7 * scale_y)),
            headline_font,
            card_text_color,
            card_width - int(0.6 * scale_x),
            max_lines=3
        )

        if slide_data.description:
            desc_font = self._get_font(24)
            self._draw_text_wrapped(
                draw,
                slide_data.description,
                (card_left + int(0.3 * scale_x), card_top + int(5.0 * scale_y)),
                desc_font,
                card_text_color,
                card_width - int(0.6 * scale_x),
                max_lines=3
            )

        # Right side - Featured info
        right_margin = int(8.5 * scale_x)

        if slide_data.author_name:
            author_font = self._get_font(32, bold=True)
            draw.text(
                (right_margin, int(1.0 * scale_y)),
                f"Featured: {slide_data.author_name}",
                font=author_font,
                fill=accent_color
            )

        # CBS branding
        brand_font = self._get_font(22)
        draw.text(
            (right_margin, int(6.5 * scale_y)),
            "Columbia Business School",
            font=brand_font,
            fill=(*text_color, 180)
        )

        # QR code
        if slide_data.publication_link:
            qr_size = int(1.5 * scale_x)
            self._add_qr_code(img, slide_data.publication_link, (int(9.5 * scale_x), int(4.0 * scale_y)), qr_size)
            qr_label_font = self._get_font(20)
            draw.text(
                (int(9.5 * scale_x), int(5.6 * scale_y)),
                "Read Article",
                font=qr_label_font,
                fill=(*text_color, 180)
            )

        return img

    def _render_media_wide_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Wide media layout with image on left"""
        try:
            img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
        except ImportError:
            img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])

        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5

        # Large image on left
        if slide_data.image_data:
            image_width = int(5.5 * scale_x)
            self._add_rectangular_image(
                img,
                slide_data.image_data,
                (0, 0),
                (image_width, self.HEIGHT)
            )

        # Content on right
        right_margin = int(6.0 * scale_x)
        content_width = int(6.8 * scale_x)

        if slide_data.caption:
            caption_font = self._get_font(24)
            draw.text(
                (right_margin, int(1.0 * scale_y)),
                slide_data.caption.upper(),
                font=caption_font,
                fill=accent_color
            )

        headline_font = self._get_font(52, bold=True)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (right_margin, int(1.5 * scale_y)),
            headline_font,
            text_color,
            content_width,
            max_lines=3
        )

        if slide_data.description:
            desc_font = self._get_font(28)
            self._draw_text_wrapped(
                draw,
                slide_data.description,
                (right_margin, int(3.2 * scale_y)),
                desc_font,
                text_color,
                content_width,
                max_lines=5
            )

        if slide_data.author_name:
            author_font = self._get_font(28, bold=True)
            draw.text(
                (right_margin, int(5.5 * scale_y)),
                slide_data.author_name,
                font=author_font,
                fill=accent_color
            )

        brand_font = self._get_font(20)
        draw.text(
            (right_margin, int(6.8 * scale_y)),
            "Columbia Business School",
            font=brand_font,
            fill=(*text_color, 180)
        )

        if slide_data.publication_link:
            qr_size = int(1.2 * scale_x)
            self._add_qr_code(img, slide_data.publication_link, (int(11.5 * scale_x), int(5.8 * scale_y)), qr_size)

        return img

    def _render_congrats_framed_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Congratulations layout with framed image"""
        try:
            img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
        except ImportError:
            img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])

        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5

        # Framed image on left
        if slide_data.image_data:
            frame_left = int(0.8 * scale_x)
            frame_top = int(1.5 * scale_y)
            frame_size = int(4.5 * scale_x)

            # Draw frame border
            frame_border = 8
            draw.rectangle(
                [(frame_left - frame_border, frame_top - frame_border),
                 (frame_left + frame_size + frame_border, frame_top + frame_size + frame_border)],
                outline=accent_color,
                width=frame_border
            )

            # Add image inside frame
            self._add_rectangular_image(
                img,
                slide_data.image_data,
                (frame_left, frame_top),
                (frame_size, frame_size)
            )

        # Content on right
        right_margin = int(5.8 * scale_x)
        content_width = int(6.8 * scale_x)

        # "Congratulations" caption
        caption_font = self._get_font(36)
        caption_text = (slide_data.caption or "CONGRATULATIONS").upper()
        draw.text(
            (right_margin, int(1.5 * scale_y)),
            caption_text,
            font=caption_font,
            fill=accent_color
        )

        # Honoree name (prominent)
        if slide_data.author_name:
            name_font = self._get_font(64, bold=True)
            self._draw_text_wrapped(
                draw,
                slide_data.author_name,
                (right_margin, int(2.2 * scale_y)),
                name_font,
                text_color,
                content_width,
                max_lines=2
            )

        # Achievement headline
        headline_font = self._get_font(44, bold=True)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (right_margin, int(3.5 * scale_y)),
            headline_font,
            accent_color,
            content_width,
            max_lines=2
        )

        # Description
        if slide_data.description:
            desc_font = self._get_font(28)
            self._draw_text_wrapped(
                draw,
                slide_data.description,
                (right_margin, int(4.8 * scale_y)),
                desc_font,
                text_color,
                content_width,
                max_lines=4
            )

        # CBS branding
        brand_font = self._get_font(22)
        draw.text(
            (right_margin, int(6.8 * scale_y)),
            "Columbia Business School",
            font=brand_font,
            fill=(*text_color, 180)
        )

        return img

    def _render_podcast_layout(self, slide_data: SlideData, colors: dict) -> Image.Image:
        """Podcast layout with artwork on left"""
        try:
            img = self._create_gradient_fast(colors['background_color'], colors['background_gradient_end'])
        except ImportError:
            img = self._create_gradient(colors['background_color'], colors['background_gradient_end'])

        img = img.convert('RGBA')
        draw = ImageDraw.Draw(img)

        text_color = self._hex_to_rgb(colors['text_color'])
        accent_color = self._hex_to_rgb(colors['accent_color'])

        scale_x = self.WIDTH / 13.333
        scale_y = self.HEIGHT / 7.5

        # Podcast artwork on left (square)
        artwork_left = int(0.8 * scale_x)
        artwork_top = int(1.5 * scale_y)
        artwork_size = int(4.5 * scale_x)

        if slide_data.image_data:
            self._add_rectangular_image(
                img,
                slide_data.image_data,
                (artwork_left, artwork_top),
                (artwork_size, artwork_size)
            )
        else:
            # Placeholder for podcast artwork
            draw.rectangle(
                [(artwork_left, artwork_top),
                 (artwork_left + artwork_size, artwork_top + artwork_size)],
                fill=(50, 50, 50)
            )

        # Content on right
        right_margin = int(5.8 * scale_x)
        content_width = int(6.8 * scale_x)

        # Episode caption
        caption_font = self._get_font(24)
        caption_text = (slide_data.caption or "PODCAST EPISODE").upper()
        draw.text(
            (right_margin, int(1.5 * scale_y)),
            caption_text,
            font=caption_font,
            fill=(*text_color, 180)
        )

        # Episode title
        headline_font = self._get_font(48, bold=True)
        self._draw_text_wrapped(
            draw,
            slide_data.headline,
            (right_margin, int(2.0 * scale_y)),
            headline_font,
            text_color,
            content_width,
            max_lines=3
        )

        # Description
        if slide_data.description:
            desc_font = self._get_font(28)
            self._draw_text_wrapped(
                draw,
                slide_data.description,
                (right_margin, int(3.7 * scale_y)),
                desc_font,
                text_color,
                content_width,
                max_lines=4
            )

        # Host name
        if slide_data.author_name:
            author_font = self._get_font(28, bold=True)
            draw.text(
                (right_margin, int(5.8 * scale_y)),
                f"Host: {slide_data.author_name}",
                font=author_font,
                fill=accent_color
            )

        # CBS branding
        brand_font = self._get_font(20)
        draw.text(
            (right_margin, int(6.8 * scale_y)),
            "Columbia Business School",
            font=brand_font,
            fill=(*text_color, 180)
        )

        # QR code for podcast link
        if slide_data.publication_link:
            qr_size = int(1.2 * scale_x)
            qr_left = int(11.5 * scale_x)
            qr_top = int(5.5 * scale_y)
            self._add_qr_code(img, slide_data.publication_link, (qr_left, qr_top), qr_size)
            qr_label_font = self._get_font(20)
            draw.text(
                (int(11.2 * scale_x), qr_top + qr_size + 10),
                "Listen Now",
                font=qr_label_font,
                fill=(*text_color, 180)
            )

        return img

    async def _render_slide(self, slide_data: SlideData) -> Image.Image:
        """Render slide to PIL Image - routes to appropriate layout method"""
        colors = self._get_template_colors(slide_data)
        layout_type = colors['layout_type']
        image_position = colors['image_position']

        # Route to appropriate layout based on template_style
        if layout_type == "full_hero" or image_position == "full":
            return self._render_full_hero_layout(slide_data, colors)
        elif layout_type == "split_image_primary" or (image_position == "left" and layout_type not in ["media_wide", "podcast_standard", "podcast_feature"]):
            return self._render_split_image_primary_layout(slide_data, colors)
        elif layout_type == "event_speaker" or image_position in ["circular", "center"]:
            return self._render_circular_speaker_layout(slide_data, colors)
        elif image_position == "none":
            return self._render_text_only_layout(slide_data, colors)
        elif layout_type == "media_vertical":
            return self._render_media_vertical_layout(slide_data, colors)
        elif layout_type == "media_wide":
            return self._render_media_wide_layout(slide_data, colors)
        elif layout_type == "congrats_framed":
            return self._render_congrats_framed_layout(slide_data, colors)
        elif layout_type in ["podcast_standard", "podcast_feature"]:
            return self._render_podcast_layout(slide_data, colors)
        else:
            # Default to split text primary layout
            return self._render_split_text_primary_layout(slide_data, colors)


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
