from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional


class SlideMetadata(BaseModel):
    """Model for slide metadata fields with validation"""

    headline: str = Field(
        ...,
        min_length=1,
        max_length=80,
        description="Title summarizing topic"
    )

    caption: Optional[str] = Field(
        None,
        max_length=60,
        description="Contextual note"
    )

    description: str = Field(
        ...,
        min_length=1,
        max_length=300,
        description="Summary/blurb"
    )

    author_name: Optional[str] = Field(
        None,
        max_length=60,
        description="Faculty, Researcher, PhD student"
    )

    publication_link: Optional[HttpUrl] = Field(
        None,
        description="Link to paper or article"
    )

    @field_validator('headline')
    @classmethod
    def validate_headline(cls, v: str) -> str:
        if len(v) > 80:
            raise ValueError('Headline must be 80 characters or less')
        return v.strip()

    @field_validator('caption')
    @classmethod
    def validate_caption(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v) > 60:
            raise ValueError('Caption must be 60 characters or less')
        return v.strip() if v else None

    @field_validator('description')
    @classmethod
    def validate_description(cls, v: str) -> str:
        if len(v) > 300:
            raise ValueError('Description must be 300 characters or less')
        return v.strip()

    @field_validator('author_name')
    @classmethod
    def validate_author_name(cls, v: Optional[str]) -> Optional[str]:
        if v and len(v) > 60:
            raise ValueError('Author name must be 60 characters or less')
        return v.strip() if v else None
