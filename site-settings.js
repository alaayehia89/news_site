const identityForm = document.getElementById('identityForm');
const siteNameInput = document.getElementById('siteNameInput');
const taglineInput = document.getElementById('taglineInput');
const logoUrlInput = document.getElementById('logoUrlInput');
const faviconUrlInput = document.getElementById('faviconUrlInput');
const primaryColorInput = document.getElementById('primaryColorInput');
const accentColorInput = document.getElementById('accentColorInput');
const backgroundColorInput = document.getElementById('backgroundColorInput');
const textColorInput = document.getElementById('textColorInput');
const heroBadgeInput = document.getElementById('heroBadgeInput');
const heroTitleInput = document.getElementById('heroTitleInput');
const heroDescriptionInput = document.getElementById('heroDescriptionInput');
const heroPrimaryActionInput = document.getElementById('heroPrimaryActionInput');
const heroSecondaryActionInput = document.getElementById('heroSecondaryActionInput');
const identityPreviewLogo = document.getElementById('identityPreviewLogo');
const identityPreviewName = document.getElementById('identityPreviewName');
const identityPreviewTagline = document.getElementById('identityPreviewTagline');
const identityStatus = document.getElementById('identityStatus');
const logoutBtn = document.getElementById('logoutBtn');
const sectionLabelsForm = document.getElementById('sectionLabelsForm');
const sectionLabelsStatus = document.getElementById('sectionLabelsStatus');
const showBreakingInput = document.getElementById('showBreakingInput');
const showLatestAnalysisInput = document.getElementById('showLatestAnalysisInput');
const showFiltersInput = document.getElementById('showFiltersInput');
const saveVisibilityBtn = document.getElementById('saveVisibilityBtn');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
const visibilityStatus = document.getElementById('visibilityStatus');
const defaultSectionLabels = {
  breaking: 'العواجل',
  politics: 'سياسة',
  economy: 'اقتصاد',
  sports: 'رياضة',
  technology: 'تقنية',
  culture: 'ثقافة',
  opinion: 'الرأي',
  analysis: 'التحليلات',
};

async function verifyAdminSession() {
  const response = await fetch('/api/me');
  const data = await response.json();
  if (!response.ok || !data.authenticated || data.user.role !== 'admin') {
    window.location.href = 'index.html';
    throw new Error('يجب تسجيل الدخول كمدير.');
  }
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

function updatePreview() {
  const name = siteNameInput.value.trim() || 'الخبر';
  identityPreviewName.textContent = name;
  identityPreviewTagline.textContent = taglineInput.value.trim() || 'تغطية مستمرة للأحداث';
  identityPreviewLogo.textContent = name.charAt(0) || 'A';
  identityPreviewLogo.style.backgroundColor = primaryColorInput.value;
  identityPreviewLogo.style.backgroundImage = logoUrlInput.value.trim()
    ? `url("${logoUrlInput.value.trim().replace(/"/g, '%22')}")`
    : '';
  identityPreviewLogo.classList.toggle('has-site-logo', Boolean(logoUrlInput.value.trim()));
}

async function loadSettings() {
  const response = await fetch('/api/site-settings');
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'تعذر تحميل الإعدادات');

  const settings = data.settings;
  siteNameInput.value = settings.siteName || '';
  taglineInput.value = settings.tagline || '';
  logoUrlInput.value = settings.logoUrl || '';
  faviconUrlInput.value = settings.faviconUrl || '';
  primaryColorInput.value = settings.primaryColor || '#1d4ed8';
  accentColorInput.value = settings.accentColor || '#dc2626';
  backgroundColorInput.value = settings.backgroundColor || '#f4f7fb';
  textColorInput.value = settings.textColor || '#0f172a';
  heroBadgeInput.value = settings.heroBadge || 'أحدث الأخبار';
  heroTitleInput.value = settings.heroTitle || '';
  heroDescriptionInput.value = settings.heroDescription || '';
  heroPrimaryActionInput.value = settings.heroPrimaryAction || 'اقرأ الأخبار';
  heroSecondaryActionInput.value = settings.heroSecondaryAction || 'لوحة التحرير';
  showBreakingInput.checked = settings.showBreaking !== false;
  showLatestAnalysisInput.checked = settings.showLatestAnalysis !== false;
  showFiltersInput.checked = settings.showFilters !== false;
  updatePreview();
  sectionLabelsForm.querySelectorAll('[data-section-label-key]').forEach((input) => {
    input.value = settings.sectionLabels?.[input.dataset.sectionLabelKey]
      || defaultSectionLabels[input.dataset.sectionLabelKey];
  });
}

sectionLabelsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const currentResponse = await fetch('/api/site-settings');
  const currentData = await currentResponse.json();
  const sectionLabels = {};
  sectionLabelsForm.querySelectorAll('[data-section-label-key]').forEach((input) => {
    sectionLabels[input.dataset.sectionLabelKey] = input.value.trim();
  });

  const response = await fetch('/api/site-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...currentData.settings, sectionLabels }),
  });
  const result = await response.json();
  sectionLabelsStatus.textContent = response.ok && result.success
    ? 'تم حفظ مسميات الأقسام.'
    : (result.message || 'تعذر حفظ المسميات.');
  sectionLabelsStatus.className = `form-status ${response.ok && result.success ? 'success' : 'error'}`;
});

identityForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  identityStatus.textContent = 'جارٍ الحفظ...';
  identityStatus.className = 'form-status';

  try {
    const response = await fetch('/api/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteName: siteNameInput.value.trim(),
        tagline: taglineInput.value.trim(),
        logoUrl: logoUrlInput.value.trim(),
        faviconUrl: faviconUrlInput.value.trim(),
        primaryColor: primaryColorInput.value,
        accentColor: accentColorInput.value,
        backgroundColor: backgroundColorInput.value,
        textColor: textColorInput.value,
        heroBadge: heroBadgeInput.value.trim(),
        heroTitle: heroTitleInput.value.trim(),
        heroDescription: heroDescriptionInput.value.trim(),
        heroPrimaryAction: heroPrimaryActionInput.value.trim(),
        heroSecondaryAction: heroSecondaryActionInput.value.trim(),
        showBreaking: showBreakingInput.checked,
        showLatestAnalysis: showLatestAnalysisInput.checked,
        showFilters: showFiltersInput.checked,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'تعذر حفظ الإعدادات');

    identityStatus.textContent = 'تم حفظ الهوية البصرية بنجاح.';
    identityStatus.className = 'form-status success';
    updatePreview();
    if (typeof applySiteSettings === 'function') await applySiteSettings();
  } catch (error) {
    identityStatus.textContent = error.message || 'تعذر حفظ الإعدادات.';
    identityStatus.className = 'form-status error';
  }
});

saveVisibilityBtn.addEventListener('click', async () => {
  const currentResponse = await fetch('/api/site-settings');
  const currentData = await currentResponse.json();
  const response = await fetch('/api/site-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...currentData.settings,
      showBreaking: showBreakingInput.checked,
      showLatestAnalysis: showLatestAnalysisInput.checked,
      showFilters: showFiltersInput.checked,
    }),
  });
  const result = await response.json();
  visibilityStatus.textContent = response.ok && result.success
    ? 'تم حفظ إعدادات عرض الصفحة.'
    : (result.message || 'تعذر حفظ إعدادات العرض.');
  visibilityStatus.className = `form-status ${response.ok && result.success ? 'success' : 'error'}`;
});

resetSettingsBtn.addEventListener('click', async () => {
  if (!window.confirm('هل تريد استعادة إعدادات الموقع الافتراضية؟')) return;
  const response = await fetch('/api/site-settings/reset', { method: 'POST' });
  const result = await response.json();
  if (!response.ok || !result.success) {
    visibilityStatus.textContent = result.message || 'تعذر الاستعادة.';
    visibilityStatus.className = 'form-status error';
    return;
  }
  await loadSettings();
  visibilityStatus.textContent = 'تمت استعادة الإعدادات الافتراضية.';
  visibilityStatus.className = 'form-status success';
});

[siteNameInput, taglineInput, logoUrlInput, primaryColorInput, accentColorInput, backgroundColorInput, textColorInput,
  heroBadgeInput, heroTitleInput, heroDescriptionInput, heroPrimaryActionInput, heroSecondaryActionInput]
  .forEach((input) => input.addEventListener('input', updatePreview));

verifyAdminSession()
  .then(() => loadSettings())
  .catch((error) => {
    identityStatus.textContent = error.message;
    identityStatus.className = 'form-status error';
  });
