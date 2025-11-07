import time
import os
from typing import Dict, List, Optional
from google import genai
from config import settings

class GeminiClient:
    def __init__(self, api_key: str, model_name: str):
        if not api_key:
            raise ValueError("GEMINI_API_KEY no está configurada.")
        if not model_name:
            raise ValueError("MODEL no está configurado en las variables de entorno.")
        # Configurar la API key como variable de entorno para genai
        os.environ["GOOGLE_API_KEY"] = api_key
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name
        
    def generate(
        self,
        system_prompt: str,
        history: List[Dict[str, str]],
        user_message: str,
        max_retries: int,
        timeout_seconds: int
    ) -> str:
        attempt = 0
        last_error: Optional[Exception] = None
        
        # Construir el prompt completo con el sistema y el historial
        full_prompt = f"{system_prompt}\n\n"
        for msg in history:
            role_label = "Usuario" if msg["role"] == "user" else "Asistente"
            full_prompt += f"{role_label}: {msg['content']}\n"
        full_prompt += f"Usuario: {user_message}\nAsistente:"
        
        while attempt < max_retries:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt
                )
                text = response.text.strip()
                if not text:
                    raise RuntimeError("Respuesta vacía del modelo.")
                return text
            except Exception as e:
                last_error = e
                sleep_s = 2 ** attempt
                time.sleep(sleep_s)
                attempt += 1
        raise RuntimeError(f"Fallo tras {max_retries} reintentos. Último error: {last_error}")