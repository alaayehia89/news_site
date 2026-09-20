'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function EconomicAnalysis() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['economic-articles'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/articles', {
        params: { type: 'ECONOMIC', limit: 4 }
      });
      return response.data.data || [];
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!articles || articles.length === 0) return null;

  return (
    <section>
      <h2 className="section-title">تحليلات اقتصادية</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article: any) => (
          <article key={article.id} className="card card-hover p-4 flex gap-4">
            {article.featuredImage && (
              <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <a href={`/article/${article.slug}`}>
                <h3 className="font-amiri font-bold text-lg mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{article.summary}</p>
              <div className="mt-2 text-xs text-gray-500">{formatDate(article.publishedAt)}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <section>
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </section>
  );
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
}
