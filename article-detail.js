const params = new URLSearchParams(window.location.search);
const articleId = Number(params.get('id'));

async function loadArticle() {
  if (!articleId) {
    document.getElementById('detailTitle').textContent = 'المقال غير موجود';
    return;
  }

  const response = await fetch(`/api/articles/${articleId}`);
  const data = await response.json();

  const article = data.article;

  if (!article) {
    document.getElementById('detailTitle').textContent = 'المقال غير موجود';
    return;
  }

  document.getElementById('detailImage').src = article.image_url || 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&w=1200&q=80';
  const detailMeta = document.getElementById('detailMeta');
  detailMeta.replaceChildren();
  [article.category, article.region, article.type, new Date(article.date || article.published_at).toLocaleDateString('ar-EG')]
    .forEach((value, index) => {
      const span = document.createElement('span');
      span.textContent = value || '';
      if (index === 0) span.className = 'news-tag';
      detailMeta.appendChild(span);
    });
  document.getElementById('detailTitle').textContent = article.title;
  document.getElementById('detailSummary').textContent = article.summary;
  document.getElementById('detailAuthor').textContent = `بقلم: ${article.author || 'إدارة التحرير'}`;
  document.getElementById('detailBody').textContent = article.content;
}

loadArticle();
