import { saveToken, saveUserData } from "./auth.js";

// URL do Backend
const API_BASE_URL = "https://web-production-110f3.up.railway.app";

// ========================================================
// 🎨 FUNÇÃO SHOW TOAST (COM DESIGN)
// ========================================================
function showToast({ title, message, type }) {
    const toast = document.getElementById("toast");
    const toastTitle = document.getElementById("toast-title");
    const toastMessage = document.getElementById("toast-message");
    const toastIcon = document.getElementById("toast-icon");

    // Se o HTML do toast não existir, usa alert como fallback
    if (!toast || !toastTitle || !toastMessage || !toastIcon) {
        alert(`${title}: ${message}`);
        return;
    }

    // 1. Define o Texto (tenta traduzir se possível)
    try {
      if (typeof window.t === 'function') {
        title = title ? window.t(title) : window.t('toasts.defaultTitle');
        message = message ? window.t(message) : window.t('toasts.defaultMessage');
      }
    } catch (e) {}

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // 2. Define as Cores e Ícones baseados no tipo
    // Limpa classes de cor antigas
    toastIcon.className = "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full";

    if (type === "success") {
        // Sucesso: Verde
        toastIcon.classList.add("bg-green-100", "text-green-600", "dark:bg-green-900", "dark:text-green-300");
        toastIcon.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === "error") {
        // Erro: Vermelho
        toastIcon.classList.add("bg-red-100", "text-red-600", "dark:bg-red-900", "dark:text-red-300");
        toastIcon.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    } else {
        // Info/Warning: Azul
        toastIcon.classList.add("bg-blue-100", "text-blue-600", "dark:bg-blue-900", "dark:text-blue-300");
        toastIcon.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    // 3. Mostra o Toast
    toast.classList.remove("hidden");

    // 4. Esconde automaticamente após 4 segundos
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}


document.addEventListener("DOMContentLoaded", () => {
  console.log("LOGIN.JS CARREGADO COM TOAST DESIGN");

  const form = document.getElementById("login-form");
  
  // Elementos do botão de login
  const loginBtn = document.getElementById("login-btn");
  const loginBtnText = document.getElementById("login-btn-text");
  const loginSpinner = document.getElementById("login-spinner");

  // Elementos de Senha
  const togglePasswordBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eye-icon");
  const eyeOffIcon = document.getElementById("eye-off-icon");

  // ===== TOGGLE PASSWORD =====
  if (togglePasswordBtn && passwordInput && eyeIcon && eyeOffIcon) {
    togglePasswordBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.add("hidden");
        eyeOffIcon.classList.remove("hidden");
      } else {
        passwordInput.type = "password";
        eyeIcon.classList.remove("hidden");
        eyeOffIcon.classList.add("hidden");
      }
    });
  }

  // ===== GOOGLE E FACEBOOK (MOCK) =====
  const googleBtn = document.getElementById("google-signup");
  const facebookBtn = document.getElementById("facebook-signup");

  if (googleBtn) googleBtn.addEventListener("click", (e) => { 
      e.preventDefault(); 
      showToast({ title: "toasts.soon", message: "toasts.googleUnavailable", type: "info" });
  });
  
  if (facebookBtn) facebookBtn.addEventListener("click", (e) => { 
      e.preventDefault(); 
      showToast({ title: "toasts.soon", message: "toasts.facebookUnavailable", type: "info" });
  });

  // ===== SUBMIT DO LOGIN =====
  if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // 1. Validações Locais
        if (!email || !password) {
          showToast({ title: "toasts.requiredFields", message: "toasts.fillEmailPassword", type: "error" });
          return;
        }

        // 2. Loading State
        if (loginBtn && loginBtnText && loginSpinner) {
            loginBtn.disabled = true;
            loginBtnText.classList.add("hidden");
            loginSpinner.classList.remove("hidden");
        }

        try {
          // 3. Monta o Form Data (exigência do FastAPI OAuth2)
          const formData = new URLSearchParams();
          formData.append("username", email);
          formData.append("password", password);

          // 4. Requisição
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Email ou senha incorretos.");
          }

          // 5. Sucesso
          const data = await response.json();
          saveToken(data.access_token);

          // Busca dados do usuário (opcional)
          try {
             const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
                 headers: { "Authorization": `Bearer ${data.access_token}` }
             });
             if (userRes.ok) {
                 const userData = await userRes.json();
                 saveUserData(userData);
             }
          } catch (e) { console.log("Erro ao buscar perfil:", e); }

          // 6. Feedback visual e Redirecionamento
          showToast({ 
              title: "toasts.welcomeLoginTitle", 
              message: "toasts.loginSuccessMessage", 
              type: "success" 
          });

          setTimeout(() => {
              window.location.href = "chat.html";
          }, 1000);

        } catch (err) {
          console.error(err);
          // Restaura botão
          if (loginBtn && loginBtnText && loginSpinner) {
              loginBtn.disabled = false;
              loginBtnText.classList.remove("hidden");
              loginSpinner.classList.add("hidden");
          }
          
          // Use translation key for login errors (ensures consistent translation)
          showToast({ 
              title: "toasts.loginErrorTitle", 
              message: "toasts.loginErrorMessage", 
              type: "error" 
          });
        }
      });
  }
});
