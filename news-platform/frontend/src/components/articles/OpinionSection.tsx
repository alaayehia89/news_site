'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function OpinionSection() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['opinion-articles'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/articles', {
        params: { type: 'OPINION', limit: 3 }
      });
      return response.data.data || [];
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!articles || articles.length === 0) return null;

  return (
    <section>
      <h2 className="section-title">مقالات الرأي</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article: any) => (
          <article key={article.id} className="card p-6 card-hover">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                <img src={article.author?.avatar || '/images/default-avatar.png'} alt={article.author?.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold">{article.author?.name}</h3>
                <p className="text-xs text-gray-500">{article.author?.title || 'كاتب ومحلل'}</p>
              </div>
            </div>
            <a href={`/article/${article.slug}`}>
              <h4 className="font-amiri font-bold text-lg mb-2 hover:text-blue-600 transition-colors">
                {article.title}
              </h4>
            </a>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{article.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <section>
      <div className="h-8 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </section>
  );
}
