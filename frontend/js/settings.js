// Settings Modal Management
export class SettingsManager {
    constructor(userData, updateAvatarCallback) {
        this.userData = userData;
        this.updateAvatar = updateAvatarCallback;
        this.init();
    }

    // Helper function to get translations (compatible with i18n.js)
    t(key) {
        // Check if window.i18nInstance exists (from i18n.js)
        if (typeof window !== 'undefined' && window.i18nInstance && window.i18nInstance.t) {
            return window.i18nInstance.t(key);
        }
        // Fallback: return the key itself
        return key;
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const settingsBtn = document.getElementById('settings-btn');
        const closeSettingsBtn = document.getElementById('close-settings');
        const cancelSettingsBtn = document.getElementById('cancel-settings');
        const settingsForm = document.getElementById('settings-form');
        const settingsModalOverlay = document.getElementById('settings-modal-overlay');
        const profileImageInput = document.getElementById('profile-image');
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        const languageSelector = document.getElementById('setting-language');

        settingsBtn?.addEventListener('click', () => this.openSettings());
        closeSettingsBtn?.addEventListener('click', () => this.closeSettings());
        cancelSettingsBtn?.addEventListener('click', () => this.closeSettings());
        settingsModalOverlay?.addEventListener('click', () => this.closeSettings());
        settingsForm?.addEventListener('submit', (e) => this.handleSubmit(e));
        profileImageInput?.addEventListener('change', (e) => this.handleImageUpload(e));
        deleteAccountBtn?.addEventListener('click', (e) => this.handleDeleteAccount(e));
        languageSelector?.addEventListener('change', (e) => this.handleLanguageChange(e));
    }

    openSettings() {
        const settingsModal = document.getElementById('settings-modal');
        const settingsModalOverlay = document.getElementById('settings-modal-overlay');

        settingsModal.classList.add('active');
        settingsModalOverlay.classList.add('active');

        // Preencher campos com dados do usuário
        document.getElementById('setting-name').value = this.userData.name || '';
        document.getElementById('setting-nickname').value = this.userData.nickname || '';
        document.getElementById('setting-email').value = this.userData.email || '';
        document.getElementById('setting-birth-date').value = this.userData.birth_date || '';
        document.getElementById('setting-gender').value = this.userData.gender || '';
        document.getElementById('setting-account-type').value = this.userData.account_type || 'aluno';
        document.getElementById('setting-interests').value = this.userData.interests
            ? Array.isArray(this.userData.interests)
                ? this.userData.interests.join(', ')
                : this.userData.interests
            : '';

        // Restaurar idioma selecionado
        const savedLanguage = localStorage.getItem('language') || 'pt-BR';
        document.getElementById('setting-language').value = savedLanguage;

        // Mostrar imagem de perfil
        const profilePreview = document.getElementById('profile-preview');
        if (this.userData.profile_image) {
            profilePreview.src = this.userData.profile_image;
            profilePreview.style.display = 'block';
        } else {
            profilePreview.style.display = 'none';
        }
    }

    closeSettings() {
        const settingsModal = document.getElementById('settings-modal');
        const settingsModalOverlay = document.getElementById('settings-modal-overlay');

        settingsModal.classList.remove('active');
        settingsModalOverlay.classList.remove('active');

        // Limpar input de arquivo
        const profileImageInput = document.getElementById('profile-image');
        if (profileImageInput) {
            profileImageInput.value = '';
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const profilePreview = document.getElementById('profile-preview');
                profilePreview.src = event.target.result;
                profilePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const token = localStorage.getItem('access_token');
        if (!token) {
            this.showToastError(this.t('settings.notAuthenticated'), this.t('settings.loginAgain'));
            return;
        }

        // Preparar dados
        const formData = new FormData();
        formData.append('full_name', document.getElementById('setting-name').value);
        formData.append('nickname', document.getElementById('setting-nickname').value);
        formData.append('email', document.getElementById('setting-email').value);
        formData.append('birth_date', document.getElementById('setting-birth-date').value);
        formData.append('gender', document.getElementById('setting-gender').value);
        formData.append('account_type', document.getElementById('setting-account-type').value);

        const interestsStr = document.getElementById('setting-interests').value;
        const interests = interestsStr.split(',').map(i => i.trim()).filter(i => i);
        formData.append('interests', JSON.stringify(interests));

        // Se há nova foto
        const profileImageInput = document.getElementById('profile-image');
        if (profileImageInput.files.length > 0) {
            formData.append('profile_image', profileImageInput.files[0]);
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const updated = await res.json();

                // Atualizar userData
                this.userData.name = updated.full_name;
                this.userData.nickname = updated.nickname;
                this.userData.email = updated.email;
                this.userData.birth_date = updated.birth_date;
                this.userData.gender = updated.gender;
                this.userData.account_type = updated.account_type;
                this.userData.interests = updated.interests;
                if (updated.profile_image) {
                    this.userData.profile_image = updated.profile_image;
                }

                // Atualizar avatar e nome na sidebar
                this.updateAvatar();
                document.getElementById('user-name').textContent = this.userData.name || 'Minha Conta';
                document.getElementById('user-role').textContent = this.userData.account_type
                    ? this.userData.account_type.charAt(0).toUpperCase() + this.userData.account_type.slice(1)
                    : 'Aluno';

                // Fechar modal
                this.closeSettings();
                this.showToastSuccess(this.t('settings.profileUpdated'), '');
            } else {
                const error = await res.json();
                this.showToastError(this.t('settings.updateError'), error.detail || this.t('settings.updateError'));
            }
        } catch (err) {
            console.error('Erro:', err);
            this.showToastError(this.t('settings.updateError'), this.t('settings.connectionError'));
        }
    }

    async handleDeleteAccount(e) {
        e.preventDefault();

        const confirmed = confirm(this.t('settings.deleteAccountConfirm'));
        if (!confirmed) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            this.showToastError(this.t('settings.deleteError'), this.t('settings.notAuthenticated'));
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                this.showToastSuccess(this.t('settings.accountDeleted'), this.t('settings.accountDeletedMessage'));
                setTimeout(() => {
                    localStorage.removeItem('access_token');
                    location.reload();
                }, 2000);
            } else {
                const error = await res.json();
                this.showToastError(this.t('settings.deleteError'), error.detail || this.t('settings.deleteError'));
            }
        } catch (err) {
            console.error('Erro:', err);
            this.showToastError(this.t('settings.deleteError'), this.t('settings.connectionError'));
        }
    }

    handleLanguageChange(e) {
        const selectedLanguage = e.target.value;
        // Call the global setLanguage function from i18n.js
        if (typeof window.setLanguage === 'function') {
            window.setLanguage(selectedLanguage);
        }
    }

    showToastSuccess(title, message) {
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');

        toastTitle.textContent = title;
        toastMessage.textContent = message;
        toastIcon.className = 'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600';
        toastIcon.textContent = '✓';

        toast.classList.remove('hidden');

        setTimeout(() => toast.classList.add('hidden'), 4000);
    }

    showToastError(title, message) {
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');

        toastTitle.textContent = title;
        toastMessage.textContent = message;
        toastIcon.className = 'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600';
        toastIcon.textContent = '❌';

        toast.classList.remove('hidden');

        setTimeout(() => toast.classList.add('hidden'), 4000);
    }
}
