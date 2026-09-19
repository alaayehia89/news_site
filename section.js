const sectionArticles = document.getElementById('sectionArticles');
const sectionBadge = document.getElementById('sectionBadge');
const sectionTitle = document.getElementById('sectionTitle');
const sectionDescription = document.getElementById('sectionDescription');

const sectionDefinitions = {
  breaking: {
    title: 'العواجل',
    badge: 'خبر عاجل',
    description: 'آخر الأخبار العاجلة التي تم تعليمها كعاجل من غرفة التحرير.',
    query: { status: 'Breaking' },
  },
  politics: {
    title: 'الأخبار السياسية',
    badge: 'سياسة',
    description: 'أخبار السياسة المحلية والإقليمية والدولية.',
    query: { category: 'سياسة' },
  },
  economy: {
    title: 'الأخبار الاقتصادية',
    badge: 'اقتصاد',
    description: 'متابعة الأسواق والطاقة والاستثمار والقرارات الاقتصادية.',
    query: { category: 'اقتصاد' },
  },
  sports: {
    title: 'الأخبار الرياضية',
    badge: 'رياضة',
    description: 'تغطية البطولات والنتائج والفعاليات الرياضية.',
    query: { category: 'رياضة' },
  },
  technology: {
    title: 'أخبار التقنية',
    badge: 'تقنية',
    description: 'أحدث أخبار التكنولوجيا والذكاء الاصطناعي والأمن الرقمي.',
    query: { category: 'تقنية' },
  },
  culture: {
    title: 'الأخبار الثقافية',
    badge: 'ثقافة',
    description: 'كتب وفنون وفعاليات ومشهد ثقافي متجدد.',
    query: { category: 'ثقافة' },
  },
  opinion: {
    title: 'مقالات الرأي',
    badge: 'الرأي',
    description: 'وجهات نظر وقراءات يقدمها كتاب وصحفيون متخصصون.',
    query: { type: 'مقال' },
  },
  analysis: {
    title: 'التحليلات',
    badge: 'تحليل',
    description: 'تحليلات سياسية واقتصادية وتقارير معمقة للأحداث.',
    query: { type: 'تحليل' },
  },
  'political-analysis': {
    title: 'التحليلات السياسية',
    badge: 'تحليل سياسي',
    description: 'قراءات معمقة في القرارات والتحولات السياسية الإقليمية والدولية.',
    query: { type: 'تحليل', category: 'سياسة' },
  },
  'economic-analysis': {
    title: 'التحليلات الاقتصادية',
    badge: 'تحليل اقتصادي',
    description: 'تحليلات للأسواق والطاقة والاستثمار والسياسات الاقتصادية.',
    query: { type: 'تحليل', category: 'اقتصاد' },
  },
};

const sectionKey = new URLSearchParams(window.location.search).get('section') || 'politics';
const definition = sectionDefinitions[sectionKey] || sectionDefinitions.politics;

async function applySectionSettings() {
  const response = await fetch('/api/site-settings');
  const data = await response.json();
  const label = data.settings?.sectionLabels?.[sectionKey];
  const title = label || definition.title;
  sectionBadge.textContent = label || definition.badge;
  sectionTitle.textContent = title;
  sectionDescription.textContent = definition.description;
  document.title = `${title} | أخبار اليوم`;
}

async function loadSectionArticles() {
  const query = new URLSearchParams(definition.query);

  try {
    const response = await fetch(`/api/articles?${query.toString()}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'تعذر تحميل القسم');
    }

    renderArticles(data.articles || []);
  } catch (error) {
    sectionArticles.innerHTML = '<p class="empty-state">تعذر تحميل أخبار هذا القسم.</p>';
  }
}

function renderArticles(articles) {
  if (!articles.length) {
    sectionArticles.innerHTML = '<p class="empty-state">لا توجد مواد منشورة في هذا القسم حالياً.</p>';
    return;
  }

  sectionArticles.innerHTML = articles.map((article) => `
    <article class="news-card">
      <img src="${escapeHtml(article.image_url || 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&w=1200&q=80')}" alt="${escapeHtml(article.title)}" />
      <div class="news-card-body">
        <div class="meta-row">
          <span class="news-tag">${escapeHtml(article.type || article.category)}</span>
          <span>${escapeHtml(article.region)}</span>
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.summary)}</p>
        <div class="news-footer">
          <span>${escapeHtml(article.author || 'إدارة التحرير')}</span>
          <span>${escapeHtml(new Date(article.date || article.published_at).toLocaleDateString('ar-EG'))}</span>
        </div>
        <a class="read-more" href="article-detail.html?id=${article.id}">اقرأ التفاصيل</a>
      </div>
    </article>
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

applySectionSettings().catch(() => {
  sectionBadge.textContent = definition.badge;
  sectionTitle.textContent = definition.title;
  sectionDescription.textContent = definition.description;
});
loadSectionArticles();
