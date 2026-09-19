async function loadAnalytics() {
  const response = await fetch('/api/articles');
  const data = await response.json();

  const articles = data.articles || [];

  const categoryMap = {};
  const regionMap = {};
  const keywordMap = {};

  articles.forEach((article) => {
    categoryMap[article.category] = (categoryMap[article.category] || 0) + 1;
    regionMap[article.region] = (regionMap[article.region] || 0) + 1;

    (article.keywords || []).forEach((word) => {
      const clean = word.trim();
      if (!clean) return;
      keywordMap[clean] = (keywordMap[clean] || 0) + 1;
    });
  });

  renderList('topCategories', categoryMap);
  renderList('topRegions', regionMap);
  renderKeywords(keywordMap);
}

function renderList(id, map) {
  const list = document.getElementById(id);
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);

  list.innerHTML = entries.map(([name, count]) => `
    <li><span>${escapeHtml(name)}</span><strong>${count}</strong></li>
  `).join('');
}

function renderKeywords(map) {
  const cloud = document.getElementById('keywordCloud');
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 12);

  cloud.innerHTML = entries.map(([word, count]) => `
    <span style="font-size:${Math.min(2 + count * 0.5, 2.3)}rem">${escapeHtml(word)}</span>
  `).join('');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character]));
}

loadAnalytics();
