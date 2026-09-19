const newsGrid = document.getElementById('latest-news');
const categoryFilter = document.getElementById('categoryFilter');
const regionFilter = document.getElementById('regionFilter');
const politicalAnalysisList = document.getElementById('political-analysis-list');
const economicAnalysisList = document.getElementById('economic-analysis-list');
const breakingList = document.getElementById('breakingList');
const latestAnalysis = document.getElementById('latestAnalysis');
const refreshBreakingBtn = document.getElementById('refreshBreakingBtn');
let breakingOffset = 0;
let breakingHasMore = true;
let breakingLoading = false;
let breakingFallback = false;

async function loadArticles() {
  const category = categoryFilter.value;
  const region = regionFilter.value;

  const query = new URLSearchParams({
    category,
    region,
  }).toString();

  try {
    const response = await fetch(`/api/articles?${query}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to load articles');
    }

    renderArticles(data.articles || []);
    loadLatestAnalysis();
    if (politicalAnalysisList && economicAnalysisList) {
      loadAnalysisSections();
    }
  } catch (error) {
    newsGrid.innerHTML = '<p class="empty-state">تعذر تحميل الأخبار.</p>';
  }
}

async function loadLatestAnalysis() {
  try {
    const response = await fetch('/api/articles?type=تحليل');
    const data = await response.json();
    const analysis = (data.articles || [])[0];

    if (!analysis) {
      latestAnalysis.innerHTML = '<p class="analysis-empty">لا توجد تحليلات منشورة حالياً.</p>';
      return;
    }

    latestAnalysis.innerHTML = `
      <span class="news-tag">${escapeHtml(analysis.category || 'تحليل')}</span>
      <h3>${escapeHtml(analysis.title)}</h3>
      <p>${escapeHtml(analysis.summary)}</p>
      <div class="latest-analysis-meta">
        <span>${escapeHtml(analysis.author || 'إدارة التحرير')}</span>
        <span>${new Date(analysis.date || analysis.published_at).toLocaleDateString('ar-EG')}</span>
      </div>
      <a class="read-more" href="article-detail.html?id=${analysis.id}">قراءة التحليل</a>
    `;
  } catch (error) {
    latestAnalysis.innerHTML = '<p class="analysis-empty">تعذر تحميل أحدث تحليل.</p>';
  }
}

async function loadBreakingNews() {
  if (refreshBreakingBtn) {
    refreshBreakingBtn.disabled = true;
    refreshBreakingBtn.textContent = 'جارٍ التحديث';
  }

  try {
    const breakingResponse = await fetch('/api/breaking-headlines?limit=8&offset=0');
    const breakingData = await breakingResponse.json();
    let headlines = breakingData.headlines || [];
    let articles = headlines.map((headline) => ({
      id: null,
      title: headline.title,
      published_at: headline.updated_at || headline.created_at,
    }));
    let fallback = false;

    if (!articles.length) {
      const latestResponse = await fetch('/api/articles');
      const latestData = await latestResponse.json();
      articles = (latestData.articles || []).slice(0, 12);
      fallback = true;
    }

    breakingOffset = headlines.length;
    breakingHasMore = !fallback && Boolean(breakingData.hasMore);
    breakingFallback = fallback;
    renderBreakingNews(articles, fallback, false);
  } catch (error) {
    breakingList.innerHTML = '<p class="breaking-empty">تعذر تحميل العواجل.</p>';
  } finally {
    if (refreshBreakingBtn) {
      refreshBreakingBtn.disabled = false;
      refreshBreakingBtn.textContent = 'تحديث';
    }
  }
}

refreshBreakingBtn.addEventListener('click', () => {
  breakingOffset = 0;
  breakingHasMore = true;
  breakingFallback = false;
  breakingList.scrollTop = 0;
  loadBreakingNews();
});

function renderBreakingNews(articles, fallback, append) {
  if (!articles.length) {
    if (!append) breakingList.innerHTML = '<p class="breaking-empty">لا توجد عواجل منشورة حاليًا.</p>';
    return;
  }

  const markup = articles.map((article) => {
      const publishedAt = new Date(article.published_at || `${article.date}T00:00:00`);
      const tagName = article.id ? 'a' : 'div';
      const target = article.id ? ` href="article-detail.html?id=${article.id}"` : '';
      return `
        <${tagName} class="breaking-item"${target}>
          <span class="breaking-item-marker"></span>
          <span class="breaking-item-content">
            <strong>${escapeHtml(article.title)}</strong>
            <span class="breaking-item-meta">
              ${publishedAt.toLocaleDateString('ar-EG')} - ${publishedAt.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </span>
        </${tagName}>
      `;
    }).join('');

  if (append) {
    breakingList.insertAdjacentHTML('beforeend', markup);
  } else {
    breakingList.innerHTML = `${fallback ? '<p class="breaking-note">أحدث الأخبار من غرفة التحرير</p>' : ''}${markup}`;
  }
}

async function loadOlderBreakingNews() {
  if (breakingLoading || !breakingHasMore || breakingFallback) return;
  breakingLoading = true;
  breakingList.insertAdjacentHTML('beforeend', '<p id="breakingLoading" class="breaking-note">جارٍ تحميل العواجل الأقدم...</p>');

  try {
    const response = await fetch(`/api/breaking-headlines?limit=8&offset=${breakingOffset}`);
    const data = await response.json();
    document.getElementById('breakingLoading')?.remove();
    if (!response.ok || !data.success) throw new Error('تعذر تحميل العواجل الأقدم');

    breakingOffset += data.headlines.length;
    breakingHasMore = Boolean(data.hasMore);
    renderBreakingNews(data.headlines, false, true);
  } catch (error) {
    document.getElementById('breakingLoading')?.remove();
    breakingList.insertAdjacentHTML('beforeend', '<p class="breaking-note">تعذر تحميل المزيد.</p>');
  } finally {
    breakingLoading = false;
  }
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

async function loadAnalysisSections() {
  const response = await fetch('/api/articles?type=تحليل');
  const data = await response.json();
  const analyses = data.articles || [];
  renderAnalysisList(politicalAnalysisList, analyses.filter((article) => article.category === 'سياسة'));
  renderAnalysisList(economicAnalysisList, analyses.filter((article) => article.category === 'اقتصاد'));
}

function renderAnalysisList(container, articles) {
  container.innerHTML = articles.slice(0, 3).map((article) => `
    <article class="news-card">
      <div class="news-card-body">
        <div class="meta-row"><span class="news-tag">تحليل</span><span>${escapeHtml(article.date)}</span></div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.summary)}</p>
        <a class="read-more" href="article-detail.html?id=${article.id}">قراءة التحليل</a>
      </div>
    </article>
  `).join('') || '<p class="empty-state">لا توجد تحليلات منشورة حالياً.</p>';
}

function renderArticles(articles) {
  if (!articles.length) {
    newsGrid.innerHTML = '<p class="empty-state">لا توجد أخبار متاحة في هذا الفلتر.</p>';
    return;
  }

  newsGrid.innerHTML = articles.map((article) => `
    <article class="news-card">
      <img src="${escapeHtml(article.image_url || 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&w=1200&q=80')}" alt="${escapeHtml(article.title)}" />
      <div class="news-card-body">
        <div class="meta-row">
          <span class="news-tag">${escapeHtml(article.category)}</span>
          <span>${escapeHtml(article.region)}</span>
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.summary)}</p>
        <div class="news-footer">
          <span>${escapeHtml(article.author || 'إدارة التحرير')}</span>
          <span>${escapeHtml(new Date(article.date || article.published_at).toLocaleDateString('ar-EG'))}</span>
        </div>
        <a class="read-more" href="article-detail.html?id=${article.id}">اقرأ المزيد</a>
      </div>
    </article>
  `).join('');
}

categoryFilter.addEventListener('change', loadArticles);
regionFilter.addEventListener('change', loadArticles);

loadArticles();
loadBreakingNews();
breakingList.addEventListener('scroll', () => {
  const nearBottom = breakingList.scrollTop + breakingList.clientHeight >= breakingList.scrollHeight - 60;
  if (nearBottom) loadOlderBreakingNews();
});
