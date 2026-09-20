'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ArticleCard from './ArticleCard';

export default function AnalysisSection() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['analysis-articles'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/articles', {
        params: { type: 'ANALYSIS', limit: 4 }
      });
      return response.data.data || [];
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!articles || articles.length === 0) return null;

  return (
    <section>
      <h2 className="section-title">تحليلات سياسية واستراتيجية</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article: any) => (
          <ArticleCard key={article.id} article={article} variant="normal" />
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <section>
      <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </section>
  );
}
