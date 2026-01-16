console.log("CHAT.JS ATIVO");

// ===== IMPORTS =====
import { isAuthenticated, logout, getToken } from "./auth.js";

// ===== LOGOUT =====
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

// ===== USER INFO =====
const user = JSON.parse(localStorage.getItem("user")) || {};

const avatar = document.getElementById("user-avatar");
const userName = document.getElementById("user-name");
const userRole = document.getElementById("user-role");

if (avatar) avatar.textContent = (user.full_name || "U")[0];
if (userName) userName.textContent = user.full_name || "Minha Conta";
if (userRole) userRole.textContent = "Aluno";

// ===== SIDEBAR =====
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

if (sidebar && toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-collapsed");
  });
}

// ===== THEME =====
const html = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");

if (localStorage.getItem("theme") === "dark") {
  html.classList.add("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    html.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      html.classList.contains("dark") ? "dark" : "light"
    );
  });
}

// ===== CHAT =====
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chat = document.getElementById("chat-messages");

// ===== AUTH FETCH =====
async function authFetch(url, options = {}) {
  console.log("📤 Sending request to:", url);
  console.log("📤 Body:", options.body);
  
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  console.log("📥 Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Response error:", response.status, errorText);
    throw new Error("Erro ao enviar mensagem");
  }

  return response;
}

// ===== SUBMIT MESSAGE =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  // Criar elemento para mensagem do usuário
  const userContainer = document.createElement("div");
  userContainer.className = "flex justify-end";
  
  const userMessage = document.createElement("div");
  userMessage.className = "message bg-blue-600 text-white p-4 rounded-lg";
  userMessage.textContent = text;
  
  userContainer.appendChild(userMessage);
  chat.appendChild(userContainer);

  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  // Typing indicator
  const typing = document.createElement("div");
  typing.innerHTML = `
    <div class="flex items-start gap-3 typing-indicator">
      <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white">⚡</div>
      <div class="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>
  `;
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  try {
    // Preparar dados da mensagem com informações do usuário
    const messageData = {
      text: text,  // Usar 'text' em vez de 'content' (alias do Pydantic)
      user_id: user.id || null,
      user_email: user.email || null,
      user_name: user.full_name || null,
      user_nickname: user.nickname || null,
      user_account_type: user.account_type || null,
      user_interests: typeof user.interests === 'string' ? user.interests : (user.interests ? JSON.stringify(user.interests) : null),
      user_gender: user.gender || null,
      user_birth_date: user.birth_date || null
    };

    console.log("📤 Enviando dados:", messageData);

    const res = await authFetch("http://127.0.0.1:8000/chat/", {
      method: "POST",
      body: JSON.stringify(messageData)
    });

    const data = await res.json();
    typing.remove();

    // Criar elemento para resposta da IA
    const aiContainer = document.createElement("div");
    aiContainer.className = "flex items-start gap-3";
    
    const avatar = document.createElement("div");
    avatar.className = "w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white";
    avatar.textContent = "⚡";
    
    const aiMessage = document.createElement("div");
    aiMessage.className = "message bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm";
    aiMessage.textContent = data.reply;
    
    aiContainer.appendChild(avatar);
    aiContainer.appendChild(aiMessage);
    chat.appendChild(aiContainer);

    chat.scrollTop = chat.scrollHeight;
  } catch (err) {
    typing.remove();
    console.error("Erro ao enviar mensagem:", err);
    
    // Criar elemento para mensagem de erro
    const errorContainer = document.createElement("div");
    errorContainer.className = "flex items-start gap-3";
    
    const avatar = document.createElement("div");
    avatar.className = "w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white";
    avatar.textContent = "❌";
    
    const errorMessage = document.createElement("div");
    errorMessage.className = "message bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg shadow-sm";
    errorMessage.textContent = `Erro: ${err.message || 'Falha ao enviar mensagem'}`;
    
    errorContainer.appendChild(avatar);
    errorContainer.appendChild(errorMessage);
    chat.appendChild(errorContainer);
    chat.scrollTop = chat.scrollHeight;
  }
});

// ===== NEW CONVERSATION =====
const newConversationBtn = document.getElementById("new-conversation");

if (newConversationBtn) {
  newConversationBtn.addEventListener("click", () => {
    chat.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white">⚡</div>
        <div class="max-w-[75%] bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-sm">
          <p>Nova conversa iniciada. Como posso ajudar?</p>
        </div>
      </div>
    `;
  });
}
