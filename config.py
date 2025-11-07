from dataclasses import dataclass
import os
from dotenv import load_dotenv


load_dotenv()

@dataclass(frozen=True)
class Settings:
    api_key: str = os.getenv("GEMINI_API_KEY","")
    model: str = os.getenv("MODEL","")
    max_retries: int = int(os.getenv("MAX_RETRIES","3"))
    timeout_seconds: int = int(os.getenv("TIMEOUT_SECONDS","30"))
    max_history_messages: int = int(os.getenv("MAX_HISTORY","12"))
    system_name: str = os.getenv("SYSTEM_NAME", "Chatbot Gemini")
    api_base_url: str = os.getenv("API_BASE_URL", "https://jsonplaceholder.typicode.com")

settings = Settings()