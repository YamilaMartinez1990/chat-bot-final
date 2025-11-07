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
      role: $("#roleSelect"),
    },

    init() {
      // Rol guardado
      this.els.role.value = Store.getRole();
      this.bindEvents();
      this.renderAll(Store.getMessages());
      this.scrollToEnd();
      if (Store.getMessages().length === 0) {
        this.pushBot("¡Hola! ¿Cómo puedo ayudarte hoy?");
      }
    },

    bindEvents() {
      this.els.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSend();
      });

      this.els.btnClear.addEventListener("click", () => {
        Store.clear();
        this.els.body.innerHTML = "";
        this.pushBot("Memoria local borrada. Empecemos de nuevo.");
      });

      this.els.role.addEventListener("change", (e) => {
        Store.setRole(e.target.value);
        showToast(`Rol cambiado a: ${e.target.value}`);
      });
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
      div.innerHTML = `
        <div>${escapeHtml(text)}</div>
        <small>${role === "user" ? "Vos" : "Bot"} • ${time}</small>
      `;
      this.els.body.appendChild(div);
    },

    scrollToEnd() {
      this.els.body.scrollTop = this.els.body.scrollHeight;
    },
  };

  // Seguridad básica para inyectar texto
  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => ChatUI.init());
})();