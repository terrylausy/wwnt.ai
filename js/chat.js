/**
 * WWNT Robotics — AI Live Chat widget
 * Auto-injected on all pages via include.js.
 * Talks to the Netlify Function at /.netlify/functions/chat (DeepSeek proxy).
 */
(function () {
  "use strict";

  if (document.getElementById("wwnt-chat-widget")) return;

  /* ---------------- Build DOM ---------------- */
  const widget = document.createElement("div");
  widget.id = "wwnt-chat-widget";
  widget.innerHTML = `
    <button class="chat-bubble" id="chat-bubble" aria-label="Open AI chat">
      <svg class="chat-bubble-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <svg class="chat-bubble-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <span class="chat-bubble-pulse"></span>
    </button>

    <div class="chat-window" id="chat-window" role="dialog" aria-label="AI Live Chat" aria-hidden="true">
      <div class="chat-header">
        <div class="chat-header-info">
          <span class="chat-header-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="10" rx="2"/>
              <circle cx="12" cy="5" r="2"/>
              <path d="M12 7v4M8 16h.01M16 16h.01"/>
            </svg>
          </span>
          <div class="chat-header-text">
            <strong>WWNT Robotics</strong>
            <span class="chat-header-status">
              <span class="chat-status-dot"></span> AI Assistant · Online
            </span>
          </div>
        </div>
        <button class="chat-close" id="chat-close" aria-label="Close chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="chat-messages" id="chat-messages">
        <div class="chat-message chat-message-ai">
          <div class="chat-message-bubble">
            Hi! I'm the WWNT Robotics AI assistant. Ask me about our products, pricing, shipping, or technical support — I'm here 24/7.
          </div>
        </div>
        <div class="chat-quick-replies" id="chat-quick-replies">
          <button class="chat-quick-reply" data-q="How do I track my shipment?">Track my shipment</button>
          <button class="chat-quick-reply" data-q="What products do you offer?">Your products</button>
          <button class="chat-quick-reply" data-q="How do I request a quote?">Request a quote</button>
          <button class="chat-quick-reply" data-q="How do I use the open-source SDK?">Open-source SDK</button>
        </div>
      </div>

      <div class="chat-input-area">
        <form class="chat-input-form" id="chat-input-form">
          <input
            type="text"
            id="chat-input"
            class="chat-input"
            placeholder="Type your question..."
            autocomplete="off"
            aria-label="Type your question"
          />
          <button type="submit" class="chat-send" id="chat-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
        <p class="chat-disclaimer">AI-powered. For complex issues, email <a href="mailto:Support@wwntAI.com">Support@wwntAI.com</a>.</p>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  /* ---------------- State ---------------- */
  const bubble = document.getElementById("chat-bubble");
  const win = document.getElementById("chat-window");
  const closeBtn = document.getElementById("chat-close");
  const messagesEl = document.getElementById("chat-messages");
  const form = document.getElementById("chat-input-form");
  const input = document.getElementById("chat-input");
  const quickWrap = document.getElementById("chat-quick-replies");

  let conversation = [];
  let isOpen = false;
  let isSending = false;

  /* ---------------- Toggle ---------------- */
  function openChat() {
    isOpen = true;
    win.classList.add("is-open");
    win.setAttribute("aria-hidden", "false");
    bubble.classList.add("is-active");
    setTimeout(function () {
      input.focus();
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 250);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove("is-open");
    win.setAttribute("aria-hidden", "true");
    bubble.classList.remove("is-active");
  }

  bubble.addEventListener("click", function () {
    if (isOpen) closeChat();
    else openChat();
  });
  closeBtn.addEventListener("click", closeChat);

  /* ---------------- Rendering ---------------- */
  function addMessage(role, text) {
    const wrap = document.createElement("div");
    wrap.className = "chat-message chat-message-" + role;
    const bubbleEl = document.createElement("div");
    bubbleEl.className = "chat-message-bubble";
    bubbleEl.textContent = text;
    wrap.appendChild(bubbleEl);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubbleEl;
  }

  function addTyping() {
    const wrap = document.createElement("div");
    wrap.className = "chat-message chat-message-ai chat-typing";
    wrap.id = "chat-typing-indicator";
    wrap.innerHTML =
      '<div class="chat-message-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("chat-typing-indicator");
    if (t) t.remove();
  }

  function hideQuickReplies() {
    if (quickWrap) quickWrap.style.display = "none";
  }

  /* ---------------- Send ---------------- */
  async function send(text) {
    if (!text.trim() || isSending) return;
    isSending = true;
    hideQuickReplies();

    addMessage("user", text);
    conversation.push({ role: "user", content: text });

    input.value = "";
    input.disabled = true;
    addTyping();

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });

      removeTyping();

      if (!res.ok) {
        const errData = await res.json().catch(function () {
          return { error: "Request failed" };
        });
        if (res.status === 503) {
          addMessage(
            "ai",
            "I'm temporarily unavailable. Please email Support@wwntAI.com or call +1-662-681-4342 — we reply within 24 hours."
          );
        } else {
          addMessage(
            "ai",
            "Sorry, I couldn't process that. Please try again or reach us at Support@wwntAI.com."
          );
        }
      } else {
        const data = await res.json();
        const reply = data.reply || "Sorry, I didn't catch that.";
        addMessage("ai", reply);
        conversation.push({ role: "assistant", content: reply });
      }
    } catch (e) {
      removeTyping();
      addMessage(
        "ai",
        "Network issue — please check your connection and try again, or email Support@wwntAI.com."
      );
    } finally {
      input.disabled = false;
      input.focus();
      isSending = false;
    }
  }

  /* ---------------- Events ---------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send(input.value);
  });

  // Quick replies
  if (quickWrap) {
    quickWrap.addEventListener("click", function (e) {
      const btn = e.target.closest(".chat-quick-reply");
      if (btn) send(btn.dataset.q);
    });
  }

  // ESC to close
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) closeChat();
  });

  /* ---------------- External trigger ---------------- */
  // Allow nav dropdown / other UI to open the chat programmatically
  document.addEventListener("wwnt:chat:open", function () {
    if (!isOpen) openChat();
  });
  window.wwntOpenChat = function () {
    if (!isOpen) openChat();
  };
})();
