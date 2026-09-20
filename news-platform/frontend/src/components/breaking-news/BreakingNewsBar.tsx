'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface BreakingNews {
  id: string;
  title: string;
  slug: string;
  priority: number;
  publishedAt: string;
}

export default function BreakingNewsBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // جلب الأخبار العاجلة
  const { data: breakingNews, isLoading } = useQuery({
    queryKey: ['breaking-news'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/articles/breaking');
      return response.data.data || [];
    },
    refetchInterval: 30000,
  });

  // التبديل التلقائي بين الأخبار
  useEffect(() => {
    if (!breakingNews || breakingNews.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [breakingNews, isPaused]);

  if (isLoading || !breakingNews || breakingNews.length === 0) {
    return null;
  }

  return (
    <div 
      className="breaking-news-bar flex items-center gap-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <span className="font-bold whitespace-nowrap animate-pulse">
        🔴 عاجل
      </span>
      
      <div className="flex-1 overflow-hidden relative h-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute w-full"
          >
            <a
              href={`/article/${breakingNews[currentIndex]?.slug}`}
              className="block truncate hover:underline"
            >
              {breakingNews[currentIndex]?.title}
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* مؤشرات التنقل */}
      <div className="flex gap-2">
        {breakingNews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-red-300'
            }`}
            aria-label={`انتقل للخبر ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
