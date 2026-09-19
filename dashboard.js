const welcomeName = document.getElementById('welcomeName');
const logoutBtn = document.getElementById('logoutBtn');
const articleForm = document.getElementById('articleForm');
const totalArticles = document.getElementById('totalArticles');
const totalUsers = document.getElementById('totalUsers');
const categorySelect = document.getElementById('articleCategory');
const regionSelect = document.getElementById('articleRegion');
const categoryList = document.getElementById('categoryList');
const regionList = document.getElementById('regionList');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const addRegionBtn = document.getElementById('addRegionBtn');
const importJsonBtn = document.getElementById('importJsonBtn');
const articlesJsonFile = document.getElementById('articlesJsonFile');
const importStatus = document.getElementById('importStatus');
const articleSectionFilter = document.getElementById('articleSectionFilter');
const articleManagementList = document.getElementById('articleManagementList');
const saveArticleBtn = document.getElementById('saveArticleBtn');
const cancelArticleEditBtn = document.getElementById('cancelArticleEditBtn');
const articleFormStatus = document.getElementById('articleFormStatus');
const breakingHeadlineForm = document.getElementById('breakingHeadlineForm');
const breakingHeadlineTitle = document.getElementById('breakingHeadlineTitle');
const breakingHeadlineKeywords = document.getElementById('breakingHeadlineKeywords');
const saveBreakingHeadlineBtn = document.getElementById('saveBreakingHeadlineBtn');
const cancelBreakingEditBtn = document.getElementById('cancelBreakingEditBtn');
const breakingHeadlineStatus = document.getElementById('breakingHeadlineStatus');
const breakingHeadlineList = document.getElementById('breakingHeadlineList');
const breakingJsonFile = document.getElementById('breakingJsonFile');
const importBreakingJsonBtn = document.getElementById('importBreakingJsonBtn');
let editingBreakingHeadlineId = null;
let editingArticleId = null;

async function verifyAdminSession() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();
    if (!response.ok || !data.authenticated || data.user.role !== 'admin') {
      window.location.href = 'index.html';
      return;
    }
    welcomeName.textContent = `مرحباً، ${data.user.name}`;
  } catch (error) {
    window.location.href = 'index.html';
  }
}

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

async function loadConfigLists() {
  const [categoriesRes, regionsRes] = await Promise.all([
    fetch('/api/categories'),
    fetch('/api/regions')
  ]);

  const categoriesData = await categoriesRes.json();
  const regionsData = await regionsRes.json();

  const categories = categoriesData.categories || [];
  const regions = regionsData.regions || [];

  categorySelect.innerHTML = categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  regionSelect.innerHTML = regions.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('');

  renderTags(categoryList, categories);
  renderTags(regionList, regions);
}

function renderTags(container, items) {
  container.innerHTML = items.map((item) => `
    <li>
      <span>${escapeHtml(item)}</span>
    </li>
  `).join('');
}

async function loadBreakingHeadlines() {
  try {
    const response = await fetch('/api/breaking-headlines');
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'تعذر تحميل العواجل');
    renderBreakingHeadlines(data.headlines || []);
  } catch (error) {
    breakingHeadlineList.innerHTML = '<p class="empty-state">تعذر تحميل عناوين العواجل.</p>';
  }
}

function renderBreakingHeadlines(headlines) {
  breakingHeadlineList.innerHTML = headlines.map((headline) => {
    const timestamp = new Date(headline.updated_at || headline.created_at);
    return `
      <article class="breaking-admin-row">
        <div>
          <strong>${escapeHtml(headline.title)}</strong>
          <small>${timestamp.toLocaleDateString('ar-EG')} - ${timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</small>
        </div>
        <div class="breaking-admin-actions">
          <button type="button" class="secondary-btn edit-breaking-btn" data-id="${headline.id}" data-title="${escapeHtml(headline.title)}" data-keywords="${encodeURIComponent(JSON.stringify(headline.keywords || []))}">تعديل</button>
          <button type="button" class="delete-article-btn delete-breaking-btn" data-id="${headline.id}">حذف</button>
        </div>
      </article>
    `;
  }).join('') || '<p class="empty-state">لا توجد عواجل مضافة حتى الآن.</p>';

  breakingHeadlineList.querySelectorAll('.edit-breaking-btn').forEach((button) => {
    button.addEventListener('click', () => {
      editingBreakingHeadlineId = button.dataset.id;
      breakingHeadlineTitle.value = button.dataset.title;
      breakingHeadlineKeywords.value = JSON.parse(decodeURIComponent(button.dataset.keywords || '%5B%5D')).join(', ');
      saveBreakingHeadlineBtn.textContent = 'حفظ تعديل العاجل';
      cancelBreakingEditBtn.classList.remove('hidden');
      breakingHeadlineTitle.focus();
    });
  });

  breakingHeadlineList.querySelectorAll('.delete-breaking-btn').forEach((button) => {
    button.addEventListener('click', () => deleteBreakingHeadline(button.dataset.id));
  });
}

breakingHeadlineForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = breakingHeadlineTitle.value.trim();
  const keywords = breakingHeadlineKeywords.value.split(',').map((keyword) => keyword.trim()).filter(Boolean);
  if (!title) return;

  const endpoint = editingBreakingHeadlineId
    ? `/api/breaking-headlines/${editingBreakingHeadlineId}`
    : '/api/breaking-headlines';
  const response = await fetch(endpoint, {
    method: editingBreakingHeadlineId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, keywords }),
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    breakingHeadlineStatus.textContent = result.message || 'تعذر حفظ العاجل.';
    breakingHeadlineStatus.className = 'form-status error';
    return;
  }

  breakingHeadlineStatus.textContent = editingBreakingHeadlineId ? 'تم تعديل العاجل.' : 'تمت إضافة العاجل.';
  breakingHeadlineStatus.className = 'form-status success';
  resetBreakingHeadlineForm();
  loadBreakingHeadlines();
});

cancelBreakingEditBtn.addEventListener('click', resetBreakingHeadlineForm);

importBreakingJsonBtn.addEventListener('click', async () => {
  const file = breakingJsonFile.files[0];
  if (!file) {
    breakingHeadlineStatus.textContent = 'اختر ملف JSON للعواجل أولاً.';
    breakingHeadlineStatus.className = 'form-status error';
    return;
  }

  try {
    const content = JSON.parse(await file.text());
    const response = await fetch('/api/breaking-headlines/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'تعذر استيراد العواجل.');

    breakingHeadlineStatus.textContent = result.message;
    breakingHeadlineStatus.className = 'form-status success';
    breakingJsonFile.value = '';
    loadBreakingHeadlines();
  } catch (error) {
    breakingHeadlineStatus.textContent = error.message || 'ملف JSON غير صالح.';
    breakingHeadlineStatus.className = 'form-status error';
  }
});

function resetBreakingHeadlineForm() {
  editingBreakingHeadlineId = null;
  breakingHeadlineTitle.value = '';
  breakingHeadlineKeywords.value = '';
  saveBreakingHeadlineBtn.textContent = 'إضافة العاجل';
  cancelBreakingEditBtn.classList.add('hidden');
}

async function deleteBreakingHeadline(headlineId) {
  if (!window.confirm('هل تريد حذف عنوان العاجل؟')) return;

  const response = await fetch(`/api/breaking-headlines/${headlineId}`, { method: 'DELETE' });
  const result = await response.json();
  if (!response.ok || !result.success) {
    breakingHeadlineStatus.textContent = result.message || 'تعذر حذف العاجل.';
    breakingHeadlineStatus.className = 'form-status error';
    return;
  }

  breakingHeadlineStatus.textContent = 'تم حذف العاجل.';
  breakingHeadlineStatus.className = 'form-status success';
  loadBreakingHeadlines();
}

async function updateDashboardStats() {
  try {
    const response = await fetch('/api/admin/stats');
    const data = await response.json();

    if (response.ok && data.success) {
      totalArticles.textContent = data.stats.articles;
      totalUsers.textContent = data.stats.users;
    }
  } catch (error) {
    totalArticles.textContent = '0';
    totalUsers.textContent = '0';
  }
}

async function loadArticleManagement() {
  try {
    const response = await fetch('/api/articles?includeAll=true');
    const data = await response.json();

    if (!response.ok || !data.success) throw new Error(data.message || 'تعذر تحميل المقالات');

    renderArticleManagement(data.articles || []);
  } catch (error) {
    articleManagementList.innerHTML = '<p class="empty-state">تعذر تحميل قائمة الأخبار والمقالات.</p>';
  }
}

function renderArticleManagement(articles) {
  const selectedCategory = articleSectionFilter.value;
  const categories = [...new Set(articles.map((article) => article.category).filter(Boolean))];
  const currentCategories = [...articleSectionFilter.options].map((option) => option.value);

  categories.forEach((category) => {
    if (!currentCategories.includes(category)) {
      articleSectionFilter.add(new Option(category, category));
    }
  });

  const visibleArticles = selectedCategory === 'all'
    ? articles
    : articles.filter((article) => article.category === selectedCategory);
  const groupedArticles = visibleArticles.reduce((groups, article) => {
    const category = article.category || 'غير مصنف';
    groups[category] = groups[category] || [];
    groups[category].push(article);
    return groups;
  }, {});

  articleManagementList.innerHTML = Object.entries(groupedArticles).map(([category, categoryArticles]) => `
    <section class="article-category-group">
      <div class="article-category-heading">
        <h4>${escapeHtml(category)}</h4>
        <span>${categoryArticles.length} مادة</span>
      </div>
      <div class="article-list">
        ${categoryArticles.map((article) => `
          <article class="managed-article-row">
            <div class="managed-article-copy">
              <div class="meta-row">
                <span class="news-tag">${escapeHtml(article.type)}</span>
                <span>${escapeHtml(article.region)}</span>
              </div>
              <h4>${escapeHtml(article.title)}</h4>
              <p>${escapeHtml(article.summary)}</p>
              <small>${escapeHtml(article.author || 'إدارة التحرير')} · ${escapeHtml(article.date)}</small>
            </div>
            <div class="managed-article-actions">
              <button class="secondary-btn edit-article-btn" type="button" data-article-id="${article.id}">تعديل</button>
              <button class="delete-article-btn" type="button" data-article-id="${article.id}">حذف</button>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `).join('') || '<p class="empty-state">لا توجد أخبار أو مقالات في هذا القسم.</p>';

  articleManagementList.querySelectorAll('.delete-article-btn').forEach((button) => {
    button.addEventListener('click', () => deleteArticle(button.dataset.articleId));
  });
  articleManagementList.querySelectorAll('.edit-article-btn').forEach((button) => {
    button.addEventListener('click', () => editArticle(button.dataset.articleId));
  });
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

async function deleteArticle(articleId) {
  if (!window.confirm('هل تريد حذف هذا المقال نهائياً؟')) return;

  const response = await fetch(`/api/articles/${articleId}`, { method: 'DELETE' });
  const result = await response.json();

  if (!response.ok || !result.success) {
    alert(result.message || 'تعذر حذف المقال');
    return;
  }

  await Promise.all([updateDashboardStats(), loadArticleManagement()]);
}

async function editArticle(articleId) {
  const response = await fetch(`/api/articles/${articleId}`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    alert(data.message || 'تعذر تحميل المقال للتعديل');
    return;
  }

  const article = data.article;
  editingArticleId = article.id;
  document.getElementById('articleTitle').value = article.title;
  document.getElementById('articleAuthor').value = article.author || '';
  document.getElementById('articleImage').value = article.image_url || '';
  document.getElementById('articleDate').value = article.date || '';
  document.getElementById('articleType').value = article.type;
  document.getElementById('articleStatus').value = article.status;
  document.getElementById('articleCategory').value = article.category;
  document.getElementById('articleRegion').value = article.region;
  document.getElementById('articleKeywords').value = (article.keywords || []).join(', ');
  document.getElementById('articleSummary').value = article.summary;
  document.getElementById('articleContent').value = article.content;
  saveArticleBtn.textContent = 'حفظ تعديل المقال';
  cancelArticleEditBtn.classList.remove('hidden');
  articleFormStatus.textContent = `تعديل المقال رقم ${article.id}`;
  articleFormStatus.className = 'form-status';
  document.getElementById('articleForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetArticleForm() {
  editingArticleId = null;
  articleForm.reset();
  saveArticleBtn.textContent = 'نشر الخبر';
  cancelArticleEditBtn.classList.add('hidden');
  articleFormStatus.textContent = '';
  articleFormStatus.className = 'form-status';
}

cancelArticleEditBtn.addEventListener('click', resetArticleForm);

articleForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const payload = {
    title: document.getElementById('articleTitle').value.trim(),
    author: document.getElementById('articleAuthor').value.trim() || 'إدارة التحرير',
    image_url: document.getElementById('articleImage').value.trim(),
    type: document.getElementById('articleType').value,
    status: document.getElementById('articleStatus').value,
    category: document.getElementById('articleCategory').value,
    region: document.getElementById('articleRegion').value,
    date: document.getElementById('articleDate').value || new Date().toISOString().slice(0, 10),
    keywords: (document.getElementById('articleKeywords').value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    summary: document.getElementById('articleSummary').value.trim(),
    content: document.getElementById('articleContent').value.trim(),
  };

  if (!payload.title || !payload.summary || !payload.content) {
    alert('الرجاء إدخال العنوان والمحتوى والملخص');
    return;
  }

  try {
    const endpoint = editingArticleId ? `/api/articles/${editingArticleId}` : '/api/articles';
    const response = await fetch(endpoint, {
      method: editingArticleId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'فشل في نشر الخبر');
    }

    articleFormStatus.textContent = editingArticleId ? 'تم تعديل المقال بنجاح.' : 'تم نشر الخبر بنجاح.';
    articleFormStatus.className = 'form-status success';
    resetArticleForm();
    updateDashboardStats();
    loadArticleManagement();
    loadConfigLists();
  } catch (error) {
    alert(error.message || 'حدث خطأ');
  }
});

addCategoryBtn.addEventListener('click', async () => {
  const value = document.getElementById('newCategory').value.trim();
  if (!value) return;

  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: value }),
  });

  document.getElementById('newCategory').value = '';
  loadConfigLists();
});

addRegionBtn.addEventListener('click', async () => {
  const value = document.getElementById('newRegion').value.trim();
  if (!value) return;

  await fetch('/api/regions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: value }),
  });

  document.getElementById('newRegion').value = '';
  loadConfigLists();
});

importJsonBtn.addEventListener('click', async () => {
  const selectedFile = articlesJsonFile.files[0];

  if (!selectedFile) {
    importStatus.textContent = 'اختر ملف JSON أولاً.';
    importStatus.className = 'form-status error';
    return;
  }

  try {
    const jsonContent = JSON.parse(await selectedFile.text());
    const response = await fetch('/api/articles/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonContent),
    });
    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('الخادم أعاد صفحة HTML. أعد تشغيل server.js ثم حاول مرة أخرى.');
    }

    if (!response.ok) throw new Error(result.message || 'فشل استيراد ملف JSON');

    importStatus.textContent = result.message;
    importStatus.className = 'form-status success';
    articlesJsonFile.value = '';
    updateDashboardStats();
    loadArticleManagement();
  } catch (error) {
    importStatus.textContent = error.message || 'ملف JSON غير صالح.';
    importStatus.className = 'form-status error';
  }
});

loadConfigLists();
updateDashboardStats();
articleSectionFilter.addEventListener('change', loadArticleManagement);
loadArticleManagement();
loadBreakingHeadlines();
verifyAdminSession();
