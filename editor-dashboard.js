// Editor Dashboard - لوحة تحكم المحرر

const welcomeName = document.getElementById('welcomeName');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const articleForm = document.getElementById('articleForm');
const myArticlesCount = document.getElementById('myArticlesCount');
const myDraftsCount = document.getElementById('myDraftsCount');
const pendingCount = document.getElementById('pendingCount');
const publishedCount = document.getElementById('publishedCount');
const categorySelect = document.getElementById('articleCategory');
const regionSelect = document.getElementById('articleRegion');
const articleSectionFilter = document.getElementById('articleSectionFilter');
const articleManagementList = document.getElementById('articleManagementList');
const myArticlesList = document.getElementById('myArticlesList');
const saveArticleBtn = document.getElementById('saveArticleBtn');
const cancelArticleEditBtn = document.getElementById('cancelArticleEditBtn');
const articleFormStatus = document.getElementById('articleFormStatus');

let editingArticleId = null;
let currentUser = null;

async function verifyEditorSession() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();
    if (!response.ok || !data.authenticated || (data.user.role !== 'admin' && data.user.role !== 'editor')) {
      window.location.href = 'index.html';
      return;
    }
    currentUser = data.user;
    welcomeName.textContent = `مرحباً، ${data.user.name}`;
    userRole.textContent = data.user.role === 'admin' ? 'مدير' : 'محرر';
    
    // Show admin-only sections for admins
    if (data.user.role === 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    }
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

  categorySelect.innerHTML = '<option value="">اختر التصنيف</option>' + categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  regionSelect.innerHTML = '<option value="">اختر المنطقة</option>' + regions.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('');
}

async function loadMyArticles() {
  try {
    const response = await fetch('/api/articles?author=' + encodeURIComponent(currentUser.email));
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'تعذر تحميل المقالات');
    
    const articles = data.articles || [];
    renderMyArticles(articles);
    updateStats(articles);
  } catch (error) {
    myArticlesList.innerHTML = '<p class="empty-state">تعذر تحميل مقالاتك.</p>';
  }
}

function renderMyArticles(articles) {
  if (articles.length === 0) {
    myArticlesList.innerHTML = '<p class="empty-state">لا توجد مقالات بعد.</p>';
    return;
  }

  myArticlesList.innerHTML = articles.slice(0, 10).map(article => {
    const statusLabel = getStatusLabel(article.status);
    const statusClass = getStatusClass(article.status);
    return `
      <div class="article-row">
        <div>
          <strong>${escapeHtml(article.title)}</strong>
          <small>${escapeHtml(article.date)} • ${statusLabel}</small>
        </div>
        <div class="article-actions">
          <button type="button" class="secondary-btn edit-article-btn" data-id="${article.id}">تعديل</button>
          ${article.status === 'Draft' ? '<button type="button" class="primary-btn submit-review-btn" data-id="' + article.id + '">إرسال للمراجعة</button>' : ''}
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners
  document.querySelectorAll('.edit-article-btn').forEach(btn => {
    btn.addEventListener('click', () => editArticle(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.submit-review-btn').forEach(btn => {
    btn.addEventListener('click', () => submitForReview(parseInt(btn.dataset.id)));
  });
}

function updateStats(articles) {
  const drafts = articles.filter(a => a.status === 'Draft').length;
  const pending = articles.filter(a => a.status === 'Pending').length;
  const published = articles.filter(a => a.status === 'Published').length;

  myArticlesCount.textContent = articles.length;
  myDraftsCount.textContent = drafts;
  pendingCount.textContent = pending;
  publishedCount.textContent = published;
}

async function loadAllArticles() {
  try {
    const filter = articleSectionFilter.value;
    let url = '/api/articles?includeAll=true';
    if (filter && filter !== 'all') {
      url += '&status=' + encodeURIComponent(filter);
    }

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'تعذر تحميل المقالات');

    renderArticleManagementList(data.articles || []);
  } catch (error) {
    articleManagementList.innerHTML = '<p class="empty-state">تعذر تحميل المقالات.</p>';
  }
}

function renderArticleManagementList(articles) {
  if (articles.length === 0) {
    articleManagementList.innerHTML = '<p class="empty-state">لا توجد مقالات.</p>';
    return;
  }

  articleManagementList.innerHTML = articles.map(article => {
    const statusLabel = getStatusLabel(article.status);
    return `
      <div class="article-row">
        <div>
          <strong>${escapeHtml(article.title)}</strong>
          <small>${escapeHtml(article.author)} • ${escapeHtml(article.date)} • ${statusLabel}</small>
        </div>
        <div class="article-actions">
          <button type="button" class="secondary-btn edit-article-btn" data-id="${article.id}">تعديل</button>
          ${currentUser.role === 'admin' || currentUser.role === 'editor' ? `
            ${article.status === 'Pending' ? '<button type="button" class="primary-btn approve-btn" data-id="' + article.id + '">نشر</button>' : ''}
            ${article.status === 'Published' ? '<button type="button" class="warning-btn unpublish-btn" data-id="' + article.id + '">إخفاء</button>' : ''}
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners
  document.querySelectorAll('.edit-article-btn').forEach(btn => {
    btn.addEventListener('click', () => editArticle(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', () => publishArticle(parseInt(btn.dataset.id)));
  });

  document.querySelectorAll('.unpublish-btn').forEach(btn => {
    btn.addEventListener('click', () => unpublishArticle(parseInt(btn.dataset.id)));
  });
}

function getStatusLabel(status) {
  switch (status) {
    case 'Draft': return 'مسودة';
    case 'Pending': return 'في الانتظار';
    case 'Published': return 'منشور';
    default: return status;
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'Draft': return 'status-draft';
    case 'Pending': return 'status-pending';
    case 'Published': return 'status-published';
    default: return '';
  }
}

async function editArticle(id) {
  try {
    const response = await fetch('/api/articles/' + id);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'تعذر تحميل المقال');

    const article = data.article;
    editingArticleId = id;

    document.getElementById('articleTitle').value = article.title;
    document.getElementById('articleAuthor').value = article.author || '';
    document.getElementById('articleImage').value = article.image_url || '';
    document.getElementById('articleDate').value = article.date;
    document.getElementById('articleType').value = article.type;
    document.getElementById('articleStatus').value = article.status;
    document.getElementById('articleCategory').value = article.category;
    document.getElementById('articleRegion').value = article.region;
    document.getElementById('articleKeywords').value = (article.keywords || []).join('، ');
    document.getElementById('articleSummary').value = article.summary;
    document.getElementById('articleContent').value = article.content;

    saveArticleBtn.textContent = 'تحديث المقال';
    cancelArticleEditBtn.classList.remove('hidden');
    articleForm.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    alert('تعذر تحميل المقال للتعديل');
  }
}

async function publishArticle(id) {
  if (!confirm('هل أنت متأكد من نشر هذا المقال؟')) return;

  try {
    const response = await fetch('/api/articles/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Published' })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'فشل نشر المقال');

    loadAllArticles();
    loadMyArticles();
  } catch (error) {
    alert('فشل نشر المقال: ' + error.message);
  }
}

async function unpublishArticle(id) {
  if (!confirm('هل أنت متأكد من إخفاء هذا المقال؟')) return;

  try {
    const response = await fetch('/api/articles/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Draft' })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'فشل إخفاء المقال');

    loadAllArticles();
    loadMyArticles();
  } catch (error) {
    alert('فشل إخفاء المقال: ' + error.message);
  }
}

async function submitForReview(id) {
  if (!confirm('هل أنت متأكد من إرسال هذا المقال للمراجعة؟')) return;

  try {
    const response = await fetch('/api/articles/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Pending' })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'فشل إرسال المقال للمراجعة');

    loadAllArticles();
    loadMyArticles();
  } catch (error) {
    alert('فشل إرسال المقال للمراجعة: ' + error.message);
  }
}

articleForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const articleData = {
    title: document.getElementById('articleTitle').value.trim(),
    author: document.getElementById('articleAuthor').value.trim() || currentUser.name,
    image_url: document.getElementById('articleImage').value.trim(),
    date: document.getElementById('articleDate').value,
    type: document.getElementById('articleType').value,
    status: document.getElementById('articleStatus').value,
    category: document.getElementById('articleCategory').value,
    region: document.getElementById('articleRegion').value,
    keywords: document.getElementById('articleKeywords').value.split(/[،,]/).map(k => k.trim()).filter(k => k),
    summary: document.getElementById('articleSummary').value.trim(),
    content: document.getElementById('articleContent').value.trim()
  };

  if (!articleData.title || !articleData.summary || !articleData.content) {
    articleFormStatus.textContent = 'يرجى ملء الحقول المطلوبة';
    articleFormStatus.className = 'form-status error';
    return;
  }

  try {
    let response;
    if (editingArticleId) {
      response = await fetch('/api/articles/' + editingArticleId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
    } else {
      response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
    }

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'فشل حفظ المقال');

    articleFormStatus.textContent = 'تم حفظ المقال بنجاح';
    articleFormStatus.className = 'form-status success';

    if (editingArticleId) {
      editingArticleId = null;
      saveArticleBtn.textContent = 'حفظ المقال';
      cancelArticleEditBtn.classList.add('hidden');
    }

    articleForm.reset();
    loadMyArticles();
    loadAllArticles();

    setTimeout(() => {
      articleFormStatus.textContent = '';
    }, 3000);
  } catch (error) {
    articleFormStatus.textContent = 'خطأ: ' + error.message;
    articleFormStatus.className = 'form-status error';
  }
});

cancelArticleEditBtn.addEventListener('click', () => {
  editingArticleId = null;
  saveArticleBtn.textContent = 'حفظ المقال';
  cancelArticleEditBtn.classList.add('hidden');
  articleForm.reset();
  articleFormStatus.textContent = '';
});

articleSectionFilter.addEventListener('change', loadAllArticles);

// Helper function
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
verifyEditorSession();
loadConfigLists();
loadMyArticles();
loadAllArticles();
