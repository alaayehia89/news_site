// Staff Signup Page - تسجيل المديرين والمحررين والكتاب

const ACCESS_CODES = {
  admin: 'ADMIN2024',
  editor: 'EDITOR2024',
  writer: 'WRITER2024'
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('staffSignupForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const accessCodeInput = document.getElementById('accessCode');
  const accessCodeField = document.getElementById('accessCodeField');
  const roleOptions = document.querySelectorAll('.role-option');
  const roleInputs = document.querySelectorAll('input[name="role"]');
  const togglePasswordBtn = document.querySelector('.toggle-password');

  let selectedRole = 'admin';

  // Role selection handling
  roleOptions.forEach(option => {
    option.addEventListener('click', () => {
      roleOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      const input = option.querySelector('input');
      input.checked = true;
      selectedRole = input.value;

      // Show access code field for admin and editor
      if (selectedRole === 'admin' || selectedRole === 'editor') {
        accessCodeField.classList.add('visible');
      } else {
        accessCodeField.classList.remove('visible');
      }
    });
  });

  // Toggle password visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePasswordBtn.textContent = type === 'password' ? 'عرض' : 'إخفاء';
    });
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Validate inputs
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const accessCode = accessCodeInput.value.trim();

    let hasError = false;

    if (!name) {
      showError('nameError', 'الاسم مطلوب');
      hasError = true;
    }

    if (!email) {
      showError('emailError', 'البريد الإلكتروني مطلوب');
    } else if (!isValidEmail(email)) {
      showError('emailError', 'يرجى إدخال بريد إلكتروني صالح');
      hasError = true;
    }

    if (!password) {
      showError('passwordError', 'كلمة المرور مطلوبة');
      hasError = true;
    } else if (password.length < 6) {
      showError('passwordError', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      hasError = true;
    }

    if (password !== confirmPassword) {
      showError('confirmPasswordError', 'كلمات المرور غير متطابقة');
      hasError = true;
    }

    // Validate access code for admin and editor
    if ((selectedRole === 'admin' || selectedRole === 'editor') && !accessCode) {
      showError('accessCodeError', 'رمز الوصول مطلوب لهذا الدور');
      hasError = true;
    } else if ((selectedRole === 'admin' || selectedRole === 'editor') && accessCode !== ACCESS_CODES[selectedRole]) {
      showError('accessCodeError', 'رمز الوصول غير صحيح');
      hasError = true;
    }

    if (hasError) return;

    const submitBtn = document.getElementById('staffSignupBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري التسجيل...';

    try {
      const response = await fetch('/api/staff-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role: selectedRole
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('تم تسجيل الحساب بنجاح! سيتم توجيهك لصفحة الدخول.');
        window.location.href = 'index.html';
      } else {
        showError('nameError', data.message || 'حدث خطأ أثناء التسجيل');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('nameError', 'تعذر الاتصال بالخادم');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'إنشاء الحساب';
    }
  });

  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  }

  function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
