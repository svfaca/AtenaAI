console.log("UI.JS ATIVO - CORREÇÃO MOBILE & SETTINGS");

// ===== HELPER: LOGO =====
function updateAllLogos() {
  const isDark = document.documentElement.classList.contains("dark");
  document.querySelectorAll('[data-theme-logo]').forEach(img => {
    img.src = isDark ? "assets/logo/logo-icon-dark.png" : "assets/logo/logo-icon-ligth.png";
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try { window.updateAllLogos = updateAllLogos; } catch (e) {}

  // 1. TEMA
  if (localStorage.getItem("theme") === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
  updateAllLogos();

  document.getElementById("theme-toggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
    updateAllLogos();
  });

  // ============================================================
  // 2. LÓGICA DA SIDEBAR (CORRIGIDA PARA MOBILE)
  // ============================================================
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle"); // Botão dentro da sidebar
  const mobileSidebarBtn = document.getElementById("mobile-sidebar-btn"); // Botão no header mobile
  const overlay = document.getElementById("sidebar-overlay");
  const userAvatar = document.getElementById("user-avatar");

  // ABRIR SIDEBAR (Mobile Header)
  mobileSidebarBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar?.classList.add("mobile-open");
    overlay?.classList.add("active");
  });

  // FECHAR SIDEBAR (Overlay)
  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("mobile-open");
    overlay?.classList.remove("active");
  });

  // BOTÃO INTERNO DA SIDEBAR (HAMBURGUER/TOGGLE)
  // Correção: Agora ele fecha a sidebar se estiver no mobile
  sidebarToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    
    if (window.innerWidth < 768) {
      // MOBILE: Funciona como botão "Fechar"
      sidebar.classList.remove("mobile-open");
      overlay?.classList.remove("active");
    } else {
      // DESKTOP: Funciona como botão "Colapsar/Expandir"
      sidebar.classList.toggle("sidebar-collapsed");
    }
  });

  // AVATAR: Abre a sidebar se estiver fechada (Desktop)
  userAvatar?.addEventListener("click", (e) => {
      if (window.innerWidth >= 768 && sidebar && sidebar.classList.contains("sidebar-collapsed")) {
          e.stopPropagation();
          sidebar.classList.remove("sidebar-collapsed");
      }
  });

  // Padrão: fechado em desktop ao carregar
  if (window.innerWidth >= 768) {
    try { sidebar?.classList.add("sidebar-collapsed"); } catch (e) { }
  }

  // ============================================================
  // 3. SETTINGS MODAL (CORRIGIDO)
  // ============================================================
  const settingsBtn = document.getElementById("settings-btn"); // Botão Texto (Aberto)
  const collapsedSettings = document.getElementById("collapsed-settings"); // Botão Ícone (Fechado)
  
  const modal = document.getElementById("settings-modal");
  const modalOverlay = document.getElementById("settings-modal-overlay");
  const closeBtn = document.getElementById("close-settings");
  const cancelBtn = document.getElementById("cancel-settings"); // Botão cancelar dentro do form

  const openSettings = () => {
      if(modal) {
          modal.classList.remove("hidden"); // Remove hidden se tiver
          // Pequeno delay para permitir transição CSS
          setTimeout(() => modal.classList.add("active"), 10);
      }
      if(modalOverlay) {
          modalOverlay.classList.remove("hidden");
          setTimeout(() => modalOverlay.classList.add("active"), 10);
      }
  };

  const closeSettingsModal = () => {
      if(modal) modal.classList.remove("active");
      if(modalOverlay) modalOverlay.classList.remove("active");
      
      // Espera a animação (0.3s) antes de esconder totalmente
      setTimeout(() => {
          // Só adiciona hidden se não tiver a classe active (para evitar bugs de clique rápido)
          if(modal && !modal.classList.contains("active")) modal.classList.add("hidden");
          if(modalOverlay && !modalOverlay.classList.contains("active")) modalOverlay.classList.add("hidden");
      }, 300);
  };

  // Listeners de Abrir
  settingsBtn?.addEventListener("click", (e) => { e.preventDefault(); openSettings(); });
  collapsedSettings?.addEventListener("click", (e) => { e.preventDefault(); openSettings(); });
  
  // Listeners de Fechar
  closeBtn?.addEventListener("click", (e) => { e.preventDefault(); closeSettingsModal(); });
  cancelBtn?.addEventListener("click", (e) => { e.preventDefault(); closeSettingsModal(); });
  modalOverlay?.addEventListener("click", closeSettingsModal);


  // 4. MENU HAMBURGUER SUPERIOR (PÚBLICO/INDEX)
  // Mantive sua lógica segura aqui
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    const toggleMobileMenu = (e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        mobileMenu.classList.toggle('hidden');
    };
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    document.addEventListener('click', (e) => {
        if (!mobileMenu.classList.contains('hidden')) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        }
    });
  }

  // 5. TOAST GLOBAL
  window.showToast = function ({ title, message, type = "info" }) {
    const t = document.getElementById("toast");
    if (!t) return alert(message);
    
    const titleEl = document.getElementById("toast-title");
    const msgEl = document.getElementById("toast-message");
    const icon = document.getElementById("toast-icon");

    // Tradução (se disponível)
    try {
      if (typeof window.t === 'function') {
        title = title ? window.t(title) : window.t('toasts.defaultTitle');
        message = message ? window.t(message) : window.t('toasts.defaultMessage');
      }
    } catch (e) { /* silenciar */ }

    if(titleEl) titleEl.textContent = title;
    if(msgEl) msgEl.textContent = message;

    if(icon) icon.innerHTML = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 3000);
  };
});