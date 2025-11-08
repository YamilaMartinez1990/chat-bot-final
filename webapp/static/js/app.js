// webapp/static/js/app.js
(function () {
  // --------------------------
  // Utilidades
  // --------------------------
  const $ = (sel) => document.querySelector(sel);
  const formatTime = (d = new Date()) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // --------------------------
  // Store (LocalStorage)
  // --------------------------
  const Store = {
    KEY_MESSAGES: "cg_chat_messages",
    KEY_ROLE: "cg_chat_role",
    getMessages() {
      try {
        return JSON.parse(localStorage.getItem(this.KEY_MESSAGES) || "[]");
      } catch {
        return [];
      }
    },
    setMessages(list) {
      localStorage.setItem(this.KEY_MESSAGES, JSON.stringify(list));
    },
    addMessage(msg) {
      const list = this.getMessages();
      list.push(msg);
      this.setMessages(list);
    },
    clear() {
      localStorage.removeItem(this.KEY_MESSAGES);
    },
    getRole() {
      return localStorage.getItem(this.KEY_ROLE) || "asistente";
    },
    setRole(role) {
      localStorage.setItem(this.KEY_ROLE, role);
    },
  };

  // --------------------------
  // Mock del “modelo”
  // --------------------------
  // LLM real usando API REST
  const LLMApi = {
    async reply(userText, role) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mensaje: userText,
            role: role,
            reset: false
          })
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || error.detail || "Error en la API");
        }
        const data = await response.json();
        return data.respuesta;
      } catch (err) {
        return "Error: " + err.message;
      }
    }
  };

  // --------------------------
  // Toast helper (Bootstrap)
  // --------------------------
  function showToast(msg) {
    const toastEl = $("#app-toast");
    const bodyEl = $("#app-toast-body");
    if (!toastEl || !bodyEl) return;
    bodyEl.textContent = msg;
    const t = new bootstrap.Toast(toastEl, { delay: 2200 });
    t.show();
  }

  // --------------------------
  // ChatUI
  // --------------------------
  const ChatUI = {
    els: {
      body: $("#chatBody"),
      form: $("#chatForm"),
      input: $("#chatInput"),
      btnSend: $("#btnSend"),
      btnClear: $("#btnClear"),
      roleButtons: null, // Se inicializa después
      currentRoleBadge: $("#currentRole"),
    },

    // Mensajes de bienvenida según rol
    welcomeMessages: {
      asistente: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      profesor: "¡Bienvenido! Soy tu profesor virtual. Estoy aquí para explicarte cualquier tema de forma didáctica. ¿Qué te gustaría aprender?",
      traductor: "¡Hola! Soy tu traductor personal. Puedo ayudarte a traducir texto entre diferentes idiomas. ¿Qué necesitas traducir?",
      programador: "¡Hola! Soy tu asistente de programación. Puedo ayudarte con código, debugging y conceptos de programación. ¿En qué estás trabajando?",
      redactor: "¡Hola! Soy tu redactor profesional. Puedo ayudarte a redactar emails, cartas, documentos formales, mejorar textos y corregir gramática. ¿Qué necesitas redactar o mejorar?",
      coach_carrera: "¡Hola! Soy tu coach de carrera. Puedo ayudarte con tu CV, preparación para entrevistas, orientación laboral y desarrollo profesional. ¿En qué área de tu carrera necesitas ayuda?"
    },

    init() {
      // Inicializar elementos
      this.els.roleButtons = document.querySelectorAll(".role-btn");
      
      // Establecer rol guardado
      const savedRole = Store.getRole();
      this.setActiveRole(savedRole);
      
      this.bindEvents();
      this.renderAll(Store.getMessages());
      this.scrollToEnd();
      
      // Mensaje de bienvenida inicial
      if (Store.getMessages().length === 0) {
        this.pushBot(this.welcomeMessages[savedRole]);
      }
    },

    bindEvents() {
      // Enviar mensaje
      this.els.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSend();
      });

      // Limpiar chat
      this.els.btnClear.addEventListener("click", () => {
        Store.clear();
        this.els.body.innerHTML = "";
        const currentRole = Store.getRole();
        this.pushBot(this.welcomeMessages[currentRole]);
      });

      // Botones de roles
      this.els.roleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const newRole = btn.getAttribute("data-role");
          this.changeRole(newRole);
        });
      });
    },

    changeRole(newRole) {
      // Guardar nuevo rol
      Store.setRole(newRole);
      
      // Actualizar UI
      this.setActiveRole(newRole);
      
      // Resetear chat y mostrar mensaje de bienvenida
      Store.clear();
      this.els.body.innerHTML = "";
      this.pushBot(this.welcomeMessages[newRole]);
      
      // Toast de confirmación
      const roleNames = {
        asistente: "Asistente",
        profesor: "Profesor",
        traductor: "Traductor",
        programador: "Programador",
        redactor: "Redactor Profesional",
        coach_carrera: "Coach de Carrera"
      };
      showToast(`Rol cambiado a: ${roleNames[newRole]}`);
    },

    setActiveRole(role) {
      // Remover clase active de todos los botones
      this.els.roleButtons.forEach((btn) => {
        btn.classList.remove("active");
      });
      
      // Agregar clase active al botón seleccionado
      const activeBtn = document.querySelector(`.role-btn[data-role="${role}"]`);
      if (activeBtn) {
        activeBtn.classList.add("active");
      }
      
      // Actualizar badge en el header
      const roleNames = {
        asistente: "Asistente",
        profesor: "Profesor",
        traductor: "Traductor",
        programador: "Programador",
        redactor: "Redactor",
        coach_carrera: "Coach Carrera"
      };
      if (this.els.currentRoleBadge) {
        this.els.currentRoleBadge.textContent = roleNames[role];
      }
    },

    async handleSend() {
      const text = (this.els.input.value || "").trim();
      if (!text) return;

      // Pintar mensaje del usuario
      this.pushUser(text);
      this.els.input.value = "";
      this.scrollToEnd();

      // “Escribiendo…”
      const typingId = this.pushTyping();

  // Llamada real a la API
  const role = Store.getRole();
  const reply = await LLMApi.reply(text, role);

      // Remplazar “typing…” y pintar respuesta
      this.removeTyping(typingId);
      this.pushBot(reply);
      this.scrollToEnd();
    },

    pushUser(text) {
      const msg = { role: "user", text, time: formatTime() };
      Store.addMessage(msg);
      this.renderMessage(msg);
    },

    pushBot(text) {
      const msg = { role: "bot", text, time: formatTime() };
      Store.addMessage(msg);
      this.renderMessage(msg);
    },

    pushTyping() {
      const id = `typing-${Date.now()}`;
      const wrap = document.createElement("div");
      wrap.className = "message bot";
      wrap.id = id;
      wrap.innerHTML = `
        <div>
          <span class="typing"></span>
          <span class="typing"></span>
          <span class="typing"></span>
        </div>
        <small>${formatTime()}</small>
      `;
      this.els.body.appendChild(wrap);
      return id;
    },

    removeTyping(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    },

    renderAll(list) {
      this.els.body.innerHTML = "";
      list.forEach((m) => this.renderMessage(m));
    },

    renderMessage({ role, text, time }) {
      const div = document.createElement("div");
      div.className = `message ${role}`;
      
      // Procesar markdown si es un mensaje del bot
      const processedText = role === "bot" ? formatMarkdown(text) : escapeHtml(text);
      
      div.innerHTML = `
        <div>${processedText}</div>
        <small>${role === "user" ? "Vos" : "Bot"} • ${time}</small>
      `;
      this.els.body.appendChild(div);
      
      // Scroll automático al final
      ScrollManager.scrollToBottom();
    },

    scrollToEnd() {
      ScrollManager.scrollToBottom();
    },
  };

  // Seguridad básica para inyectar texto
  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\n", "<br>");
  }

  // Procesar Markdown básico
  function formatMarkdown(str) {
    // Escapar HTML primero
    let formatted = escapeHtml(str);
    
    // Convertir negritas: **texto** o ***texto***
    formatted = formatted.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convertir cursivas: *texto*
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Convertir código inline: `código`
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convertir listas con bullets (- item)
    formatted = formatted.replace(/^- (.+)$/gm, '• $1');
    
    return formatted;
  }

  // --------------------------
  // THEME TOGGLE (Modo Oscuro)
  // --------------------------
  const ThemeManager = {
    KEY: 'cg_theme',
    
    init() {
      const savedTheme = localStorage.getItem(this.KEY) || 'light';
      this.setTheme(savedTheme);
      
      const toggleBtn = $('#themeToggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggle());
      }
    },
    
    setTheme(theme) {
      document.documentElement.setAttribute('data-bs-theme', theme);
      localStorage.setItem(this.KEY, theme);
      this.updateIcon(theme);
    },
    
    toggle() {
      const current = document.documentElement.getAttribute('data-bs-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    },
    
    updateIcon(theme) {
      const icon = $('#themeToggle i');
      if (!icon) return;
      
      if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill';
      } else {
        icon.className = 'bi bi-moon-fill';
      }
    }
  };

  // --------------------------
  // SCROLL TO BOTTOM
  // --------------------------
  const ScrollManager = {
    init() {
      const chatBody = $('#chatBody');
      const scrollBtn = $('#scrollToBottom');
      
      if (!chatBody || !scrollBtn) return;
      
      // Mostrar/ocultar botón según scroll
      chatBody.addEventListener('scroll', () => {
        const isNearBottom = chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < 100;
        
        if (isNearBottom) {
          scrollBtn.classList.remove('show');
        } else {
          scrollBtn.classList.add('show');
        }
      });
      
      // Click en el botón
      scrollBtn.addEventListener('click', () => {
        chatBody.scrollTo({
          top: chatBody.scrollHeight,
          behavior: 'smooth'
        });
      });
    },
    
    scrollToBottom() {
      const chatBody = $('#chatBody');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }
  };

  // --------------------------
  // CHARACTER COUNTER
  // --------------------------
  const CharCounter = {
    MAX_CHARS: 500,
    
    init() {
      const input = $('#chatInput');
      const counter = $('#charCounter');
      
      if (!input || !counter) return;
      
      input.addEventListener('input', () => {
        this.update(input.value.length, counter);
      });
    },
    
    update(length, counterEl) {
      counterEl.textContent = `${length} / ${this.MAX_CHARS}`;
      
      // Cambiar color según el porcentaje
      const percentage = (length / this.MAX_CHARS) * 100;
      
      counterEl.classList.remove('warning', 'danger');
      
      if (percentage >= 90) {
        counterEl.classList.add('danger');
      } else if (percentage >= 75) {
        counterEl.classList.add('warning');
      }
    }
  };

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    ChatUI.init();
    ThemeManager.init();
    ScrollManager.init();
    CharCounter.init();
  });
})();