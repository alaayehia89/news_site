export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* عن المنصة */}
          <div>
            <h3 className="text-white font-amiri text-xl mb-4">منصة الأخبار والتحليلات</h3>
            <p className="text-sm leading-relaxed">
              منصة إخبارية متكاملة تقدم أخباراً عاجلة، تحليلات سياسية واستراتيجية، 
              دراسات، تقارير، ومقالات رأي من نخبة الكتاب والمحللين.
            </p>
          </div>

          {/* الأقسام */}
          <div>
            <h4 className="text-white font-bold mb-4">الأقسام</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/category/politics" className="hover:text-white transition-colors">سياسة</a></li>
              <li><a href="/category/economy" className="hover:text-white transition-colors">اقتصاد</a></li>
              <li><a href="/category/analysis" className="hover:text-white transition-colors">تحليلات</a></li>
              <li><a href="/category/studies" className="hover:text-white transition-colors">دراسات</a></li>
              <li><a href="/category/opinion" className="hover:text-white transition-colors">رأي</a></li>
            </ul>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white transition-colors">من نحن</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">اتصل بنا</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">الخصوصية</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">الشروط</a></li>
              <li><a href="/rss" className="hover:text-white transition-colors">RSS</a></li>
            </ul>
          </div>

          {/* النشرة البريدية */}
          <div>
            <h4 className="text-white font-bold mb-4">النشرة البريدية</h4>
            <p className="text-sm mb-4">اشترك لتصلك آخر الأخبار والتحليلات</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"
              />
              <button className="btn-primary text-sm whitespace-nowrap">
                اشتراك
              </button>
            </form>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} منصة الأخبار والتحليلات الاستراتيجية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
