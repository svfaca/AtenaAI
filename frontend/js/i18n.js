// 🌐 Sistema de Internacionalização (i18n)

// Detectar linguagem do navegador
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage; // ex: 'pt-BR', 'en-US'
    
    // Verificar se o idioma é suportado
    if (browserLang.startsWith('pt')) {
        return 'pt-BR';
    } else if (browserLang.startsWith('en')) {
        return 'en-US';
    }
    
    // Fallback para português
    return 'pt-BR';
}

let currentLanguage = localStorage.getItem('language') || detectBrowserLanguage();
let translations = {};

// Carregar arquivo de tradução
async function loadLanguage(lang) {
let translations = {};

// Carregar arquivo de tradução
async function loadLanguage(lang) {
    try {
        const response = await fetch(`/i18n/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load language: ${lang}`);
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        updatePageLanguage();
        return true;
    } catch (error) {
        console.error('Error loading language:', error);
        return false;
    }
}

// Obter texto traduzido
function t(key) {
    const keys = key.split('.');
    let value = translations;
    
    for (let k of keys) {
        if (value[k]) {
            value = value[k];
        } else {
            console.warn(`Missing translation key: ${key}`);
            return key;
        }
    }
    
    return value;
}

// Atualizar elementos da página com data-i18n
function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });

    document.querySelectorAll('[data-i18n-value]').forEach(element => {
        const key = element.getAttribute('data-i18n-value');
        element.value = t(key);
    });
}

// Mudar idioma
function setLanguage(lang) {
    loadLanguage(lang);
}

// Obter idioma atual
function getLanguage() {
    return currentLanguage;
}

// Inicializar i18n na carga da página
document.addEventListener('DOMContentLoaded', async () => {
    await loadLanguage(currentLanguage);
});

// Atalho para tradução simples (usado em JavaScript)
window.t = t;
window.setLanguage = setLanguage;
window.getLanguage = getLanguage;
