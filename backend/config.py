from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    openai_api_key: str
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Hive API settings
    hive_api_key: str = "27330f26c1337418cbb8c23d6aee57ef"
    hive_user_id: str = "QhXfxx5zkav6NFmiA"
    hive_workspace_id: str = "MvJ2A7jmTiCJcheoM"
    hive_default_project_id: str = "YzWwuHSKwqri9z8QS"  # Marcomms Service Requests

    # Legacy SlideSpeak settings (kept for backwards compatibility, not used)
    slidespeak_api_key: Optional[str] = None
    slidespeak_base_url: str = "https://api.slidespeak.co/api/v1"
    slidespeak_template_id: str = "cm6iali9y000njl03qw4hvuk3"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
