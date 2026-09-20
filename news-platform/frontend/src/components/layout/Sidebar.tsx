export default function Sidebar() {
  return (
    <aside className="space-y-6">
      {/* الأكثر قراءة */}
      <div className="card p-4">
        <h3 className="section-title text-lg mb-4">الأكثر قراءة</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <a key={item} href="#" className="flex gap-3 group">
              <span className="text-2xl font-bold text-gray-300 group-hover:text-blue-600">
                {String(item).padStart(2, '0')}
              </span>
              <p className="text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                عنوان المقال أو الخبر الذي سيتم عرضه هنا بشكل مختصر
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* التصنيفات */}
      <div className="card p-4">
        <h3 className="section-title text-lg mb-4">التصنيفات</h3>
        <div className="flex flex-wrap gap-2">
          {['سياسة', 'اقتصاد', 'تحليلات', 'دراسات', 'تقارير', 'رأي', 'عاجل'].map((cat) => (
            <a
              key={cat}
              href={`/category/${encodeURIComponent(cat)}`}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* الكلمات المفتاحية */}
      <div className="card p-4">
        <h3 className="section-title text-lg mb-4">كلمات مفتاحية</h3>
        <div className="flex flex-wrap gap-2">
          {['الشرق الأوسط', 'الاقتصاد العالمي', 'الطاقة', 'التكنولوجيا', 'الأمن القومي'].map((tag) => (
            <a
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
            >
              #{tag}
            </a>
          ))}
        </div>
      </div>

      {/* النشرة البريدية - مصغر */}
      <div className="card p-4 bg-blue-600 text-white">
        <h3 className="font-bold text-lg mb-2">اشترك في نشرتنا</h3>
        <p className="text-sm mb-3 opacity-90">احصل على ملخص يومي لأهم الأخبار</p>
        <input
          type="email"
          placeholder="بريدك الإلكتروني"
          className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-white/70 focus:outline-none focus:bg-white/30 text-sm mb-2"
        />
        <button className="w-full btn-primary bg-white text-blue-600 hover:bg-gray-100 text-sm">
          اشتراك
        </button>
      </div>
    </aside>
  );
}
