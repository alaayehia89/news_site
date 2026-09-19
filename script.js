const authForm = document.getElementById('authForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const togglePasswordBtn = document.querySelector('.toggle-password');
const formTitle = document.getElementById('formTitle');
const formEyebrow = document.getElementById('formEyebrow');
const switchMode = document.getElementById('switchMode');
const switchText = document.getElementById('switchText');
const nameGroup = document.getElementById('nameGroup');
const submitBtn = document.getElementById('submitBtn');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let isRegisterMode = false;

function clearError(input, errorElement) {
  input.setAttribute('aria-invalid', 'false');
  errorElement.textContent = '';
}

function showError(input, errorElement, message) {
  input.setAttribute('aria-invalid', 'true');
  errorElement.textContent = message;
}

function validateForm() {
  let valid = true;

  if (isRegisterMode && !nameInput.value.trim()) {
    showError(nameInput, nameError, 'Full name is required.');
    valid = false;
  } else if (isRegisterMode) {
    clearError(nameInput, nameError);
  }

  if (!emailInput.value.trim()) {
    showError(emailInput, emailError, 'Email is required.');
    valid = false;
  } else if (!emailPattern.test(emailInput.value.trim())) {
    showError(emailInput, emailError, 'Please enter a valid email address.');
    valid = false;
  } else {
    clearError(emailInput, emailError);
  }

  if (!passwordInput.value.trim()) {
    showError(passwordInput, passwordError, 'Password is required.');
    valid = false;
  } else if (passwordInput.value.length < 6) {
    showError(passwordInput, passwordError, 'Password must be at least 6 characters long.');
    valid = false;
  } else {
    clearError(passwordInput, passwordError);
  }

  return valid;
}

function setMode(mode) {
  isRegisterMode = mode === 'register';
  nameGroup.classList.toggle('hidden', !isRegisterMode);
  formTitle.textContent = isRegisterMode ? 'Create account' : 'Sign in';
  formEyebrow.textContent = isRegisterMode ? 'Create account' : 'Account Login';
  submitBtn.textContent = isRegisterMode ? 'Create Account' : 'Sign In';
  switchText.textContent = isRegisterMode ? 'Already have an account?' : 'Don’t have an account?';
  switchMode.textContent = isRegisterMode ? 'Sign in' : 'Create one';

  if (!isRegisterMode) {
    nameInput.value = '';
    nameError.textContent = '';
  }
}

async function submitAuthForm(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
  };

  const endpoint = isRegisterMode ? '/api/register' : '/api/login';
  const actionText = isRegisterMode ? 'Creating account...' : 'Signing in...';

  submitBtn.disabled = true;
  submitBtn.textContent = actionText;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed.');
    }

    const status = document.createElement('div');
    status.className = 'form-status success';
    status.textContent = data.message;

    const existingStatus = document.querySelector('.form-status');
    if (existingStatus) {
      existingStatus.remove();
    }

    authForm.insertBefore(status, submitBtn);
    submitBtn.textContent = isRegisterMode ? 'Account Created' : 'Signed In';
    submitBtn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';

    if (isRegisterMode) {
      authForm.reset();
      setTimeout(() => {
        setMode('login');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
        submitBtn.style.background = '';
        const statusEl = document.querySelector('.form-status');
        if (statusEl) statusEl.remove();
      }, 1800);
    } else {
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    }
  } catch (error) {
    const status = document.createElement('div');
    status.className = 'form-status error';
    status.textContent = error.message;

    const existingStatus = document.querySelector('.form-status');
    if (existingStatus) {
      existingStatus.remove();
    }

    authForm.insertBefore(status, submitBtn);
    submitBtn.disabled = false;
    submitBtn.textContent = isRegisterMode ? 'Create Account' : 'Sign In';
    submitBtn.style.background = '';
  }
}

authForm.addEventListener('submit', submitAuthForm);

switchMode.addEventListener('click', function (event) {
  event.preventDefault();
  setMode(isRegisterMode ? 'login' : 'register');
});

togglePasswordBtn.addEventListener('click', function () {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePasswordBtn.textContent = isPassword ? 'Hide' : 'Show';
});

setMode('login');
