console.log("UI.JS CARREGADO");

/* =====================
   TEMA (INIT + TOGGLE)
===================== */
const themeToggle = document.getElementById("theme-toggle");

// aplica tema salvo ao carregar
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

// botão de toggle
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");

    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // Atualizar logos conforme o tema
    setTimeout(() => {
      if (typeof updateAllLogos === 'function') {
        updateAllLogos();
      }
    }, 0);
  });
}

  /* =====================
     LOGO (THEME-AWARE GLOBAL)
  ===================== */
  // Caminho do logo conforme tema atual
  window.getLogoPath = function () {
    const isDark = document.documentElement.classList.contains('dark');
    // Atenção: arquivo "ligth" está escrito assim na pasta de assets
    return isDark
      ? 'assets/logo/logo-icon-dark.png'
      : 'assets/logo/logo-icon-ligth.png';
  };

  // Atualiza todos <img data-theme-logo>
  window.updateAllLogos = function () {
    const path = window.getLogoPath();
    document.querySelectorAll('img[data-theme-logo]')
      .forEach(img => { img.src = path; });
  };

  // Inicializa logos ao carregar a página
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.updateAllLogos === 'function') {
      window.updateAllLogos();
    }
  });

/* =====================
   SIDEBAR
===================== */
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");

if (sidebar && sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-collapsed");
  });
}

/* =====================
   TOAST (GLOBAL)
===================== */
window.showToast = function ({ title, message, type = "error" }) {
  const toast = document.getElementById("toast");
  const titleEl = document.getElementById("toast-title");
  const messageEl = document.getElementById("toast-message");
  const icon = document.getElementById("toast-icon");

  if (!toast || !titleEl || !messageEl || !icon) {
    alert(title + "\n\n" + message);
    return;
  }

  titleEl.textContent = title;
  messageEl.textContent = message;

  if (type === "warning") {
    icon.textContent = "⚠️";
    icon.className =
      "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600";
  } else if (type === "success") {
    icon.textContent = "✅";
    icon.className =
      "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600";
  } else {
    icon.textContent = "❌";
    icon.className =
      "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600";
  }

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
};

