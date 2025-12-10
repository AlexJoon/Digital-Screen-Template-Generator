import io
from PIL import Image
from typing import Dict, Any, Tuple


def crop_image_to_face(
    image_data: bytes,
    face_detection: Dict[str, Any],
    output_size: int = 800,
    padding_factor: float = 0.6
) -> Tuple[bytes, Dict[str, Any]]:
    """
    Crop an image to center on detected face position.

    Args:
        image_data: Binary image data
        face_detection: Result from detect_face_position() containing:
            - has_face: bool
            - face_center_x: float (0-1)
            - face_center_y: float (0-1)
            - face_size: float (0-1)
        output_size: Size of the output square image in pixels
        padding_factor: Extra padding around face (0.6 = 60% padding for headshots)

    Returns:
        Tuple of (cropped_image_bytes, crop_info)
        crop_info contains details about the crop operation
    """
    img = Image.open(io.BytesIO(image_data))
    img = img.convert('RGB')

    width, height = img.size
    crop_info = {
        "original_width": width,
        "original_height": height,
        "was_cropped": False,
        "crop_method": "none"
    }

    if not face_detection.get("has_face", False):
        # No face detected - do center crop
        crop_info["crop_method"] = "center"
        crop_info["was_cropped"] = True

        # Center crop to square
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))

    else:
        # Face detected - crop centered on face with generous padding
        crop_info["crop_method"] = "face_centered"
        crop_info["was_cropped"] = True

        face_x = face_detection.get("face_center_x", 0.5)
        face_y = face_detection.get("face_center_y", 0.5)
        face_size = face_detection.get("face_size", 0.3)

        # Conservative cropping approach:
        # Use a large crop area to preserve context around the face
        # The face should occupy roughly 25-30% of the final image for proper headshot framing

        # Calculate crop size - aim for the face to be about 25% of the final crop
        # This gives generous space for head, shoulders, and background
        target_face_ratio = 0.25

        # Base crop ratio from face size
        crop_size_ratio = face_size / target_face_ratio

        # Ensure we capture enough of the image (minimum 70% to be conservative)
        crop_size_ratio = max(0.7, min(1.0, crop_size_ratio))

        # Calculate crop dimensions (always square)
        min_dim = min(width, height)
        crop_size = int(min_dim * crop_size_ratio)

        # Ensure crop_size is at least a reasonable size
        crop_size = max(crop_size, min(500, min_dim))

        # Calculate crop center position
        # Position the face in the upper third of the frame (rule of thirds)
        # Face should be around 33-40% from top for professional headshot look
        center_x = int(face_x * width)

        # Start with face center, then shift crop DOWN slightly
        # so face ends up in upper portion of final image
        # This leaves headroom above AND includes shoulders below
        # Positive shift = crop center moves down = face appears higher in crop
        vertical_offset = int(crop_size * 0.05)  # Small 5% shift down
        center_y = int(face_y * height) + vertical_offset

        # Calculate crop bounds
        half_crop = crop_size // 2
        left = center_x - half_crop
        top = center_y - half_crop
        right = left + crop_size
        bottom = top + crop_size

        # Adjust bounds to stay within image
        if left < 0:
            right -= left  # shift right
            left = 0
        if top < 0:
            bottom -= top  # shift down
            top = 0
        if right > width:
            left -= (right - width)  # shift left
            right = width
        if bottom > height:
            top -= (bottom - height)  # shift up
            bottom = height

        # Final bounds check
        left = max(0, left)
        top = max(0, top)
        right = min(width, right)
        bottom = min(height, bottom)

        # Ensure we get a square crop (adjust if image is smaller than crop_size)
        actual_width = right - left
        actual_height = bottom - top
        final_size = min(actual_width, actual_height)

        # Re-center if we had to shrink
        if actual_width > final_size:
            left += (actual_width - final_size) // 2
        if actual_height > final_size:
            top += (actual_height - final_size) // 2

        right = left + final_size
        bottom = top + final_size

        crop_info["crop_bounds"] = {
            "left": left,
            "top": top,
            "right": right,
            "bottom": bottom
        }

        img = img.crop((left, top, right, bottom))

    # Resize to output size
    img = img.resize((output_size, output_size), Image.Resampling.LANCZOS)
    crop_info["output_size"] = output_size

    # Save to bytes
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=95)
    output.seek(0)

    return output.getvalue(), crop_info


def get_image_dimensions(image_data: bytes) -> Tuple[int, int]:
    """Get width and height of an image."""
    img = Image.open(io.BytesIO(image_data))
    return img.size
