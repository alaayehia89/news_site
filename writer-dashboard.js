// Writer Dashboard - لوحة تحكم الكاتب

const welcomeName = document.getElementById('welcomeName');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const articleForm = document.getElementById('articleForm');
const myDraftsCount = document.getElementById('myDraftsCount');
const pendingCount = document.getElementById('pendingCount');
const publishedCount = document.getElementById('publishedCount');
const totalCount = document.getElementById('totalCount');
const categorySelect = document.getElementById('articleCategory');
const regionSelect = document.getElementById('articleRegion');
const articleSectionFilter = document.getElementById('articleSectionFilter');
const articleManagementList = document.getElementById('articleManagementList');
const saveArticleBtn = document.getElementById('saveArticleBtn');
const submitForReviewBtn = document.getElementById('submitForReviewBtn');
const cancelArticleEditBtn = document.getElementById('cancelArticleEditBtn');
const articleFormStatus = document.getElementById('articleFormStatus');

let editingArticleId = null;
let currentUser = null;

async function verifyWriterSession() {
  try {
    const response = await fetch('/api/me');
    const data = await response.json();
    if (!response.ok || !data.authenticated || !['admin', 'editor', 'writer'].includes(data.user.role)) {
      window.location.href = 'index.html';
      return;
    }
    currentUser = data.user;
    welcomeName.textContent = `مرحباً، ${data.user.name}`;
    
    const roleLabels = {
      'admin': 'مدير',
      'editor': 'محرر',
      'writer': 'كاتب'
    };
    userRole.textContent = roleLabels[data.user.role] || data.user.role;
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
    articleManagementList.innerHTML = '<p class="empty-state">تعذر تحميل مقالاتك.</p>';
  }
}

function renderMyArticles(articles) {
  if (articles.length === 0) {
    articleManagementList.innerHTML = '<p class="empty-state">لا توجد مقالات بعد. ابدأ بكتابة مقال جديد!</p>';
    return;
  }

  articleManagementList.innerHTML = articles.map(article => {
    const statusLabel = getStatusLabel(article.status);
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
    btn.addEventListener('click', () => submitArticleForReview(parseInt(btn.dataset.id)));
  });
}

function updateStats(articles) {
  const drafts = articles.filter(a => a.status === 'Draft').length;
  const pending = articles.filter(a => a.status === 'Pending').length;
  const published = articles.filter(a => a.status === 'Published').length;

  myDraftsCount.textContent = drafts;
  pendingCount.textContent = pending;
  publishedCount.textContent = published;
  totalCount.textContent = articles.length;
}

function getStatusLabel(status) {
  switch (status) {
    case 'Draft': return 'مسودة';
    case 'Pending': return 'في الانتظار';
    case 'Published': return 'منشور';
    default: return status;
  }
}

async function editArticle(id) {
  try {
    const response = await fetch('/api/articles/' + id);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'تعذر تحميل المقال');

    const article = data.article;
    
    // Verify ownership
    if (article.author !== currentUser.name && article.author !== currentUser.email) {
      alert('لا يمكنك تعديل هذا المقال');
      return;
    }

    editingArticleId = id;

    document.getElementById('articleTitle').value = article.title;
    document.getElementById('articleAuthor').value = article.author || '';
    document.getElementById('articleImage').value = article.image_url || '';
    document.getElementById('articleDate').value = article.date;
    document.getElementById('articleType').value = article.type;
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

async function submitArticleForReview(id) {
  if (!confirm('هل أنت متأكد من إرسال هذا المقال للمراجعة؟')) return;

  try {
    const response = await fetch('/api/articles/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Pending' })
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'فشل إرسال المقال للمراجعة');

    loadMyArticles();
    articleFormStatus.textContent = 'تم إرسال المقال للمراجعة';
    articleFormStatus.className = 'form-status success';
    setTimeout(() => articleFormStatus.textContent = '', 3000);
  } catch (error) {
    alert('فشل إرسال المقال للمراجعة: ' + error.message);
  }
}

// Save as draft
articleForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const articleData = {
    title: document.getElementById('articleTitle').value.trim(),
    author: document.getElementById('articleAuthor').value.trim() || currentUser.name,
    image_url: document.getElementById('articleImage').value.trim(),
    date: document.getElementById('articleDate').value,
    type: document.getElementById('articleType').value,
    status: 'Draft', // Always save as draft for writers
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

    articleFormStatus.textContent = 'تم حفظ المسودة بنجاح';
    articleFormStatus.className = 'form-status success';

    if (editingArticleId) {
      editingArticleId = null;
      saveArticleBtn.textContent = 'حفظ كمسودة';
      cancelArticleEditBtn.classList.add('hidden');
    }

    articleForm.reset();
    loadMyArticles();

    setTimeout(() => {
      articleFormStatus.textContent = '';
    }, 3000);
  } catch (error) {
    articleFormStatus.textContent = 'خطأ: ' + error.message;
    articleFormStatus.className = 'form-status error';
  }
});

// Submit for review button
submitForReviewBtn.addEventListener('click', async () => {
  const articleData = {
    title: document.getElementById('articleTitle').value.trim(),
    author: document.getElementById('articleAuthor').value.trim() || currentUser.name,
    image_url: document.getElementById('articleImage').value.trim(),
    date: document.getElementById('articleDate').value,
    type: document.getElementById('articleType').value,
    status: 'Pending', // Submit for review
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
    if (!response.ok || !data.success) throw new Error(data.message || 'فشل إرسال المقال للمراجعة');

    articleFormStatus.textContent = 'تم إرسال المقال للمراجعة بنجاح';
    articleFormStatus.className = 'form-status success';

    if (editingArticleId) {
      editingArticleId = null;
      saveArticleBtn.textContent = 'حفظ كمسودة';
      cancelArticleEditBtn.classList.add('hidden');
    }

    articleForm.reset();
    loadMyArticles();

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
  saveArticleBtn.textContent = 'حفظ كمسودة';
  cancelArticleEditBtn.classList.add('hidden');
  articleForm.reset();
  articleFormStatus.textContent = '';
});

articleSectionFilter.addEventListener('change', loadMyArticles);

// Helper function
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
verifyWriterSession();
loadConfigLists();
loadMyArticles();
