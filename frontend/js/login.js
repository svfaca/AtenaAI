import { apiRequest } from "./api.js";
import { saveToken } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("LOGIN.JS CARREGADO (DOMContentLoaded)");

  const form = document.getElementById("login-form");

  const togglePasswordBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");
  // Seleciona os ícones SVG pelo seletor de classe, sem depender de IDs
  const icons = togglePasswordBtn ? togglePasswordBtn.querySelectorAll("svg.h-5.w-5") : [];
  const eyeIcon = icons[0] || null;
  const eyeOffIcon = icons[1] || null;

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
    // Inicializa o estado dos ícones
    eyeIcon.classList.remove("hidden");
    eyeOffIcon.classList.add("hidden");
  } else {
    console.warn("Toggle senha: elemento não encontrado", {togglePasswordBtn, passwordInput, eyeIcon, eyeOffIcon});
  }

  // ===== GOOGLE E FACEBOOK (ainda não disponíveis) =====
  const googleBtn = document.getElementById("google-signup");
  const facebookBtn = document.getElementById("facebook-signup");

  if (googleBtn) {
    googleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast({
        title: "Funcionalidade não disponível",
        message: "Login com Google ainda não foi implementado.",
        type: "error"
      });
    });
  }

  if (facebookBtn) {
    facebookBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast({
        title: "Funcionalidade não disponível",
        message: "Login com Facebook ainda não foi implementado.",
        type: "error"
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value.trim();

    // ===== VALIDAÇÕES UX =====
    if (!email || !password) {
      showToast({
        title: "Campos obrigatórios",
        message: "Preencha email e senha para continuar.",
        type: "error"
      });
      return;
    }

    if (!email.includes("@")) {
      showToast({
        title: "Email inválido",
        message: "Digite um email válido.",
        type: "warning"
      });
      return;
    }

    try {
      // 🔥 chamada correta (fetch puro, sem api.post inexistente)
      const response = await apiRequest("/login/", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      console.log("LOGIN RESPONSE:", response);
      console.log("Token from response:", response.access_token);

      // 🔥 salva exatamente o que o backend retorna
      if (!response.access_token) {
        console.error("❌ No access_token in response!");
        throw new Error("Token não recebido do servidor");
      }

      saveToken(response.access_token);
      console.log("✅ Token saved to localStorage");

      // 🔥 redirect correto
      window.location.href = "index.html";

    } catch (err) {
      console.error(err);

      showToast({
        title: "Erro ao entrar",
        message: "Email ou senha incorretos.",
        type: "error"
      });
    }
  });
});
