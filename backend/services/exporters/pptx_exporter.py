import io
import qrcode
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

from .base import BaseExporter, ExportFormat, SlideData


class PPTXExporter(BaseExporter):
    """Export slides to PowerPoint format"""

    # Slide dimensions (16:9 widescreen)
    SLIDE_WIDTH = Inches(13.333)
    SLIDE_HEIGHT = Inches(7.5)

    @property
    def format(self) -> ExportFormat:
        return ExportFormat.PPTX

    @property
    def content_type(self) -> str:
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation"

    @property
    def file_extension(self) -> str:
        return ".pptx"

    def _hex_to_rgb(self, hex_color: str) -> RGBColor:
        """Convert hex color to RgbColor"""
        hex_color = hex_color.lstrip('#')
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return RGBColor(r, g, b)

    def _add_gradient_background(self, slide, template):
        """Add gradient background to slide"""
        background = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE,
            Inches(0), Inches(0),
            self.SLIDE_WIDTH, self.SLIDE_HEIGHT
        )
        background.line.fill.background()

        fill = background.fill
        fill.gradient()
        fill.gradient_angle = 135
        fill.gradient_stops[0].color.rgb = self._hex_to_rgb(template.background_color)
        fill.gradient_stops[1].color.rgb = self._hex_to_rgb(template.background_gradient_end)

        # Send to back
        spTree = slide.shapes._spTree
        sp = background._element
        spTree.remove(sp)
        spTree.insert(2, sp)

    def _add_text_box(
        self,
        slide,
        text: str,
        left: float,
        top: float,
        width: float,
        height: float,
        font_size: int,
        font_color: str,
        bold: bool = False,
        alignment: PP_ALIGN = PP_ALIGN.LEFT
    ):
        """Add a text box to the slide"""
        textbox = slide.shapes.add_textbox(
            Inches(left), Inches(top),
            Inches(width), Inches(height)
        )
        tf = textbox.text_frame
        tf.word_wrap = True
        tf.auto_size = None

        p = tf.paragraphs[0]
        p.text = text
        p.font.size = Pt(font_size)
        p.font.color.rgb = self._hex_to_rgb(font_color)
        p.font.bold = bold
        p.font.name = "Neue Haas Grotesk Display Pro"
        p.alignment = alignment

        return textbox

    def _add_circular_image(self, slide, image_data: bytes, left: float, top: float, size: float):
        """Add image to slide (circular cropping done via placeholder)"""
        image_stream = io.BytesIO(image_data)

        # Add the image
        picture = slide.shapes.add_picture(
            image_stream,
            Inches(left), Inches(top),
            Inches(size), Inches(size)
        )

        return picture

    def _generate_qr_code(self, url: str) -> bytes:
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

        # Convert to bytes
        output = io.BytesIO()
        img.save(output, format='PNG')
        output.seek(0)
        return output.getvalue()

    def _add_qr_code(self, slide, url: str, left: float, top: float, size: float):
        """Add QR code to slide"""
        qr_bytes = self._generate_qr_code(url)
        qr_stream = io.BytesIO(qr_bytes)

        picture = slide.shapes.add_picture(
            qr_stream,
            Inches(left), Inches(top),
            Inches(size), Inches(size)
        )

        return picture

    async def export(self, slide_data: SlideData) -> bytes:
        """Generate PowerPoint presentation from slide data"""
        template = slide_data.template

        # Create presentation with 16:9 aspect ratio
        prs = Presentation()
        prs.slide_width = self.SLIDE_WIDTH
        prs.slide_height = self.SLIDE_HEIGHT

        # Add blank slide
        blank_layout = prs.slide_layouts[6]  # Blank layout
        slide = prs.slides.add_slide(blank_layout)

        # Add gradient background
        self._add_gradient_background(slide, template)

        # Layout constants
        left_margin = 0.6
        content_width = 8.0
        right_section_left = 9.5
        image_size = 3.0

        # Add caption (top left, small)
        if slide_data.caption:
            self._add_text_box(
                slide,
                slide_data.caption.upper(),
                left=left_margin,
                top=0.5,
                width=content_width,
                height=0.4,
                font_size=12,
                font_color=template.text_color,
                bold=False
            )

        # Add headline (large, bold)
        headline_top = 1.2 if slide_data.caption else 0.8
        self._add_text_box(
            slide,
            slide_data.headline,
            left=left_margin,
            top=headline_top,
            width=content_width,
            height=1.5,
            font_size=36,
            font_color=template.text_color,
            bold=True
        )

        # Add description
        self._add_text_box(
            slide,
            slide_data.description,
            left=left_margin,
            top=headline_top + 1.8,
            width=content_width,
            height=2.5,
            font_size=18,
            font_color=template.text_color,
            bold=False
        )

        # Add author name (accent color)
        if slide_data.author_name:
            self._add_text_box(
                slide,
                slide_data.author_name,
                left=left_margin,
                top=6.0,
                width=content_width,
                height=0.5,
                font_size=16,
                font_color=template.accent_color,
                bold=True
            )

        # Add CBS branding text
        self._add_text_box(
            slide,
            "Columbia Business School",
            left=left_margin,
            top=6.8,
            width=4.0,
            height=0.4,
            font_size=11,
            font_color=template.text_color,
            bold=False
        )

        # Add image on right side (circular presentation)
        if slide_data.image_data:
            self._add_circular_image(
                slide,
                slide_data.image_data,
                left=right_section_left,
                top=2.0,
                size=image_size
            )

        # Add QR code if publication link exists
        if slide_data.publication_link:
            qr_size = 1.2
            self._add_qr_code(
                slide,
                slide_data.publication_link,
                left=right_section_left + 0.9,  # Center under image
                top=5.5,
                size=qr_size
            )
            # Add "Scan for more" label below QR code
            self._add_text_box(
                slide,
                "Scan for more",
                left=right_section_left,
                top=6.75,
                width=image_size,
                height=0.3,
                font_size=10,
                font_color=template.text_color,
                bold=False,
                alignment=PP_ALIGN.CENTER
            )

        # Save to bytes
        output = io.BytesIO()
        prs.save(output)
        output.seek(0)

        return output.getvalue()
