console.log("SETTINGS.JS ATIVO - MODO LOCALHOST");

import { getUserData, saveUserData, getToken, updateAvatarUI } from "./auth.js";

// =========================================================
// 🛑 CONFIGURAÇÃO DE URL LOCAL
// =========================================================
const API_BASE_URL = "https://web-production-110f3.up.railway.app";

export class SettingsManager {
    constructor(updateAvatarCallback) {
        this.userData = getUserData() || {};
        this.updateAvatar = updateAvatarCallback || function(){}; 
        this.init();
    }

    t(key) {
        if (typeof window !== 'undefined' && window.i18nInstance && window.i18nInstance.t) {
            return window.i18nInstance.t(key);
        }
        return key;
    }

    init() {
        this.attachEventListeners();
        this._modalAlertTimeout = null;
    }

    attachEventListeners() {
        const settingsBtn = document.getElementById('settings-btn');
        const collapsedSettingsBtn = document.getElementById('collapsed-settings');
        const syncBtn = document.getElementById('sync-settings');
        const closeSettingsBtn = document.getElementById('close-settings');
        const cancelSettingsBtn = document.getElementById('cancel-settings');
        const settingsForm = document.getElementById('settings-form');
        const settingsModalOverlay = document.getElementById('settings-modal-overlay');
        const profileImageInput = document.getElementById('settings-avatar');
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        const languageSelector = document.getElementById('setting-language');

        settingsBtn?.addEventListener('click', (e) => { e.preventDefault(); this.openSettings(); });
        collapsedSettingsBtn?.addEventListener('click', (e) => { e.preventDefault(); this.openSettings(); });

        syncBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            const btn = e.currentTarget;
            btn.classList.add('animate-spin'); 
            try {
                const ok = await this.fetchLatestUserData();
                if (ok) {
                    this.fillFields();
                    this.showToastSuccess('Sincronizado', 'Dados atualizados com sucesso.');
                } else {
                    this.showToastError('Erro', 'Não foi possível sincronizar.');
                }
            } finally {
                setTimeout(() => btn.classList.remove('animate-spin'), 1000);
            }
        });

        closeSettingsBtn?.addEventListener('click', () => this.closeSettings());
        cancelSettingsBtn?.addEventListener('click', (e) => { e.preventDefault(); this.closeSettings(); });
        settingsModalOverlay?.addEventListener('click', () => this.closeSettings());

        settingsForm?.addEventListener('submit', (e) => this.handleSubmit(e));
        profileImageInput?.addEventListener('change', (e) => this.handleImageUpload(e));
        deleteAccountBtn?.addEventListener('click', (e) => this.handleDeleteAccount(e));
        languageSelector?.addEventListener('change', (e) => this.handleLanguageChange(e));
    }

    async openSettings() {
        const settingsModal = document.getElementById('settings-modal');
        const settingsModalOverlay = document.getElementById('settings-modal-overlay');

        try {
            const local = getUserData();
            if (local) this.userData = local;
        } catch (e) { console.warn('Erro ao ler dados locais', e); }

        this.fillFields(); 

        settingsModal?.classList.remove('hidden');
        settingsModalOverlay?.classList.remove('hidden');
        
        setTimeout(() => {
            settingsModal?.classList.add('active');
            settingsModalOverlay?.classList.add('active');
        }, 10);

        if (getToken()) {
            await this.fetchLatestUserData(); 
            this.fillFields(); 
        }
    }

    fillFields() {
        if (!this.userData) return;

        const fields = {
            'setting-name': this.userData.full_name || this.userData.name || '',
            'setting-nickname': this.userData.nickname || '',
            'setting-email': this.userData.email || '',
            'setting-birthdate': this.userData.birth_date || this.userData.birthdate || '',
            'setting-account-type': this.userData.account_type || 'student'
        };

        for (const [id, value] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = value;
        }

        const previewImg = document.getElementById('settings-preview');
        const initialSpan = document.getElementById('settings-initial');
        if (previewImg && initialSpan) {
            if (this.userData.profile_image) {
                previewImg.src = this.userData.profile_image;
                previewImg.classList.remove('hidden');
                initialSpan.classList.add('hidden');
            } else {
                previewImg.classList.add('hidden');
                initialSpan.classList.remove('hidden');
                initialSpan.textContent = (this.userData.full_name || 'U')[0].toUpperCase();
            }
        }

        // Processar interesses
        let userInterests = this.userData.interests || [];
        let interestList = [];
        
        if (Array.isArray(userInterests)) {
            interestList = userInterests.map(i => String(i).toLowerCase());
        } else if (typeof userInterests === 'string') {
            try {
                const parsed = JSON.parse(userInterests);
                interestList = Array.isArray(parsed) ? parsed.map(i => String(i).toLowerCase()) : [];
            } catch (e) {
                interestList = userInterests.split(',').map(i => i.trim().toLowerCase());
            }
        }

        document.querySelectorAll('.setting-interest').forEach(cb => {
            cb.checked = interestList.includes(String(cb.value).toLowerCase());
        });
    }

    async fetchLatestUserData() {
        const token = getToken();
        if (!token) return false;

        try {
            // ✅ CORRIGIDO: URL LOCAL
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const latest = await res.json();
                this.userData = latest;
                saveUserData(latest);
                this.updateAvatar(); 
                return true;
            }
            return false;
        } catch (err) {
            console.warn('Erro na sincronização silenciosa', err);
            return false;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const token = getToken();
        if (!token) return;

        const form = e.target;
        let submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) {
            submitBtn = document.querySelector(`button[type="submit"][form="${form.id}"]`);
        }

        const originalText = submitBtn ? submitBtn.textContent : "Salvar";
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Salvando...";
        }

        try {
            const formData = new FormData();
            
            formData.append('full_name', document.getElementById('setting-name')?.value || "");
            formData.append('nickname', document.getElementById('setting-nickname')?.value || "");
            formData.append('email', document.getElementById('setting-email')?.value || "");
            formData.append('birth_date', document.getElementById('setting-birthdate')?.value || "");

            // ✅ CORREÇÃO 422: Enviar interesses como string simples se o backend não aceitar JSON
            const interests = Array.from(document.querySelectorAll('.setting-interest:checked')).map(cb => cb.value);
            formData.append('interests', JSON.stringify(interests));

            const fileInput = document.getElementById('settings-avatar');
            if (fileInput && fileInput.files[0]) {
                formData.append('profile_image', fileInput.files[0]);
            }

            // ✅ CORRIGIDO: URL LOCAL
            const res = await fetch(`${API_BASE_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const updatedUser = await res.json();
                this.userData = updatedUser;
                saveUserData(updatedUser);
                this.updateAvatar();
                this.showToastSuccess('Perfil Atualizado', 'Suas informações foram salvas.');
                this.closeSettings();
            } else {
                const err = await res.json();
                this.showToastError('Erro ao salvar', err.detail || 'Tente novamente.');
            }

        } catch (err) {
            console.error(err);
            this.showToastError('Erro de Conexão', 'Verifique se o backend está rodando em :8000');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const previewImg = document.getElementById('settings-preview');
                const initialSpan = document.getElementById('settings-initial');
                if (previewImg) {
                    previewImg.src = ev.target.result;
                    previewImg.classList.remove('hidden');
                }
                if (initialSpan) initialSpan.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    closeSettings() {
        const settingsModal = document.getElementById('settings-modal');
        const settingsModalOverlay = document.getElementById('settings-modal-overlay');
        settingsModal?.classList.remove('active');
        settingsModalOverlay?.classList.remove('active');
        setTimeout(() => {
            settingsModal?.classList.add('hidden');
            settingsModalOverlay?.classList.add('hidden');
        }, 300);
    }

    showToastSuccess(title, message) {
        if (typeof window.showToast === 'function') {
            window.showToast({ title, message, type: 'success' });
        } else {
            alert(`✅ ${title}\n${message}`);
        }
    }

    showToastError(title, message) {
        if (typeof window.showToast === 'function') {
            window.showToast({ title, message, type: 'error' });
        } else {
            alert(`❌ ${title}\n${message}`);
        }
    }

    async handleDeleteAccount(e) {
        e.preventDefault();
        const confirmed = confirm("Tem certeza que deseja excluir sua conta?");
        if (!confirmed) return;

        const token = getToken();
        if (!token) return;

        try {
            // ✅ CORRIGIDO: URL LOCAL
            const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Conta excluída.");
                localStorage.clear();
                window.location.href = 'index.html';
            } else {
                alert("Erro ao excluir conta.");
            }
        } catch (err) {
            alert("Erro de conexão.");
        }
    }

    handleLanguageChange(e) {
        if (window.setLanguage) window.setLanguage(e.target.value);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new SettingsManager(updateAvatarUI);
});
