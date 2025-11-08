"""
Aplicación Flask Unificada - Chatbot con IA + Noticias
Combina el frontend del chatbot con integración de NewsAPI
"""
import requests
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from chat_service import ChatService
from roles import RolePreset
from config import settings

# Configuración de la aplicación Flask
app = Flask(__name__, 
            template_folder='webapp/templates',
            static_folder='webapp/static')
CORS(app)

# Inicializar el servicio de chat
chat_service = ChatService(role=RolePreset.ASISTENTE)

# ============================================
# RUTAS DEL CHATBOT
# ============================================

@app.route("/")
def index_chat():
    """Página principal - Chat con IA"""
    return render_template("chat.html")

@app.route("/api/chat", methods=["POST"])
def chat_endpoint():
    """
    Endpoint de la API REST para el chat con IA
    Recibe: { "mensaje": str, "role": str, "reset": bool }
    Devuelve: { "respuesta": str }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        mensaje = data.get("mensaje", "").strip()
        role = data.get("role", "asistente").lower()
        reset = data.get("reset", False)
        
        # Validar mensaje
        if not mensaje:
            return jsonify({"error": "El mensaje no puede estar vacío"}), 400
        
        # Reset si se solicita
        if reset:
            chat_service.reset()
        
        # Mapear el rol de string a RolePreset
        role_mapping = {
            "profesor": RolePreset.PROFESOR,
            "traductor": RolePreset.TRADUCTOR,
            "programador": RolePreset.PROGRAMADOR,
            "asistente": RolePreset.ASISTENTE,
            "redactor": RolePreset.REDACTOR,
            "coach_carrera": RolePreset.COACH_CARRERA,
        }
        
        if role in role_mapping:
            chat_service.set_role(role_mapping[role])
        else:
            return jsonify({
                "error": f"Rol inválido. Opciones: {', '.join(role_mapping.keys())}"
            }), 400
        
        # Obtener respuesta del chatbot
        respuesta = chat_service.ask(mensaje)
        
        return jsonify({"respuesta": respuesta}), 200
        
    except Exception as e:
        import traceback
        print(f"❌ Error en chat_endpoint: {str(e)}")
        print(f"❌ Traceback completo:")
        traceback.print_exc()
        return jsonify({"error": f"Error al procesar la solicitud: {str(e)}"}), 500


# ============================================
# RUTAS DE NOTICIAS (NewsAPI)
# ============================================

@app.route("/noticias")
def noticias():
    """Página de noticias - Lista todas las noticias"""
    return render_template("noticias.html")

@app.route("/api/noticias")
def api_noticias():
    """
    Endpoint para obtener noticias desde NewsAPI
    Query params: ?country=us&category=technology
    """
    try:
        # Parámetros opcionales
        country = request.args.get('country', 'us')  # Por defecto: USA
        category = request.args.get('category', 'general')  # general, business, technology, etc.
        
        # Verificar que haya API key
        if not settings.news_api_key or settings.news_api_key == "tu_api_key_aqui":
            return jsonify({
                "error": "API key no configurada",
                "message": "Por favor configura NEWS_API_KEY en el archivo .env"
            }), 500
        
        # Construir URL de NewsAPI
        url = f"https://newsapi.org/v2/top-headlines?country={country}&category={category}&apiKey={settings.news_api_key}"
        
        # Hacer petición a NewsAPI
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            return jsonify({
                "error": "Error al obtener noticias",
                "status_code": response.status_code,
                "message": response.text
            }), response.status_code
            
    except requests.exceptions.Timeout:
        return jsonify({"error": "Timeout al consultar NewsAPI"}), 504

# ============================================
# MANEJO DE ERRORES
# ============================================

@app.errorhandler(404)
def error_404(error):
    return render_template("base.html", content=f"<h2>404 - Página no encontrada</h2><p>{error.description}</p>"), 404


@app.errorhandler(500)
def error_500(error):
    return render_template("base.html", content=f"<h2>500 - Error del servidor</h2><p>{error.description}</p>"), 500


@app.errorhandler(503)
def error_503(error):
    return render_template("base.html", content=f"<h2>503 - Servicio no disponible</h2><p>{error.description}</p>"), 503


# ============================================
# PUNTO DE ENTRADA
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Iniciando Chatbot con IA...")
    print("=" * 60)
    print("📍 Asistente IA: http://127.0.0.1:5000/")
    print("📍 Noticias: http://127.0.0.1:5000/noticias")
    print("📍 API Chat: POST http://127.0.0.1:5000/api/chat")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=True)
