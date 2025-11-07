"""
Aplicación Flask Unificada - Chatbot con IA + CRUD de Posts
Combina el frontend del chatbot y la API REST con el CRUD de posts
"""
import requests
from flask import Flask, render_template, request, redirect, url_for, abort, jsonify, flash, session
from flask_cors import CORS
from chat_service import ChatService
from roles import RolePreset
from config import settings

# Configuración de la aplicación Flask
app = Flask(__name__, 
            template_folder='webapp/templates',
            static_folder='webapp/static')
app.secret_key = 'tu_clave_secreta_para_flash_messages_123'  # Para mensajes flash
CORS(app)

# Configuración de la API externa para posts (desde .env)
API_BASE_URL = settings.api_base_url

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
# RUTAS DEL CRUD DE POSTS
# ============================================

def manejar_error_api(response):
    """
    Verifica si la respuesta de la API fue exitosa.
    Si no, aborta con el código de error.
    """
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            abort(404, description="Recurso no encontrado en la API externa")
        else:
            print(f"Error en la API: {e}")
            abort(500, description="Error al conectar con la API externa.")
    except requests.exceptions.RequestException as e:
        print(f"Error de conexión: {e}")
        abort(503, description="No se pudo conectar con la API externa.")


@app.route("/posts")
def listar_posts():
    """Lista todos los posts desde la API externa"""
    response = requests.get(f"{API_BASE_URL}/posts")
    manejar_error_api(response)
    posts = response.json()
    return render_template("posts.html", posts=posts)


@app.route("/posts/<int:post_id>")
def detalle_post(post_id):
    """Muestra el detalle de un post específico"""
    response = requests.get(f"{API_BASE_URL}/posts/{post_id}")
    manejar_error_api(response)
    post = response.json()
    return render_template("post_detalle.html", post=post)


@app.route("/posts/crear", methods=["GET", "POST"])
def crear_post():
    """Crear un nuevo post"""
    if request.method == "POST":
        nuevo_post = {
            "title": request.form.get("title"),
            "body": request.form.get("body"),
            "userId": 1
        }
        
        response = requests.post(f"{API_BASE_URL}/posts", json=nuevo_post)
        manejar_error_api(response)
        
        # Imprimir en consola para verificar
        post_creado = response.json()
        print(f"✅ Post creado exitosamente! ID: {post_creado.get('id')}")
        print(f"   Título: {post_creado.get('title')}")
        print(f"   Respuesta completa: {post_creado}")
        
        # Mensaje flash para mostrar en el navegador
        flash(f'✅ Post "{nuevo_post["title"]}" creado exitosamente! (ID: {post_creado.get("id")}) - Nota: JSONPlaceholder no guarda datos realmente.', 'success')
        
        return redirect(url_for("listar_posts"))
    
    return render_template("crear_post.html")


@app.route("/posts/<int:post_id>/editar", methods=["GET", "POST"])
def editar_post(post_id):
    """Editar un post existente"""
    if request.method == "POST":
        post_actualizado = {
            "title": request.form.get("title"),
            "body": request.form.get("body"),
            "userId": 1
        }
        
        response = requests.put(f"{API_BASE_URL}/posts/{post_id}", json=post_actualizado)
        manejar_error_api(response)
        
        # Mensaje de confirmación
        flash(f'✅ Post "{post_actualizado["title"]}" editado exitosamente!', 'success')
        
        return redirect(url_for("detalle_post", post_id=post_id))
    
    # GET: obtener el post actual
    response = requests.get(f"{API_BASE_URL}/posts/{post_id}")
    manejar_error_api(response)
    post = response.json()
    return render_template("editar_post.html", post=post)


@app.route("/posts/<int:post_id>/eliminar", methods=["POST"])
def eliminar_post(post_id):
    """Eliminar un post"""
    response = requests.delete(f"{API_BASE_URL}/posts/{post_id}")
    manejar_error_api(response)
    
    # Log en consola
    print(f"🗑️ DELETE enviado para post ID: {post_id}")
    print(f"   Status code: {response.status_code}")
    print(f"   Respuesta: {response.json() if response.text else 'vacío'}")
    
    # Mensaje de confirmación
    flash(f'✅ Post eliminado exitosamente! (ID: {post_id}) - Nota: JSONPlaceholder no elimina datos realmente.', 'success')
    
    return redirect(url_for("listar_posts"))


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
    print("🚀 Iniciando aplicación Flask unificada...")
    print("=" * 60)
    print("📍 Chat con IA: http://127.0.0.1:5000/")
    print("📍 CRUD Posts: http://127.0.0.1:5000/posts")
    print("📍 API Chat: POST http://127.0.0.1:5000/api/chat")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=True)
