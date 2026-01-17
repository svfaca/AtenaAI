console.log("REGISTER.JS ATIVO");

const API_BASE_URL = "https://atenaai.onrender.com";

// ================= PREVIEW DE FOTO DE PERFIL =================
const profileImageInput = document.getElementById("profile-image");
const profileImagePreview = document.getElementById("profile-image-preview");

if (profileImageInput) {
  profileImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profileImagePreview.innerHTML = `<img src="${event.target.result}" class="w-full h-full object-cover" alt="Profile">`;
      };
      reader.readAsDataURL(file);
    }
  });
}

// ================= TOGGLE DE SENHA - STEP 1 =================
document.addEventListener("DOMContentLoaded", () => {
    // Toggle Senha
    const togglePasswordBtn = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eye-icon");
    const eyeOffIcon = document.getElementById("eye-off-icon");

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            eyeIcon.classList.toggle("hidden");
            eyeOffIcon.classList.toggle("hidden");
        });
    }

    // Toggle Confirmar Senha
    const toggleConfirmPasswordBtn = document.getElementById("toggle-confirm-password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const confirmEyeIcon = document.getElementById("confirm-eye-icon");
    const confirmEyeOffIcon = document.getElementById("confirm-eye-off-icon");

    if (toggleConfirmPasswordBtn) {
        toggleConfirmPasswordBtn.addEventListener("click", () => {
            const isPassword = confirmPasswordInput.type === "password";
            confirmPasswordInput.type = isPassword ? "text" : "password";
            confirmEyeIcon.classList.toggle("hidden");
            confirmEyeOffIcon.classList.toggle("hidden");
        });
    }
});

const interestsForm = document.getElementById("interests-form");
const submitBtn = document.getElementById("submit-btn");
const buttonText = document.getElementById("button-text");
const loadingSpinner = document.getElementById("loading-spinner");

interestsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("SUBMIT DISPARADO");

  // 🔹 Interesses
  const interestsArray = [...document.querySelectorAll('input[name="interests"]:checked')]
    .map(el => el.value);

  if (interestsArray.length === 0) {
    showToast({
      title: t('auth.interests'),
      message: t('auth.selectAtLeastOneArea')
    });
    return;
  }

  const interests = interestsArray.join(", ");

  // 🔹 Termos
  const terms = document.getElementById("terms");
  if (!terms.checked) {
    showToast({
      title: t('auth.terms'),
      message: t('auth.acceptTerms')
    });
    return;
  }

  // 🔹 Dados principais
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const fullName = document.getElementById("full-name").value.trim();
  const nickname = document.getElementById("nickname").value.trim();
  const birthdate = document.getElementById("birthdate").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const profileImageInput = document.getElementById("profile-image");
  
  // 🔹 Processar foto (se houver)
  let profileImageBase64 = null;
  if (profileImageInput?.files?.length > 0) {
    const file = profileImageInput.files[0];
    profileImageBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  // 🔄 Loading
  buttonText.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    console.log("🚀 Iniciando registro...");
    
    // =====================
    // 1️⃣ REGISTRO
    // =====================
    console.log("📤 Enviando dados de registro para servidor...");
    const registerResponse = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        account_type: "student",
        nickname,
        interests,
        profile_image: profileImageBase64,
        gender,
        birth_date: birthdate
      })
    });

    const registerData = await registerResponse.json();
    console.log("✅ Resposta de registro:", registerData);

    if (!registerResponse.ok) {
      throw new Error(registerData.detail || "Erro ao criar conta.");
    }

    // =====================
    // 2️⃣ LOGIN AUTOMÁTICO
    // =====================
    console.log("🔐 Fazendo login automático...");
    const loginResponse = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginResponse.json();
    console.log("✅ Resposta de login:", loginData);

    if (!loginResponse.ok) {
      throw new Error("Conta criada, mas erro ao realizar login.");
    }

    // =====================
    // 3️⃣ SALVA TOKEN
    // =====================
    console.log("💾 Salvando token no localStorage...");
    // Não limpar tudo, apenas remover dados antigos de session
    localStorage.removeItem("old_token");
    localStorage.setItem("access_token", loginData.access_token);
    console.log("✅ Token salvo:", loginData.access_token);

    // =====================
    // 4️⃣ MENSAGEM DE SUCESSO
    // =====================
    console.log("🎉 Exibindo toast de sucesso...");
    showToast({
      title: t('auth.accountCreatedSuccess'),
      message: `${t('auth.accountCreatedWelcome').replace('{name}', fullName)}`,
      type: "success"
    });

    // =====================
    // 5️⃣ REDIRECIONA
    // =====================
    console.log("🔗 Redirecionando para index.html...");
    console.log("📍 Localização atual:", window.location.href);
    console.log("💾 Token no localStorage:", localStorage.getItem("access_token"));
    
    // Redirecionar imediatamente para index.html
    window.location.href = "index.html";

  } catch (err) {
    console.error("❌ ERRO NO REGISTRO:", err);
    console.error("Stack trace:", err.stack);
    showToast({
      title: "Erro",
      message: err.message || t('auth.unexpectedError')
    });
  } finally {
    buttonText.classList.remove("hidden");
    loadingSpinner.classList.add("hidden");
    submitBtn.disabled = false;
  }
});

document.addEventListener("DOMContentLoaded", () => {
    /* ===== STEPS ===== */
    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const step3 = document.getElementById("step-3");
    const step4 = document.getElementById("step-4");

    /* ===== BOTÕES ===== */
    const continueBtn1 = document.getElementById("continue-btn-1");
    const continueBtn2 = document.getElementById("continue-btn-2");
    const continueBtn3 = document.getElementById("continue-btn-3");

    const backBtn2 = document.getElementById("back-btn-2");
    const backBtn3 = document.getElementById("back-btn-3");
    const backBtn4 = document.getElementById("back-btn-4");

    /* ===== INPUTS STEP 1 ===== */
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isEmailValid = false;

    /* ================= GOOGLE/FACEBOOK ================= */
    const googleBtn = document.getElementById("google-signup");
    const facebookBtn = document.getElementById("facebook-signup");

    if (googleBtn) {
        googleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showToast({
                title: t('auth.notAvailable'),
                message: t('auth.googleNotImplemented'),
                type: "error"
            });
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener("click", (e) => {
            e.preventDefault();
            showToast({
                title: t('auth.notAvailable'),
                message: t('auth.facebookNotImplemented'),
                type: "error"
            });
        });
    }

    // 🔍 VALIDAÇÃO DE EMAIL EM TEMPO REAL
    emailInput?.addEventListener("blur", async () => {
        const email = emailInput.value.trim();
        const emailError = document.getElementById("email-error");
        
        if (!email) {
            emailError.classList.add("hidden");
            isEmailValid = false;
            return;
        }
        
        if (!emailRegex.test(email)) {
            emailError.textContent = t('auth.invalidEmail');
            emailError.classList.remove("hidden");
            isEmailValid = false;
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!data.available) {
                emailError.textContent = data.message;
                emailError.classList.remove("hidden");
                isEmailValid = false;
            } else {
                emailError.classList.add("hidden");
                isEmailValid = true;
            }
        } catch (err) {
            console.error("Erro ao validar email:", err);
            isEmailValid = false;
        }
    });

    /* ================= STEP 1: CONTINUAR ================= */
    if (continueBtn1) {
        continueBtn1.addEventListener("click", () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!email || !password || !confirmPassword) {
                showToast({
                    title: t('auth.requiredFields'),
                    message: t('auth.fillEmailPassword')
                });
                return;
            }

            if (!emailRegex.test(email)) {
                showToast({
                    title: t('auth.invalidEmail'),
                    message: t('auth.provideValidEmail')
                });
                return;
            }

            if (!isEmailValid) {
                showToast({
                    title: t('auth.emailNotAvailable'),
                    message: t('auth.emailAlreadyRegistered')
                });
                return;
            }

            if (password !== confirmPassword) {
                showToast({
                    title: t('auth.passwordsDifferent'),
                    message: t('auth.passwordsMismatch')
                });
                return;
            }

            step1.classList.add("hidden");
            step2.classList.remove("hidden");
        });
    }

    /* ================= STEP 2 ================= */
    continueBtn2?.addEventListener("click", (e) => {
        e.preventDefault();

        const fullName = document.getElementById("full-name").value.trim();
        const birthdate = document.getElementById("birthdate").value;
        const gender = document.querySelector('input[name="gender"]:checked');

        if (!fullName) {
            showToast({
                title: t('auth.requiredName'),
                message: t('auth.provideFullName')
            });
            return;
        }

        if (!birthdate) {
            showToast({
                title: t('auth.requiredBirthdate'),
                message: t('auth.provideBirthdate')
            });
            return;
        }

        if (!gender) {
            showToast({
                title: t('auth.requiredGender'),
                message: t('auth.selectGenderOption')
            });
            return;
        }

        step2.classList.add("hidden");
        step3.classList.remove("hidden");
    });

    /* ================= STEP 3 ================= */
    continueBtn3?.addEventListener("click", (e) => {
        e.preventDefault();

        const accountType = document.querySelector('input[name="account-type"]:checked');

        if (!accountType) {
            showToast({
                title: t('auth.requiredAccountType'),
                message: t('auth.selectAccountType')
            });
            return;
        }

        if (accountType.value !== "student") {
            showToast({
                title: t('auth.inDevelopment'),
                message: t('auth.onlyStudentAvailable')
            });
            return;
        }

        step3.classList.add("hidden");
        step4.classList.remove("hidden");
    });

    /* ================= VOLTAR ================= */
    backBtn2?.addEventListener("click", () => {
        step2.classList.add("hidden");
        step1.classList.remove("hidden");
    });

    backBtn3?.addEventListener("click", () => {
        step3.classList.add("hidden");
        step2.classList.remove("hidden");
    });

    backBtn4?.addEventListener("click", () => {
        step4.classList.add("hidden");
        step3.classList.remove("hidden");
    });
});
