export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* الشعار */}
          <div className="flex items-center gap-4">
            <a href="/" className="text-2xl font-amiri font-bold text-blue-600">
              منصة الأخبار
            </a>
          </div>

          {/* القائمة الرئيسية */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="hover:text-blue-600 transition-colors">الرئيسية</a>
            <a href="/category/politics" className="hover:text-blue-600 transition-colors">سياسة</a>
            <a href="/category/economy" className="hover:text-blue-600 transition-colors">اقتصاد</a>
            <a href="/category/analysis" className="hover:text-blue-600 transition-colors">تحليلات</a>
            <a href="/category/studies" className="hover:text-blue-600 transition-colors">دراسات</a>
            <a href="/category/opinion" className="hover:text-blue-600 transition-colors">رأي</a>
          </nav>

          {/* أدوات إضافية */}
          <div className="flex items-center gap-4">
            {/* بحث */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* تسجيل الدخول */}
            <a href="/login" className="btn-primary text-sm">
              دخول
            </a>
          </div>
        </div>

        {/* قائمة الجوال */}
        <div className="md:hidden border-t py-3">
          <nav className="flex flex-wrap gap-4 text-sm">
            <a href="/" className="hover:text-blue-600">الرئيسية</a>
            <a href="/category/politics" className="hover:text-blue-600">سياسة</a>
            <a href="/category/economy" className="hover:text-blue-600">اقتصاد</a>
            <a href="/category/analysis" className="hover:text-blue-600">تحليلات</a>
            <a href="/category/studies" className="hover:text-blue-600">دراسات</a>
            <a href="/category/opinion" className="hover:text-blue-600">رأي</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
