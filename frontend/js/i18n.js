// 🌐 Sistema de Internacionalização (i18n)

// Detectar linguagem do navegador
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage; // ex: 'pt-BR', 'en-US'
    
    console.log('🌍 Idioma do navegador detectado:', browserLang);
    
    // Verificar se o idioma é suportado
    if (browserLang.startsWith('pt')) {
        return 'pt-BR';
    } else if (browserLang.startsWith('en')) {
        return 'en-US';
    }
    
    // Fallback para português
    return 'pt-BR';
}

// Sempre detectar do navegador ao carregar a página
// O idioma do navegador tem prioridade
const browserLanguage = detectBrowserLanguage();
let currentLanguage = browserLanguage;

// Atualizar localStorage para refletir idioma atual do navegador
localStorage.setItem('language', currentLanguage);
console.log('🔤 Usando idioma do navegador:', currentLanguage);

let translations = {};
let isLanguageLoaded = false;

// Carregar arquivo de tradução
async function loadLanguage(lang) {
    try {
        console.log('📥 Carregando idioma:', lang);
        const response = await fetch(`i18n/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load language: ${lang}`);
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        isLanguageLoaded = true;
        console.log('✅ Idioma carregado:', lang);
        updatePageLanguage();
        return true;
    } catch (error) {
        console.error('❌ Erro ao carregar idioma:', error);
        // Fallback para português se falhar
        if (lang !== 'pt-BR') {
            try {
                const response = await fetch('i18n/pt-BR.json');
                if (response.ok) {
                    translations = await response.json();
                    currentLanguage = 'pt-BR';
                    localStorage.setItem('language', 'pt-BR');
                    document.documentElement.lang = 'pt-BR';
                    isLanguageLoaded = true;
                    console.log('✅ Fallback para pt-BR carregado');
                    updatePageLanguage();
                    return true;
                }
            } catch (e) {
                console.error('❌ Fallback falhou:', e);
            }
        }
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
    if (!isLanguageLoaded) {
        console.warn('⚠️ Tentando atualizar página antes do idioma carregar');
        return;
    }
    
    console.log('🔄 Atualizando elementos da página para:', currentLanguage);
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translatedText = t(key);
        
        // Usar innerHTML para chaves que contêm HTML (como about.introName)
        if (key === 'about.introName' || key === 'about.introBelief') {
            element.innerHTML = translatedText;
        } else {
            element.textContent = translatedText;
        }
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
    
    console.log('✅ Página atualizada com sucesso');
}

// Mudar idioma (mudança temporária durante a sessão)
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
window.updatePageLanguage = updatePageLanguage;
