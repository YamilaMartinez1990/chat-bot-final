from typing import List, Dict
def build_system_prompt(role_instructions: str) ->str:
    base = (
        "Sos un chatbot de consola que responde en español de forma clara y ùtil"
        "Si el usuario pide còdigo,incluì explicaciones breves."
        "Evità informaciòn inventada y pedì aclaraciones si faltan datos"
    )
    return base + f"Contexto de rol: {role_instructions}"

def collapse_history(history: List[Dict[str, str]]) -> List[Dict[str, str]]:
    return history
    
