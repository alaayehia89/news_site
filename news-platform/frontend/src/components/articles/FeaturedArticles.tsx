'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ArticleCard from './ArticleCard';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featuredImage: string;
  publishedAt: string;
  author: { name: string };
  type: string;
}

export default function FeaturedArticles() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/articles', {
        params: { featured: true, limit: 3 }
      });
      return response.data.data || [];
    },
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="section-title">المقالات المميزة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles[0] && (
          <div className="md:col-span-2">
            <ArticleCard article={articles[0]} variant="large" />
          </div>
        )}
        
        {articles.slice(1, 3).map((article: Article) => (
          <ArticleCard key={article.id} article={article} variant="normal" />
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <section>
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </section>
  );
}
