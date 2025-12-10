from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    openai_api_key: str
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Frontend URL for CORS (set in production to your Railway frontend URL)
    frontend_url: Optional[str] = None

    # Iframe embedding - space-separated list of allowed origins (e.g., "https://example.com https://other.com")
    # Leave empty to allow all origins (*)
    allowed_iframe_origins: Optional[str] = None

    # Hive API settings
    hive_api_key: str = "27330f26c1337418cbb8c23d6aee57ef"
    hive_user_id: str = "QhXfxx5zkav6NFmiA"
    hive_workspace_id: str = "MvJ2A7jmTiCJcheoM"
    hive_default_project_id: str = "YzWwuHSKwqri9z8QS"  # Marcomms Service Requests

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",")]
        # Add frontend_url if set (for production)
        if self.frontend_url:
            origins.append(self.frontend_url)
        return origins

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
