# 🚀 منصة الأخبار الاحترافية
# Professional News Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://docker.com)

منصة إخبارية احترافية متكاملة مع دعم الذكاء الاصطناعي، شريط عاجل، تحليلات سياسية واقتصادية، ولوحة تحكم شاملة.

---

## 📋 المحتويات

- [المميزات](#-المميزات)
- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [البدء السريع](#-البدء-السريع)
- [التوثيق الكامل](#-التوثيق-الكامل)
- [هيكلية المشروع](#-هيكلية-المشروع)
- [الخدمات الإضافية](#-الخدمات-الإضافية)

---

## ✨ المميزات

### 📰 إدارة المحتوى الإخباري
- ✅ شريط جانبي للأخبار العاجلة
- ✅ أقسام متخصصة: سياسة، اقتصاد، تقنية، رياضة، ثقافة، صحة
- ✅ تحليلات سياسية واستراتيجية
- ✅ دراسات وتقارير معمقة
- ✅ مقالات رأي وخبراء
- ✅ تحليلات اقتصادية ومالية

### 🎯 لوحة التحكم الاحترافية
- ✅ إدخال الأخبار عبر نماذج نصية سهلة
- ✅ رفع ملفات JSON لاستيراد أخبار متعددة
- ✅ إدارة التصنيفات والكلمات المفتاحية
- ✅ نظام مستخدمين وصلاحيات متقدم
- ✅ إدارة الجلسات وتسجيل الدخول
- ✅ إحصائيات وتحليلات مفصلة

### 🔍 محرك بحث متطور
- ✅ بحث نصي كامل في العناوين والمحتوى
- ✅ فلترة حسب التصنيف والتاريخ
- ✅ بحث بالكلمات المفتاحية
- ✅ نتائج فورية وذكية

### 🤖 جاهز للذكاء الاصطناعي
- ✅ تكامل مع OpenAI GPT-4
- ✅ تلخيص تلقائي للأخبار
- ✅ استخراج الكلمات المفتاحية
- ✅ تحليل المشاعر
- ✅ ترجمة المحتوى
- ✅ توليد محتوى مساعد

### 🗄️ قواعد البيانات
- ✅ MongoDB للمستخدمين والأخبار
- ✅ Redis للتخزين المؤقت والجلسات
- ✅ فهرسة متقدمة للكلمات المفتاحية
- ✅ تصنيف موضوعي للمحتوى

---

## 🛠️ التقنيات المستخدمة

| المجال | التقنية |
|--------|---------|
| **Frontend** | React.js 18, Redux Toolkit, React Router |
| **Backend** | Python 3.11, Flask, FastAPI |
| **Database** | MongoDB 7, Redis 7 |
| **Authentication** | JWT, bcrypt |
| **AI Integration** | OpenAI API, LangChain (ready) |
| **Containerization** | Docker, Docker Compose |
| **Web Server** | Nginx |
| **Search** | MongoDB Text Search (Elasticsearch ready) |

---

## 🚀 البدء السريع

### الطريقة الأسهل - Docker (5 دقائق)

```bash
# 1. انتقل إلى مجلد المشروع
cd /workspace/news_platform

# 2. انسخ ملف البيئة
cp .env.example .env

# 3. (اختياري) أضف مفتاح OpenAI في ملف .env
nano .env

# 4. شغّل المنصة
./start.sh

# أو مباشرة
docker-compose up --build -d
```

### الوصول إلى المنصة

| الخدمة | الرابط |
|--------|--------|
| 🌐 الواجهة الرئيسية | http://localhost:3000 |
| ⚙️ لوحة التحكم | http://localhost:3000/admin |
| 🔌 API | http://localhost:5000/api |

### إنشاء حساب المدير

```bash
cd backend
python create_admin.py
```

---

## 📚 التوثيق الكامل

| الملف | الوصف |
|-------|-------|
| [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) | دليل التثبيت والتشغيل المفصل |
| [`QUICKSTART.md`](./QUICKSTART.md) | دليل البدء السريع |
| [`README.md`](./README.md) | نظرة عامة على المشروع |

---

## 📁 هيكلية المشروع

```
news_platform/
├── backend/              # الخادم الخلفي (Python/Flask)
│   ├── app.py           # نقطة الدخول الرئيسية
│   ├── create_admin.py  # سكريبت إنشاء المدير
│   ├── api/             # مسارات API
│   ├── models/          # نماذج البيانات
│   ├── services/        # الخدمات
│   ├── utils/           # أدوات مساعدة
│   └── config/          # الإعدادات
│
├── frontend/            # الواجهة الأمامية (React)
│   ├── src/
│   │   ├── components/  # المكونات
│   │   ├── pages/       # الصفحات
│   │   ├── services/    # خدمات API
│   │   ├── hooks/       # خطافات React
│   │   └── assets/      # الأصول
│   └── public/          # الملفات العامة
│
├── data/                # البيانات والعينات
│   └── sample_data.json # بيانات تجريبية
│
├── uploads/             # الملفات المرفوعة
│
├── docker-compose.yml   # إعدادات Docker
├── start.sh            # سكريبت التشغيل
├── stop.sh             # سكريبت الإيقاف
└── .env.example        # مثال على متغيرات البيئة
```

---

## 📤 رفع الأخبار

### عبر لوحة التحكم
1. سجّل الدخول كمدير
2. اذهب إلى "إدارة الأخبار"
3. اختر "إضافة خبر" أو "رفع JSON"

### مثال على ملف JSON

```json
[
  {
    "title": "عنوان الخبر",
    "summary": "ملخص قصير",
    "content": "محتوى الخبر الكامل...",
    "category": "سياسة",
    "tags": ["كلمة1", "كلمة2"],
    "author": "اسم الكاتب",
    "isBreaking": false,
    "publishDate": "2024-01-15T10:00:00Z"
  }
]
```

### استخدام البيانات التجريبية

```bash
# ملف تجريبي جاهز في:
data/sample_data.json
```

---

## 🤖 تفعيل الذكاء الاصطناعي

### 1. احصل على مفتاح API
من [OpenAI Platform](https://platform.openai.com/api-keys)

### 2. أضفه إلى ملف `.env`
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
AI_MODEL=gpt-4
```

### 3. أعد تشغيل المنصة
```bash
docker-compose restart backend
```

### 4. استخدم الميزات من لوحة التحكم
- تلخيص الأخبار
- استخراج الكلمات المفتاحية
- تحليل المشاعر
- ترجمة المحتوى

---

## 🔧 الإدارة والصيانة

### إيقاف المنصة
```bash
./stop.sh
# أو
docker-compose down
```

### عرض السجلات
```bash
docker-compose logs -f
```

### إعادة التشغيل
```bash
docker-compose restart
```

### النسخ الاحتياطي
```bash
docker exec news_mongodb mongodump \
  -u admin -p admin123 \
  --out /backup/mongodb
```

---

## 🎯 الخدمات الإضافية المقترحة

يمكنك إضافة هذه الخدمات مستقبلاً:

1. **Elasticsearch** - بحث متقدم
2. **MinIO** - تخزين ملفات
3. **Prometheus + Grafana** - مراقبة وأداء
4. **Nginx Proxy** -反向代理 للإنتاج
5. **SSL/TLS** - شهادة أمان
6. **CDN** - تسريع المحتوى
7. **WebSocket** - تحديثات فورية
8. **Push Notifications** - إشعارات
9. **Mobile App** - تطبيق جوال
10. **Live Streaming** - بث مباشر

---

## 🛡️ الأمان

### تغيير المفاتيح الافتراضية

في ملف `.env`:
```env
JWT_SECRET=your_very_secure_random_key_here
MONGO_INITDB_ROOT_PASSWORD=strong_password_here
```

### أفضل الممارسات
- ✅ غيّر كلمات المرور الافتراضية
- ✅ استخدم HTTPS في الإنتاج
- ✅ فعّل جدار الحماية
- ✅ حدّث الحزم بانتظام
- ✅ انشئ نسخ احتياطية دورية

---

## 📊 قواعد البيانات

### MongoDB
- **المنفذ:** 27017
- **المستخدم:** admin
- **كلمة المرور:** admin123 (غيّرها!)
- **قاعدة البيانات:** news_platform

### Redis
- **المنفذ:** 6379
- **نوع:** Cache & Sessions

---

## 🎨 التصميم والواجهة

- تصميم عصري ومتجاوب
- دعم كامل للغة العربية (RTL)
- شريط عاجل متحرك
- لوحة تحكم داكنة/فاتحة
- رسوم بيانية وإحصائيات
- محرر نصوص متقدم

---

## 📞 الدعم والمساعدة

### ملفات مهمة
- `SETUP_GUIDE.md` - دليل مفصل
- `QUICKSTART.md` - بدء سريع
- `.env.example` - مثال البيئة

### السجلات
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📜 الترخيص

MIT License - راجع ملف LICENSE للتفاصيل

---

## 🌟 ملاحظات ختامية

- ✅ **جاهزة للاستخدام الفوري**
- ✅ **قابلة للتوسع بسهولة**
- ✅ **دعم كامل للعربية**
- ✅ **جاهزة للذكاء الاصطناعي**
- ✅ **تصميم احترافي**

---

<div align="center">

**صُنعت ❤️ بواسطة News Platform Team**

[⭐ Star on GitHub](https://github.com) • [📄 Docs](./SETUP_GUIDE.md) • [🐛 Report Bug](https://github.com/issues)

</div>
