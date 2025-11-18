from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    slidespeak_api_key: str
    openai_api_key: str
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    slidespeak_base_url: str = "https://api.slidespeak.co/api/v1"
    slidespeak_template_id: str = "cm6iali9y000njl03qw4hvuk3"  # Custom branded template

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
