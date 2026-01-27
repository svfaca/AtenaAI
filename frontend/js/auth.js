const TOKEN_KEY = "access_token";
const USER_KEY = "user";

// ===== TOKEN =====
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  const token = getToken();
  // Verifica se o token existe e não é uma string vazia/undefined
  return !!token && token !== "undefined" && token !== "null";
}

// ===== USER DATA =====
export function saveUserData(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUserData() {
  const user = localStorage.getItem(USER_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

// ===== AVATAR UI =====
export function updateAvatarUI() {
  const user = getUserData();
  if (!user) return;

  const elements = {
    avatarImage: document.getElementById("avatar-image"),
    avatarInitial: document.getElementById("avatar-initial"),
    userName: document.getElementById("user-name"),
    userRole: document.getElementById("user-role"),
    headerImg: document.getElementById('header-avatar-image'),
    headerInitial: document.getElementById('header-avatar-initial')
  };

  if (elements.userName) {
    elements.userName.textContent = user.nickname || user.full_name || "Minha Conta";
  }

  if (elements.userRole) {
    elements.userRole.textContent = user.account_type || "Aluno";
  }

  // Helper para atualizar fotos
  const setAvatar = (imgEl, initEl) => {
    if (!imgEl || !initEl) return;
    if (user.profile_image) {
      imgEl.src = user.profile_image;
      imgEl.classList.remove("hidden");
      initEl.classList.add("hidden");
    } else {
      initEl.textContent = (user.full_name || "U")[0].toUpperCase();
      imgEl.classList.add("hidden");
      initEl.classList.remove("hidden");
    }
  };

  setAvatar(elements.avatarImage, elements.avatarInitial);
  setAvatar(elements.headerImg, elements.headerInitial);
}

// ===== LOGOUT (CORRIGIDO) =====
export function logout() {
  console.log("Encerrando sessão...");
  localStorage.clear(); // Limpa TUDO para evitar resquícios de tokens antigos
  
  // Tenta redirecionar para index (geralmente a raiz do projeto)
  // Se seu login for em login, mude abaixo
  window.location.href = "/"; 
}

// ==========================================================
// ===== INTERCEPTOR DE ERRO 401 (PARA O CHAT-PAGE.JS) ======
// ==========================================================
export function handleAuthResponse(response) {
  if (response.status === 401) {
    logout();
    return false;
  }
  return true;
}

// ==========================================================
// ===== LÓGICA DE REDIRECIONAMENTO AUTOMÁTICO ============
// ==========================================================

(function checkAuthRedirect() {
  const isLogged = isAuthenticated();
  const path = window.location.pathname;

  const isChatPage = path.includes("chat");
  const isAuthPage = path.includes("login") || path.includes("cadastro") || path.endsWith("index") || path.endsWith("/");

  // Se estiver no chat sem estar logado -> Tira daqui
  if (isChatPage && !isLogged) {
    window.location.href = "/";
  }
  
  // Se estiver na home/login estando logado -> Manda pro chat
  if (isAuthPage && isLogged) {
    window.location.href = "chat";
  }
})();
