async function applySiteSettings() {
  try {
    const response = await fetch('/api/site-settings');
    const data = await response.json();
    if (!response.ok || !data.success) return;

    const settings = data.settings;
    document.documentElement.style.setProperty('--site-primary', settings.primaryColor);
    document.documentElement.style.setProperty('--site-accent', settings.accentColor);
    document.documentElement.style.setProperty('--site-background', settings.backgroundColor || '#f4f7fb');
    document.documentElement.style.setProperty('--site-text', settings.textColor || '#0f172a');

    document.querySelectorAll('[data-site-name]').forEach((element) => {
      element.textContent = settings.siteName;
    });

    document.querySelectorAll('[data-site-tagline]').forEach((element) => {
      element.textContent = settings.tagline || '';
    });

    document.querySelectorAll('[data-site-setting]').forEach((element) => {
      const value = settings[element.dataset.siteSetting];
      if (value !== undefined) element.textContent = value;
    });

    document.querySelectorAll('[data-site-visibility]').forEach((element) => {
      const visible = settings[element.dataset.siteVisibility] !== false;
      element.hidden = !visible;
    });

    document.querySelectorAll('[data-section-key]').forEach((element) => {
      const label = settings.sectionLabels?.[element.dataset.sectionKey];
      if (label) element.textContent = label;
    });

    document.querySelectorAll('[data-site-logo]').forEach((element) => {
      element.textContent = settings.siteName.trim().charAt(0) || 'A';
      if (settings.logoUrl) {
        element.style.backgroundImage = `url("${settings.logoUrl.replace(/"/g, '%22')}")`;
        element.classList.add('has-site-logo');
      } else {
        element.style.backgroundImage = '';
        element.classList.remove('has-site-logo');
      }
    });

    if (settings.faviconUrl) {
      let favicon = document.querySelector('link[data-site-favicon]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.dataset.siteFavicon = 'true';
        document.head.appendChild(favicon);
      }
      favicon.href = settings.faviconUrl;
    }

    if (document.body.dataset.sitePageTitle !== 'false') {
      document.title = `${settings.siteName} | ${document.title.split('|').pop().trim()}`;
    }
  } catch (error) {
    // The default labels remain visible if settings cannot be loaded.
  }
}

applySiteSettings();
