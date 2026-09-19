const searchForm = document.getElementById('searchForm');
const searchQuery = document.getElementById('searchQuery');
const searchCategory = document.getElementById('searchCategory');
const searchType = document.getElementById('searchType');
const searchRegion = document.getElementById('searchRegion');
const searchFromDate = document.getElementById('searchFromDate');
const searchToDate = document.getElementById('searchToDate');
const searchSort = document.getElementById('searchSort');
const searchSummary = document.getElementById('searchSummary');
const searchResults = document.getElementById('searchResults');
const searchPagination = document.getElementById('searchPagination');

let currentPage = 1;

function getSearchParams() {
  return new URLSearchParams({
    q: searchQuery.value.trim(),
    category: searchCategory.value,
    type: searchType.value,
    region: searchRegion.value,
    fromDate: searchFromDate.value,
    toDate: searchToDate.value,
    sort: searchSort.value,
    page: currentPage,
    limit: 12,
  });
}

async function runSearch() {
  const params = getSearchParams();
  const hasFilters = [...params.entries()].some(([key, value]) => {
    return ['category', 'type', 'region'].includes(key) && value !== 'all'
      || ['fromDate', 'toDate'].includes(key) && value;
  });

  if (!searchQuery.value.trim() && !hasFilters) {
    searchSummary.textContent = 'أدخل عبارة أو اختر فلترًا لبدء البحث.';
    searchResults.innerHTML = '';
    searchPagination.innerHTML = '';
    return;
  }

  searchSummary.textContent = 'جارٍ البحث...';

  try {
    const response = await fetch(`/api/search?${params.toString()}`);
    const data = await response.json();

    if (!response.ok || !data.success) throw new Error(data.message || 'تعذر تنفيذ البحث');

    searchSummary.textContent = `${data.total} نتيجة${data.query ? ` لعبارة «${data.query}»` : ''}`;
    renderResults(data.articles || []);
    renderPagination(data.page, data.pages);
    window.history.replaceState({}, '', `search.html?${params.toString()}`);
  } catch (error) {
    searchSummary.textContent = error.message || 'تعذر تنفيذ البحث.';
    searchResults.innerHTML = '';
    searchPagination.innerHTML = '';
  }
}

function renderResults(articles) {
  if (!articles.length) {
    searchResults.innerHTML = '<p class="empty-state">لا توجد نتائج مطابقة. جرّب كلمات أو فلاتر أخرى.</p>';
    return;
  }

  searchResults.innerHTML = articles.map((article) => `
    <article class="news-card">
      <img src="${escapeHtml(article.image_url || 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&w=1200&q=80')}" alt="${escapeHtml(article.title)}" />
      <div class="news-card-body">
        <div class="meta-row">
          <span class="news-tag">${escapeHtml(article.type)}</span>
          <span>${escapeHtml(article.category)}</span>
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.summary)}</p>
        <div class="news-footer">
          <span>${escapeHtml(article.author || 'إدارة التحرير')}</span>
          <span>${escapeHtml(article.date)}</span>
        </div>
        <a class="read-more" href="article-detail.html?id=${article.id}">اقرأ التفاصيل</a>
      </div>
    </article>
  `).join('');
}

function renderPagination(page, pages) {
  if (pages <= 1) {
    searchPagination.innerHTML = '';
    return;
  }

  searchPagination.innerHTML = Array.from({ length: pages }, (_, index) => {
    const pageNumber = index + 1;
    return `<button class="pagination-btn${pageNumber === page ? ' active' : ''}" type="button" data-page="${pageNumber}">${pageNumber}</button>`;
  }).join('');

  searchPagination.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      currentPage = Number(button.dataset.page);
      runSearch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  currentPage = 1;
  runSearch();
});

[searchCategory, searchType, searchRegion, searchFromDate, searchToDate, searchSort].forEach((control) => {
  control.addEventListener('change', () => {
    currentPage = 1;
    runSearch();
  });
});

const initialParams = new URLSearchParams(window.location.search);
searchQuery.value = initialParams.get('q') || '';
searchCategory.value = initialParams.get('category') || 'all';
searchType.value = initialParams.get('type') || 'all';
searchRegion.value = initialParams.get('region') || 'all';
searchFromDate.value = initialParams.get('fromDate') || '';
searchToDate.value = initialParams.get('toDate') || '';
searchSort.value = initialParams.get('sort') || 'relevance';
currentPage = Number(initialParams.get('page')) || 1;

if (searchQuery.value || searchCategory.value !== 'all' || searchType.value !== 'all' || searchRegion.value !== 'all') {
  runSearch();
}
