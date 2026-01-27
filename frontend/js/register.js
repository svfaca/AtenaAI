import { saveToken, saveUserData } from "./auth.js";

// ========================================================
// 🔧 CONFIGURAÇÕES
// ========================================================
const API_BASE_URL = "https://web-production-110f3.up.railway.app";

// ========================================================
// 🎨 FUNÇÃO SHOW TOAST (Igual ao Login)
// ========================================================
function showToast({ title, message, type }) {
    const toast = document.getElementById("toast");
    const toastTitle = document.getElementById("toast-title");
    const toastMessage = document.getElementById("toast-message");
    const toastIcon = document.getElementById("toast-icon");

    // Fallback se não tiver HTML de toast
    if (!toast || !toastTitle || !toastMessage || !toastIcon) {
        alert(`${title}: ${message}`);
        return;
    }

    // Tradução (se disponível)
    try {
        if (typeof window.t === 'function') {
            title = title ? window.t(title) : window.t('toasts.defaultTitle');
            message = message ? window.t(message) : window.t('toasts.defaultMessage');
        }
    } catch (e) { /* silenciar */ }

    toastTitle.textContent = title;
    toastMessage.textContent = message;

    // Reseta classes
    toastIcon.className = "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full";

    if (type === "success") {
        toastIcon.classList.add("bg-green-100", "text-green-600", "dark:bg-green-900", "dark:text-green-300");
        toastIcon.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === "error") {
        toastIcon.classList.add("bg-red-100", "text-red-600", "dark:bg-red-900", "dark:text-red-300");
        toastIcon.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    } else {
        toastIcon.classList.add("bg-blue-100", "text-blue-600", "dark:bg-blue-900", "dark:text-blue-300");
        toastIcon.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}

// ========================================================
// 🚀 INICIALIZAÇÃO E EVENTOS
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("REGISTER.JS CARREGADO E CORRIGIDO");

    // ===== ELEMENTOS DOS PASSOS =====
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const step3 = document.getElementById("step-3");
    const step4 = document.getElementById("step-4");

    // ===== BOTÕES DE NAVEGAÇÃO =====
    const continueBtn1 = document.getElementById("continue-btn-1");
    const continueBtn2 = document.getElementById("continue-btn-2");
    const continueBtn3 = document.getElementById("continue-btn-3");

    const backBtn2 = document.getElementById("back-btn-2");
    const backBtn3 = document.getElementById("back-btn-3");
    const backBtn4 = document.getElementById("back-btn-4");

    // ===== INPUTS =====
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    
    // Regex simples para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ===== PREVIEW DE FOTO =====
    const profileImageInput = document.getElementById("profile-image");
    const profileImagePreview = document.getElementById("profile-image-preview");

    if (profileImageInput) {
        profileImageInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    profileImagePreview.innerHTML = `<img src="${event.target.result}" class="w-full h-full object-cover rounded-full" alt="Profile">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ===== TOGGLE PASSWORD =====
    const togglePasswordBtn = document.getElementById("toggle-password");
    const eyeIcon = document.getElementById("eye-icon");
    const eyeOffIcon = document.getElementById("eye-off-icon");

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            eyeIcon?.classList.toggle("hidden");
            eyeOffIcon?.classList.toggle("hidden");
        });
    }

    // ===== NAVEGAÇÃO: PASSO 1 -> PASSO 2 =====
    if (continueBtn1) {
        continueBtn1.addEventListener("click", async () => {
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Validações locais
            if (!email || !password || !confirmPassword) {
                showToast({ title: "toasts.attention", message: "toasts.fillRequired", type: "error" });
                return;
            }

            if (!emailRegex.test(email)) {
                showToast({ title: "toasts.invalidEmailTitle", message: "toasts.invalidEmailMessage", type: "error" });
                return;
            }

            if (password !== confirmPassword) {
                showToast({ title: "toasts.passwordErrorTitle", message: "toasts.passwordsMismatch", type: "error" });
                return;
            }

            // ==============================
            // 🔎 VERIFICA EMAIL NO BACKEND
            // ==============================
            try {
                const res = await fetch(`${API_BASE_URL}/auth/check-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();

                if (!data.available) {

    // Toast traduzido
    showToast({ 
        title: "auth.emailNotAvailable", 
        message: "auth.emailAlreadyRegistered", 
        type: "error" 
    });


    // Mensagem vermelha abaixo do input
    const emailError = document.getElementById("email-error");
    if (emailError) {
        emailError.textContent = (typeof t === "function")
            emailError.textContent = (typeof t === "function")
    ? t("auth.emailAlreadyRegistered")
    : "Este email já está registrado.";
        emailError.classList.remove("hidden");
    }

    return;
}


            } catch (e) {
                showToast({ 
                    title: "toasts.error", 
                    message: "Erro ao verificar email. Tente novamente.", 
                    type: "error" 
                });
                return;
            }

            // ✅ Email livre → avança
            step1.classList.add("hidden");
            step2.classList.remove("hidden");
        });
    }


    // ===== NAVEGAÇÃO: PASSO 2 -> PASSO 3 =====
    if (continueBtn2) {
        continueBtn2.addEventListener("click", (e) => {
            e.preventDefault();
            const fullName = document.getElementById("full-name").value.trim();
            const birthdate = document.getElementById("birthdate").value;
            const gender = document.querySelector('input[name="gender"]:checked');

            if (!fullName) {
                showToast({ title: "toasts.nameRequiredTitle", message: "toasts.nameRequiredMessage", type: "error" });
                return;
            }
            if (!birthdate) {
                showToast({ title: "toasts.birthdateRequiredTitle", message: "toasts.birthdateRequiredMessage", type: "error" });
                return;
            }
            if (!gender) {
                showToast({ title: "toasts.genderRequiredTitle", message: "toasts.genderRequiredMessage", type: "error" });
                return;
            }

            step2.classList.add("hidden");
            step3.classList.remove("hidden");
        });
    }

    // ===== NAVEGAÇÃO: PASSO 3 -> PASSO 4 =====
    if (continueBtn3) {
        continueBtn3.addEventListener("click", (e) => {
            e.preventDefault();
            const accountType = document.querySelector('input[name="account-type"]:checked');

            if (!accountType) {
                showToast({ title: "toasts.accountTypeTitle", message: "toasts.accountTypeMessage", type: "error" });
                return;
            }

            step3.classList.add("hidden");
            step4.classList.remove("hidden");
        });
    }

    // ===== BOTÕES DE VOLTAR =====
    backBtn2?.addEventListener("click", () => { step2.classList.add("hidden"); step1.classList.remove("hidden"); });
    backBtn3?.addEventListener("click", () => { step3.classList.add("hidden"); step2.classList.remove("hidden"); });
    backBtn4?.addEventListener("click", () => { step4.classList.add("hidden"); step3.classList.remove("hidden"); });


    // ========================================================
    // 🏁 SUBMIT FINAL (NOVO SISTEMA)
    // ========================================================
    const interestsForm = document.getElementById("interests-form");
    const submitBtn = document.getElementById("submit-btn");
    const buttonText = document.getElementById("button-text");
    const loadingSpinner = document.getElementById("loading-spinner");

    if (interestsForm) {
        interestsForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // 1. Coleta Interesses
            const interestsArray = [...document.querySelectorAll('input[name="interests"]:checked')].map(el => el.value);
            
            if (interestsArray.length === 0) {
                showToast({ title: "toasts.interestsTitle", message: "toasts.interestsMessage", type: "error" });
                return;
            }

            // 2. Coleta Termos
            const terms = document.getElementById("terms");
            if (!terms.checked) {
                showToast({ title: "toasts.termsTitle", message: "toasts.termsMessage", type: "error" });
                return;
            }

            // 3. Coleta Dados Finais
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const fullName = document.getElementById("full-name").value.trim();
            const nickname = document.getElementById("nickname").value.trim();
            const birthdate = document.getElementById("birthdate").value;
            const gender = document.querySelector('input[name="gender"]:checked')?.value;

            // Processa Imagem
            let profileImageBase64 = null;
            if (profileImageInput?.files?.length > 0) {
                const file = profileImageInput.files[0];
                profileImageBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            }

            // UI Loading
            if(buttonText) buttonText.classList.add("hidden");
            if(loadingSpinner) loadingSpinner.classList.remove("hidden");
            if(submitBtn) submitBtn.disabled = true;

            try {
                // ==================================
                // 1. REGISTRO (Rota /auth/register)
                // ==================================
                const payload = {
                    email,
                    password,
                    full_name: fullName,
                    account_type: "student",
                    nickname,
                    interests: JSON.stringify(interestsArray),
                    profile_image: profileImageBase64,
                    gender,
                    birth_date: birthdate
                };

                const regResponse = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const regData = await regResponse.json();
                if (!regResponse.ok) throw new Error(regData.detail || "Erro ao criar conta.");

                // ==================================
                // 2. LOGIN AUTOMÁTICO (Rota /auth/login)
                // ==================================
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);

                const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData
                });

                if (!loginResponse.ok) throw new Error("Conta criada, mas erro ao logar.");

                const loginData = await loginResponse.json();
                
                // Salva Token
                saveToken(loginData.access_token);
                
                // Tenta pegar dados do usuário (opcional)
                try {
                    const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
                        headers: { "Authorization": `Bearer ${loginData.access_token}` }
                    });
                    if (userRes.ok) {
                        saveUserData(await userRes.json());
                    }
                } catch(e) { console.log("Perfil skip", e); }

                // SUCESSO!
                showToast({ title: "toasts.success", message: "toasts.accountCreatedMessage", type: "success" });
                
                setTimeout(() => {
                    window.location.href = "chat";
                }, 1500);

            } catch (err) {
                console.error(err);
                showToast({ title: "toasts.error", message: err.message || "toasts.registerFailedMessage", type: "error" });
            } finally {
                if(buttonText) buttonText.classList.remove("hidden");
                if(loadingSpinner) loadingSpinner.classList.add("hidden");
                if(submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
