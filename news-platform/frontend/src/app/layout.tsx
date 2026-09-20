import type { Metadata } from 'next';
import { Inter, Amiri } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BreakingNewsBar from '@/components/breaking-news/BreakingNewsBar';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

const amiri = Amiri({ 
  weight: ['400', '700'],
  subsets: ['arabic'],
  variable: '--font-amiri'
});

export const metadata: Metadata = {
  title: 'منصة الأخبار والتحليلات الاستراتيجية',
  description: 'موقع إخباري متكامل يقدم أخباراً عاجلة، تحليلات سياسية واستراتيجية، دراسات، تقارير، ومقالات رأي',
  keywords: ['أخبار', 'تحليلات', 'سياسة', 'اقتصاد', 'دراسات', 'تقارير'],
  authors: [{ name: 'فريق التحرير' }],
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    siteName: 'منصة الأخبار والتحليلات',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${amiri.variable}`}>
      <body className="font-sans bg-gray-50 dark:bg-gray-900">
        <Providers>
          <div className="min-h-screen flex flex-col">
            {/* شريط الأخبار العاجلة */}
            <BreakingNewsBar />
            
            {/* رأس الصفحة */}
            <Header />
            
            {/* المحتوى الرئيسي */}
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            
            {/* تذييل الصفحة */}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
