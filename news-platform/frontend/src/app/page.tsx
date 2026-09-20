import { Suspense } from 'react';
import FeaturedArticles from '@/components/articles/FeaturedArticles';
import LatestNews from '@/components/articles/LatestNews';
import AnalysisSection from '@/components/articles/AnalysisSection';
import OpinionSection from '@/components/articles/OpinionSection';
import EconomicAnalysis from '@/components/articles/EconomicAnalysis';
import Sidebar from '@/components/layout/Sidebar';

export default function HomePage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* المحتوى الرئيسي */}
      <div className="lg:col-span-8 space-y-12">
        {/* المقالات المميزة */}
        <Suspense fallback={<LoadingSkeleton />}>
          <FeaturedArticles />
        </Suspense>

        {/* آخر الأخبار */}
        <Suspense fallback={<LoadingSkeleton />}>
          <LatestNews />
        </Suspense>

        {/* التحليلات السياسية والاستراتيجية */}
        <Suspense fallback={<LoadingSkeleton />}>
          <AnalysisSection />
        </Suspense>

        {/* التحليلات الاقتصادية */}
        <Suspense fallback={<LoadingSkeleton />}>
          <EconomicAnalysis />
        </Suspense>

        {/* مقالات الرأي */}
        <Suspense fallback={<LoadingSkeleton />}>
          <OpinionSection />
        </Suspense>
      </div>

      {/* الشريط الجانبي */}
      <aside className="lg:col-span-4 space-y-6">
        <Sidebar />
      </aside>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}
