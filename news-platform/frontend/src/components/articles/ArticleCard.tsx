export default function ArticleCard({ article, variant = 'normal' }: any) {
  const isLarge = variant === 'large';

  return (
    <article className="card card-hover group">
      <a href={`/article/${article.slug}`} className="block">
        {/* الصورة */}
        {article.featuredImage && (
          <div className={`relative overflow-hidden ${isLarge ? 'h-64' : 'h-48'}`}>
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* نوع المقال */}
            <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              {getTypeLabel(article.type)}
            </span>
          </div>
        )}

        {/* المحتوى النصي */}
        <div className="p-4">
          <h3 className={`font-amiri font-bold mb-2 group-hover:text-blue-600 transition-colors ${
            isLarge ? 'text-2xl' : 'text-lg'
          }`}>
            {article.title}
          </h3>

          {article.summary && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
              {article.summary}
            </p>
          )}

          {/* معلومات إضافية */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{article.author?.name || 'كاتب المقال'}</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </a>
    </article>
  );
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    NEWS: 'خبر',
    BREAKING: 'عاجل',
    ANALYSIS: 'تحليل',
    STUDY: 'دراسة',
    REPORT: 'تقرير',
    OPINION: 'رأي',
    ECONOMIC: 'اقتصاد',
  };
  return labels[type] || type;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}
