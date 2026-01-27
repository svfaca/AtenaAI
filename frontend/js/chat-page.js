import { getToken, logout, updateAvatarUI } from "./auth.js";

NEXT_PUBLIC_API_URL=https://web-production-110f3.up.railway.app/
let currentConversationId = null;
let pendingActionId = null;

function renderWelcomeMessage() {
    let welcomeText = null;

    if (typeof t === 'function') {
        try { welcomeText = t('messages.welcome'); } catch (e) { welcomeText = null; }
    }

    // Se a tradução ainda não estiver disponível, usa um fallback baseado no idioma
    if (!welcomeText || welcomeText === 'messages.welcome') {
        const lang = (typeof getLanguage === 'function') ? getLanguage() : 'pt-BR';
        if (lang && lang.startsWith('en')) {
            welcomeText = "Hello! I'm AtenaAI.\n\nHow can I help you with your studies today?";
        } else {
            welcomeText = "Olá! Eu sou a AtenaAI.\n\nComo posso ajudar nos seus estudos hoje?";
        }
    }

    const parts = welcomeText.split('\n\n');
    const first = parts.shift() || '';
    const rest = parts.join('\n\n');
    return `
    <div class="flex justify-start mb-4 welcome-msg">
        <div class="max-w-[85%] bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-gray-800 dark:text-gray-200 shadow-sm border border-blue-100 dark:border-blue-900/30">
            <p class="font-semibold mb-1">${first}</p>
            <p class="text-sm">${rest}</p>
        </div>
    </div>`;
}

// Ao carregar traduções, re-renderiza mensagens de boas-vindas presentes na tela
document.addEventListener('i18n:loaded', () => {
    try {
        if (!chatMessages) return;
        chatMessages.querySelectorAll('.welcome-msg').forEach(el => {
            el.outerHTML = renderWelcomeMessage();
        });
    } catch (e) { /* silenciar erros */ }
});

const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const conversationList = document.getElementById("conversation-list");
const sendBtn = document.getElementById("send-btn");

// ========================================================
// 🛡️ AUXILIARES DE UI E SEGURANÇA
// ========================================================

function checkAuth(res) {
    if (res.status === 401) { logout(); return false; }
    return true;
}

function setLoading(isLoading) {
    if (!input || !sendBtn) return;
    input.disabled = isLoading;
    sendBtn.disabled = isLoading;
    if (isLoading) {
        const typingDiv = document.createElement("div");
        typingDiv.id = "ai-typing";
        typingDiv.className = "flex justify-start mb-4";
        typingDiv.innerHTML = `<div class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex gap-1 items-center shadow-sm"><span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span><span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span></div>`;
        chatMessages.appendChild(typingDiv);
    } else {
        document.getElementById("ai-typing")?.remove();
        input.focus();
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ========================================================
// 📂 GESTÃO DE CONVERSAS (SIDEBAR)
// ========================================================

async function loadConversations() {
    const token = getToken();
    if (!token || !conversationList) return;

    try {
        const res = await fetch(`${API_BASE_URL}/conversations/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!checkAuth(res)) return;
        
        const convs = await res.json();
        conversationList.innerHTML = convs.map(c => `
            <li class="conv-item-container relative group p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer mb-1 transition-all border-l-4 ${currentConversationId == c.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-transparent'}" data-id="${c.id}">
                <div class="flex items-center justify-between w-full btn-load-conv">
                    <div class="truncate pr-8 pointer-events-none">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">${c.title || 'Conversa'}</p>
                        <p class="text-[10px] text-gray-500">${new Date(c.updated_at || c.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <button class="dots-btn absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all z-20">
                    <svg class="w-4 h-4 text-gray-500 pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                </button>

                <div id="menu-${c.id}" class="conv-options-menu shadow-xl border border-gray-200 dark:border-gray-700 rounded-md py-1 z-50 min-w-[120px] absolute right-2 top-10 bg-white dark:bg-gray-800">
                    <button class="btn-duplicate w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs" data-id="${c.id}">Duplicar</button>
                    <button class="btn-rename w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs" data-id="${c.id}" data-title="${c.title}">Renomear</button>
                    <button class="btn-delete w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-xs" data-id="${c.id}">Excluir</button>
                </div>
            </li>
        `).join('');
    } catch (e) { console.error("Erro na lista:", e); }
}

// ========================================================
// 🕹️ DELEGATION DE EVENTOS (ABRE MENU E TRATA AÇÕES)
// ========================================================

document.addEventListener('click', async (e) => {
    const token = getToken();
    const target = e.target;

    // 1. Botão Sair (Corrigido para garantir prioridade)
    if (target.closest('#logout-btn') || target.closest('#collapsed-logout')) {
        e.preventDefault();
        logout();
        return;
    }

    // 2. Clique nos 3 pontos (Toggle Menu via classe .active do seu CSS)
    if (target.closest('.dots-btn')) {
        e.stopPropagation();
        const container = target.closest('.conv-item-container');
        const menu = document.getElementById(`menu-${container.dataset.id}`);
        
        const isCurrentlyActive = menu.classList.contains('active');
        
        // Fecha todos os menus abertos
        document.querySelectorAll('.conv-options-menu').forEach(m => m.classList.remove('active'));
        
        // Abre apenas se estava fechado
        if (!isCurrentlyActive) menu.classList.add('active');
        return;
    }

    // 3. Clique fora fecha menus
    if (!target.closest('.conv-options-menu')) {
        document.querySelectorAll('.conv-options-menu').forEach(m => m.classList.remove('active'));
    }

    // 4. Carregar Conversa ao clicar no item
    if (target.closest('.btn-load-conv')) {
        const id = target.closest('.conv-item-container').dataset.id;
        loadConversationById(id);
    }

    // 5. Ação: Duplicar
    if (target.closest('.btn-duplicate')) {
        const id = target.dataset.id;
        const res = await fetch(`${API_BASE_URL}/conversations/${id}/duplicate`, { 
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (res.ok) loadConversations();
    }

    // 6. Ação: Abrir Modal Renomear
    if (target.closest('.btn-rename')) {
        pendingActionId = target.dataset.id;
        document.getElementById('rename-input').value = target.dataset.title;
        document.getElementById('rename-modal').classList.remove('hidden');
        document.getElementById('rename-modal-overlay').classList.add('active');
    }

    // 7. Ação: Abrir Modal Excluir
    if (target.closest('.btn-delete')) {
        pendingActionId = target.dataset.id;
        document.getElementById('confirm-modal').classList.remove('hidden');
        document.getElementById('confirm-modal-overlay').classList.add('active');
    }
});

// ========================================================
// 💬 CHAT CORE (ENVIO E CARREGAMENTO)
// ========================================================

async function loadConversationById(id) {
    const token = getToken();
    try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/conversations/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!checkAuth(res)) return;
        
        const data = await res.json();
        currentConversationId = id;
        chatMessages.innerHTML = renderWelcomeMessage();

        (data.messages || []).forEach(m => {
            const isUser = m.role === 'user';
            chatMessages.innerHTML += `<div class="flex ${isUser ? 'justify-end' : 'justify-start'} mb-4"><div class="max-w-[85%] p-3 rounded-lg shadow-sm ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}">${m.content}</div></div>`;
        });
        loadConversations();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } finally { setLoading(false); }
}

function startNewChat() {
    currentConversationId = null;
    chatMessages.innerHTML = renderWelcomeMessage();
    loadConversations();
}

// Suporte ao Enter
if (input) {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!input.disabled && input.value.trim()) {
                form.requestSubmit();
            }
        }
    });
}

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || input.disabled) return;
    const token = getToken();

    chatMessages.innerHTML += `<div class="flex justify-end mb-4"><div class="max-w-[85%] bg-blue-600 text-white p-3 rounded-lg shadow-sm">${text}</div></div>`;
    input.value = ""; input.style.height = 'auto'; chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/chat/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ text, content: text, conversation_id: currentConversationId, language: (typeof getLanguage === 'function' ? getLanguage() : 'pt-BR') })
        });
        if (!checkAuth(res)) return;
        const data = await res.json();
        
        if (data.conversation_id && !currentConversationId) {
            currentConversationId = data.conversation_id;
            loadConversations();
        }
        chatMessages.innerHTML += `<div class="flex justify-start mb-4"><div class="max-w-[85%] bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-gray-800 dark:text-gray-200 shadow-sm">${data.reply.trim()}</div></div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } finally { setLoading(false); }
});

// ========================================================
// 🎭 LOGICA DOS MODAIS (SALVAR/EXCLUIR)
// ========================================================

document.getElementById('rename-save')?.addEventListener('click', async () => {
    const newTitle = document.getElementById('rename-input').value.trim();
    if (!newTitle || !pendingActionId) return;
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/conversations/${pendingActionId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle })
    });
    if (res.ok) {
        closeAllModals();
        loadConversations();
    }
});

document.getElementById('confirm-ok')?.addEventListener('click', async () => {
    if (!pendingActionId) return;
    const token = getToken();
    const res = await fetch(`${API_BASE_URL}/conversations/${pendingActionId}`, { 
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (res.ok) {
        if (currentConversationId == pendingActionId) startNewChat();
        closeAllModals();
        loadConversations();
    }
});

function closeAllModals() {
    document.getElementById('rename-modal').classList.add('hidden');
    document.getElementById('confirm-modal').classList.add('hidden');
    document.getElementById('rename-modal-overlay').classList.remove('active');
    document.getElementById('confirm-modal-overlay').classList.remove('active');
    pendingActionId = null;
}

document.getElementById('rename-cancel')?.addEventListener('click', closeAllModals);
document.getElementById('confirm-cancel')?.addEventListener('click', closeAllModals);
document.getElementById('new-conversation')?.addEventListener('click', startNewChat);

// ========================================================
// 🏁 INICIALIZAÇÃO
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.includes("chat.html")) return;
    updateAvatarUI();
    loadConversations();
    startNewChat();
});
