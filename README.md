# chat-bot-final
# 🤖 Chatbot con IA - API REST & Frontend

## 📝 Descripción del Proyecto

Este proyecto es una aplicación web completa que combina un **chatbot inteligente** con capacidades de IA (usando Google Gemini) y un **sistema CRUD de posts** consumiendo una API REST externa (JSONPlaceholder). 

La aplicación permite:
- 💬 Interactuar con un chatbot que puede asumir diferentes roles (Asistente, Profesor, Traductor, Programador)
- 📚 Gestionar posts mediante operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
- 🔄 Consumir y mostrar datos de una API REST externa
- 💾 Mantener el historial de conversaciones usando localStorage

---

## 👥 Roles y Contribuciones

**Desarrollador:** Yamila Anahí Martínez
- **Rol:** Full Stack Developer
- **Tareas Realizadas:**
  - ✅ Implementación del backend con Flask
  - ✅ Desarrollo de la API REST `/api/chat` para el chatbot
  - ✅ Integración con Google Gemini API para procesamiento de lenguaje natural
  - ✅ Sistema de gestión de memoria y contexto de conversación
  - ✅ Implementación de diferentes roles para el chatbot (Profesor, Traductor, Programador, Asistente)
  - ✅ Desarrollo del frontend con HTML, CSS (Bootstrap) y JavaScript vanilla
  - ✅ Implementación del CRUD de posts consumiendo JSONPlaceholder API
  - ✅ Sistema de manejo de errores y validaciones
  - ✅ Diseño responsive de la interfaz de usuario

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Python 3.x** - Lenguaje de programación principal
- **Flask 3.0+** - Framework web para el backend
- **Flask-CORS** - Manejo de políticas CORS
- **Google Generative AI (Gemini)** - Modelo de IA para el chatbot
- **Requests** - Cliente HTTP para consumir APIs externas
- **Python-dotenv** - Gestión de variables de entorno
- **Pydantic** - Validación de datos

### Frontend
- **HTML5** - Estructura de las páginas
- **CSS3** - Estilos personalizados
- **Bootstrap 5.3** - Framework CSS para diseño responsive
- **JavaScript (ES6+)** - Lógica del cliente
- **LocalStorage API** - Persistencia de datos en el navegador

### APIs Externas
- **Google Gemini API** - Procesamiento de lenguaje natural
- **JSONPlaceholder** - API REST de prueba para CRUD de posts

---

## 📁 Estructura del Proyecto

```
chat-bot-prueba/
├── app_unified.py          # ⭐ Aplicación Flask principal UNIFICADA
├── chat_service.py         # Servicio de lógica del chatbot
├── llm_client.py           # Cliente para comunicarse con Gemini
├── config.py               # Configuración y variables de entorno
├── roles.py                # Definición de roles del chatbot
├── prompts.py              # Generación de prompts del sistema
├── memory.py               # Gestión de memoria/historial de chat
├── requirements.txt        # Dependencias de Python
├── .env                    # Variables de entorno (NO subir a Git)
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore              # Archivos ignorados por Git
├── README.md               # Este archivo
│
└── webapp/                 # Frontend de la aplicación
    ├── __init__.py
    ├── static/
    │   ├── css/
    │   │   └── app.css     # Estilos personalizados
    │   └── js/
    │       └── app.js      # Lógica del frontend del chat
    └── templates/          # Plantillas HTML
        ├── base.html       # Template base con navbar
        ├── chat.html       # Interfaz del chatbot
        ├── posts.html      # Lista de posts
        ├── post_detalle.html
        ├── crear_post.html
        └── editar_post.html
```

---

## 🚀 Guía de Instalación y Ejecución

### Prerrequisitos

- Python 3.8 o superior instalado
- Una API Key de Google Gemini 
- Git instalado (para clonar el repositorio)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/YamilaMartinez1990/chat-bot-final.git
cd chat-bot-final
```

### Paso 2: Crear un Entorno Virtual

**En Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**En Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Paso 3: Instalar Dependencias

```bash
pip install -r requirements.txt
```

### Paso 4: Configurar Variables de Entorno

1. Copiar el archivo de ejemplo:
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

2. Editar el archivo `.env` y agregar API Key de Gemini:
   ```env
   GEMINI_API_KEY=tu_api_key_real_aqui
   MODEL=gemini-1.5-flash
   MAX_RETRIES=3
   TIMEOUT_SECONDS=30
   MAX_HISTORY=12
   SYSTEM_NAME=Chatbot Gemini
   ```

### Paso 5: Ejecutar la Aplicación

**Aplicación Unificada:**
```bash
python app_unified.py
```

La aplicación estará disponible en:
- 🏠 **Página Principal (Chat):** http://127.0.0.1:5000/
- 📚 **CRUD de Posts:** http://127.0.0.1:5000/posts
- 🔌 **API del Chat:** POST http://127.0.0.1:5000/api/chat

---

## 📖 Uso de la Aplicación

### 💬 Chatbot

1. Acceder a http://127.0.0.1:5000/
2. Seleccionar un rol para el chatbot (Asistente, Profesor, Traductor, Programador)
3. Escribir un mensaje en el campo de texto
4. Presionar "Enviar" o Enter
5. Esperar la respuesta del chatbot
6. El historial se guarda automáticamente en el navegador

**Roles disponibles:**
- **Asistente**: Ayudante general para cualquier consulta
- **Profesor**: Explica conceptos de forma didáctica
- **Traductor**: Traduce texto entre diferentes idiomas
- **Programador**: Ayuda con código y problemas de programación

### 📝 CRUD de Posts

1. Acceder a http://127.0.0.1:5000/posts
2. **Ver posts**: Lista todos los posts disponibles
3. **Ver detalle**: Click en "Ver" para ver el detalle completo
4. **Crear**: Click en "Crear Nuevo Post" y completar el formulario
5. **Editar**: Click en "Editar" en el detalle de un post
6. **Eliminar**: Click en "Eliminar" en el detalle de un post

---

## 🔌 API REST del Chatbot

### Endpoint: `/api/chat`

**Método:** POST

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "mensaje": "Hola, ¿cómo estás?",
  "role": "asistente",
  "reset": false
}
```

**Parámetros:**
- `mensaje` (string, requerido): El mensaje del usuario
- `role` (string, opcional): Rol del chatbot (`asistente`, `profesor`, `traductor`, `programador`)
- `reset` (boolean, opcional): Si es `true`, reinicia la conversación

**Respuesta exitosa (200):**
```json
{
  "respuesta": "¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?"
}
```

**Respuesta de error (400):**
```json
{
  "error": "El mensaje no puede estar vacío"
}
```

### Ejemplo con cURL:

```bash
curl -X POST http://127.0.0.1:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mensaje": "Explícame qué es Python", "role": "profesor"}'
```

### Ejemplo con JavaScript (Fetch):

```javascript
fetch('http://127.0.0.1:5000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mensaje: '¿Qué es Python?',
    role: 'profesor',
    reset: false
  })
})
.then(response => response.json())
.then(data => console.log(data.respuesta))
.catch(error => console.error('Error:', error));
```

---

## 🧪 Características Implementadas

### Backend
- ✅ Endpoint `/api/chat` para el chatbot
- ✅ Sistema de roles intercambiables
- ✅ Gestión de memoria/contexto de conversación
- ✅ Manejo de errores y validaciones
- ✅ Integración con Google Gemini API
- ✅ CRUD completo de posts consumiendo API externa
- ✅ Manejo de errores HTTP (404, 500, 503)

### Frontend
- ✅ Interfaz de chat moderna y responsive
- ✅ Selector de roles en tiempo real
- ✅ Indicador de "escribiendo..." mientras espera respuesta
- ✅ Persistencia del historial en localStorage
- ✅ Botón para limpiar conversación
- ✅ Toasts/notificaciones de Bootstrap
- ✅ Navegación entre Chat y Posts
- ✅ Formularios para crear/editar posts
- ✅ Diseño responsive con Bootstrap

---

## 🐛 Solución de Problemas

### Error: "No module named 'flask'"
**Solución:** Asegurarse de tener el entorno virtual activado e instalar dependencias:
```bash
pip install -r requirements.txt
```

### Error: "GEMINI_API_KEY not found"
**Solución:** Verificar que el archivo `.env` existe y contiene la API Key correcta.

### Error: "Connection refused" al acceder a la API
**Solución:** Verificar que el servidor Flask está corriendo en el puerto 5000.

### El chatbot no responde
**Solución:** 
1. Verificar la API Key de Gemini en `.env`
2. Revisar la consola del servidor para ver errores
3. Verificar conexión a internet

---

## 📦 Archivos Importantes

### `app_unified.py` ⭐
Archivo principal que ejecuta toda la aplicación. Combina el chatbot y el CRUD de posts.

### `chat_service.py`
Lógica del servicio de chat: gestiona roles, memoria e interacción con el modelo de IA.

### `config.py`
Configuración centralizada usando variables de entorno.

### `roles.py`
Define los diferentes roles que puede asumir el chatbot.

### `llm_client.py`
Cliente que se comunica con la API de Google Gemini.

### `memory.py`
Sistema de gestión de memoria para mantener el contexto de la conversación.

---

## 🔒 Seguridad

- ⚠️ **NUNCA** subir el archivo `.env` al repositorio
- ⚠️ Agregar `.env` al archivo `.gitignore`
- ⚠️ Usar siempre variables de entorno para información sensible
- ⚠️ En producción, usar HTTPS y validar todas las entradas del usuario

---

## 📚 Recursos y Referencias

- [Documentación de Flask](https://flask.palletsprojects.com/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/)

---

## 📝 Notas Adicionales

- El CRUD de posts usa la API de JSONPlaceholder, que es una API de prueba. Los cambios no se persisten realmente en un servidor.
- El historial del chat se guarda en el navegador (localStorage), no en el servidor.
- Para cambiar el modelo de IA, modificar la variable `MODEL` en el archivo `.env`.

---

## 🎓 Créditos

Proyecto desarrollado como trabajo práctico final para Arquitectura y diseño de Interfaces.

**Desarrollado por:** Yamila Anahí Martínez 
**Fecha:** Noviembre 2025  
**Tecnologías:** Python, Flask, JavaScript, Google Gemini API

---

## 📄 Licencia

Este proyecto es de uso educativo.

---

¿Preguntas o problemas? Contactar a:yamilauncuyo2024@gmail.com
