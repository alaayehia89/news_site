# ============================================
# 🚀 منصة الأخبار الإخبارية - دليل التشغيل الكامل
# News Platform - Complete Setup Guide
# ============================================

## 📋 محتويات الدليل

1. [نظرة عامة](#نظرة-عامة)
2. [المتطلبات الأساسية](#المتطلبات-الأساسية)
3. [طرق التثبيت والتشغيل](#طرق-التثبيت-والتشغيل)
4. [لوحة التحكم والإدارة](#لوحة-التحكم-والإدارة)
5. [رفع وإدارة المحتوى](#رفع-وإدارة-المحتوى)
6. [دمج الذكاء الاصطناعي](#دمج-الذكاء-الاصطناعي)
7. [استكشاف الأخطاء](#استكشاف-الأخطاء)
8. [الخدمات الإضافية المقترحة](#الخدمات-الإضافية-المقترحة)

---

## نظرة عامة

منصة إخبارية احترافية متكاملة تتضمن:

### المميزات الرئيسية:
- ✅ واجهة أمامية حديثة (React.js)
- ✅ خادم خلفي قوي (Python/Flask)
- ✅ قاعدة بيانات MongoDB مرنة
- ✅ نظام تخزين مؤقت Redis
- ✅ شريط عاجل للأخبار العاجلة
- ✅ تحليلات سياسية واستراتيجية
- ✅ دراسات وتقارير متخصصة
- ✅ مقالات رأي وتحليلات اقتصادية
- ✅ لوحة تحكم احترافية
- ✅ دعم رفع الأخبار عبر JSON
- ✅ نظام مستخدمين وصلاحيات
- ✅ محرك بحث متطور
- ✅ جاهز لدمج نماذج الذكاء الاصطناعي

---

## المتطلبات الأساسية

### الطريقة 1: Docker (موصى به - الأسهل)

**الحد الأدنى:**
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM على الأقل
- 10GB مساحة تخزين

**التحقق من التثبيت:**
```bash
docker --version
docker-compose --version
```

### الطريقة 2: التثبيت اليدوي

**للـ Backend:**
- Python 3.11+
- pip
- MongoDB 7+
- Redis 7+

**للـ Frontend:**
- Node.js 18+
- npm أو yarn

---

## طرق التثبيت والتشغيل

### ⭐ الطريقة 1: Docker (الأسهل - 5 دقائق)

#### الخطوة 1: انتقل إلى مجلد المشروع
```bash
cd /workspace/news_platform
```

#### الخطوة 2: أنشئ ملف البيئة
```bash
cp .env.example .env
```

#### الخطوة 3: عدل ملف .env (اختياري)
```bash
nano .env
```
أضف مفتاح OpenAI API إذا أردت استخدام الذكاء الاصطناعي:
```
OPENAI_API_KEY=sk-your-key-here
```

#### الخطوة 4: شغّل المنصة
```bash
# باستخدام السكريبت التفاعلي
./start.sh

# أو مباشرة
docker-compose up --build -d
```

#### الخطوة 5: انتظر بدء الخدمات
```bash
docker-compose ps
```

يجب أن ترى جميع الخدمات في حالة "Up"

#### الخطوة 6: افتح المتصفح
- 🌐 الواجهة الرئيسية: http://localhost:3000
- ⚙️ لوحة التحكم: http://localhost:3000/admin
- 🔌 API: http://localhost:5000/api

---

### 🔧 الطريقة 2: التثبيت اليدوي (للمطورين)

#### أولاً: تشغيل قواعد البيانات

**MongoDB:**
```bash
# على Linux
sudo systemctl start mongod

# على Mac
brew services start mongodb-community

# أو يدوياً
mongod --dbpath /data/db
```

**Redis:**
```bash
redis-server
```

#### ثانياً: إعداد وتشغيل Backend

```bash
cd backend

# إنشاء بيئة افتراضية
python3 -m venv venv

# تفعيل البيئة
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# إنشاء ملف .env
cp .env.example .env

# تعديل ملف .env حسب الحاجة
nano .env

# تشغيل الخادم
python app.py
```

الخادم سيعمل على: http://localhost:5000

#### ثالثاً: إعداد وتشغيل Frontend

افتح نافذة طرفية جديدة:

```bash
cd frontend

# تثبيت المتطلبات
npm install

# تشغيل التطبيق
npm start
```

التطبيق سيعمل على: http://localhost:3000

---

## 👤 إنشاء حساب المدير

بعد تشغيل المنصة، أنشئ حساب المدير الأول:

```bash
cd backend
source venv/bin/activate  # إذا لم تكن مفعلاً
python create_admin.py
```

سيطلب منك:
1. اسم المستخدم (مثلاً: admin)
2. البريد الإلكتروني
3. كلمة المرور (8 أحرف على الأقل)
4. تأكيد كلمة المرور

---

## 📊 لوحة التحكم والإدارة

### الوصول إلى لوحة التحكم
```
http://localhost:3000/admin
```

### مميزات لوحة التحكم:

#### 1. إدارة الأخبار
- ➕ إضافة خبر جديد (نموذج نصي)
- 📤 رفع ملف JSON يحتوي على أخبار متعددة
- ✏️ تعديل الأخبار الموجودة
- 🗑️ حذف الأخبار
- 📊 إحصائيات المشاهدات

#### 2. إدارة التصنيفات
- سياسة
- اقتصاد
- تقنية
- رياضة
- ثقافة وفنون
- صحة
- (قابل للإضافة)

#### 3. إدارة المستخدمين
- عرض جميع المستخدمين
- تعديل الصلاحيات
- تعطيل/تفعيل الحسابات

#### 4. الإعدادات
- إعدادات الموقع العامة
- إعدادات الذكاء الاصطناعي
- إعدادات النسخ الاحتياطي

---

## 📤 رفع وإدارة المحتوى

### الطريقة 1: عبر لوحة التحكم

1. سجل الدخول كمدير
2. اذهب إلى "إدارة الأخبار"
3. اختر:
   - **"إضافة خبر"** للإدخال اليدوي
   - **"رفع JSON"** لاستيراد ملف

### الطريقة 2: عبر API

```bash
curl -X POST http://localhost:5000/api/news/import \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@news.json"
```

### مثال على ملف JSON صالح:

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

### استخدام البيانات التجريبية:

```bash
# ملف تجريبي موجود في:
/workspace/news_platform/data/sample_data.json

# يمكن رفعه عبر لوحة التحكم
```

---

## 🤖 دمج الذكاء الاصطناعي

### الخطوة 1: الحصول على مفتاح API

1. احصل على مفتاح من OpenAI: https://platform.openai.com/api-keys
2. أو استخدم مزود آخر يدعم OpenAI API

### الخطوة 2: إضافة المفتاح إلى .env

```bash
nano .env
```

أضف:
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
AI_MODEL=gpt-4
AI_TEMPERATURE=0.7
MAX_TOKENS=1000
```

### الخطوة 3: إعادة تشغيل Backend

```bash
# Docker
docker-compose restart backend

# يدوي
python app.py
```

### الخطوة 4: استخدام ميزات الذكاء الاصطناعي

من لوحة التحكم، يمكنك:
- 📝 تلخيص الأخبار تلقائياً
- 🔍 استخراج الكلمات المفتاحية
- 💡 تحليل المشاعر
- 🌐 ترجمة المحتوى
- ✨ توليد محتوى مساعد

### أمثلة على الاستخدام:

```bash
# تحليل نص عبر API
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "النص المراد تحليله...",
    "type": "summary"
  }'
```

أنواع التحليل المتاحة:
- `summary` - تلخيص
- `sentiment` - تحليل المشاعر
- `keywords` - استخراج الكلمات المفتاحية
- `translate` - ترجمة

---

## 🔍 محرك البحث

### مميزات البحث:
- 🔎 بحث نصي كامل في العناوين والمحتوى
- 🏷️ بحث حسب الكلمات المفتاحية
- 📁 تصفية حسب التصنيف
- 📅 ترتيب حسب التاريخ
- ⚡ نتائج فورية

### استخدام البحث:

من الواجهة الرئيسية:
1. اكتب في شريط البحث
2. اضغط Enter
3. تصفية النتائج حسب التصنيف (اختياري)

### عبر API:

```bash
# بحث عام
curl "http://localhost:5000/api/search?q=كلمة_البحث"

# بحث مع تصنيف
curl "http://localhost:5000/api/search?q=كلمة_البحث&category=اقتصاد"
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: الخدمات لا تبدأ

**الحل:**
```bash
# تحقق من حالة الخدمات
docker-compose ps

# اعرض السجلات
docker-compose logs

# أعد البناء
docker-compose down
docker-compose up --build -d
```

### المشكلة: خطأ في الاتصال بقاعدة البيانات

**الحل:**
```bash
# تأكد من تشغيل MongoDB
docker-compose ps mongodb

# أعد تشغيل MongoDB
docker-compose restart mongodb

# تحقق من السجلات
docker-compose logs mongodb
```

### المشكلة: منفذ مشغول

**الحل:**
```bash
# اعرف العملية占用 المنفذ
lsof -i :3000  # للفرونت إند
lsof -i :5000  # للباك إند

# أوقف العملية
kill -9 <PID>

# أو غيّر المنفذ في .env
PORT=5001
```

### المشكلة: أخطاء في تثبيت الحزم

**للـ Backend:**
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**للـ Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### المشكلة: واجهة المستخدم لا تظهر

**الحل:**
```bash
cd frontend
npm run build
npm start
```

### المشكلة: توكن JWT منتهي

**الحل:**
- سجّل الخروج ثم سجّل الدخول مجدداً
- أو زد مدة الصلاحية في .env:
```
JWT_ACCESS_TOKEN_EXPIRES=86400
```

---

## 📊 الوصول المباشر لقواعد البيانات

### MongoDB:

```bash
# عبر Docker
docker exec -it news_mongodb mongosh \
  -u admin -p admin123 \
  news_platform

# استعلامات مفيدة:
db.news.find().limit(5)
db.users.find()
db.categories.find()
```

### Redis:

```bash
docker exec -it news_redis redis-cli

# أوامر مفيدة:
KEYS *
GET key_name
```

---

## 🛡️ الأمان

### تغيير المفاتيح الافتراضية:

في ملف `.env`:
```
JWT_SECRET=your_very_secure_random_key_here
MONGO_INITDB_ROOT_PASSWORD=strong_password_here
```

### أفضل الممارسات:
1. غيّر جميع كلمات المرور الافتراضية
2. استخدم HTTPS في الإنتاج
3. فعّل جدار الحماية
4. حدّث الحزم بانتظام
5. انشئ نسخ احتياطية دورية

---

## 📦 النسخ الاحتياطي

### نسخة من MongoDB:

```bash
# تصدير
docker exec news_mongodb mongodump \
  -u admin -p admin123 \
  --out /backup/mongodb

# استيراد
docker exec news_mongodb mongorestore \
  -u admin -p admin123 \
  /backup/mongodb
```

---

## 🚀 الخدمات الإضافية المقترحة

يمكنك إضافة هذه الخدمات مستقبلاً:

### 1. Elasticsearch للبحث المتقدم
```yaml
# في docker-compose.yml
elasticsearch:
  image: elasticsearch:8.11.0
  ports:
    - "9200:9200"
```

### 2. MinIO لتخزين الملفات
```yaml
minio:
  image: minio/minio
  ports:
    - "9000:9000"
```

### 3. Prometheus + Grafana للمراقبة
```yaml
prometheus:
  image: prom/prometheus
  
grafana:
  image: grafana/grafana
```

### 4. Nginx Reverse Proxy للإنتاج

### 5. SSL/TLS مع Let's Encrypt

### 6. CDN لتسريع المحتوى

### 7. خدمات البث المباشر

### 8. نظام إشعارات Push

### 9. تطبيق جوال (React Native)

### 10. بودكاست وفيديو

---

## 📞 الدعم والمساعدة

### ملفات مهمة:
- `README.md` - نظرة عامة
- `QUICKSTART.md` - دليل البدء السريع
- `.env.example` - مثال على متغيرات البيئة
- `data/sample_data.json` - بيانات تجريبية

### السجلات:
```bash
# عرض جميع السجلات
docker-compose logs -f

# سجلات محددة
docker-compose logs -f backend
docker-compose logs -f frontend
```

### المجتمع والدعم:
- راجع الوثائق في مجلد `docs/`
- افتح Issue للمشاكل التقنية
- تواصل مع فريق التطوير

---

## 🎯 الروابط السريعة

| الخدمة | الرابط |
|--------|--------|
| 🏠 الواجهة الرئيسية | http://localhost:3000 |
| ⚙️ لوحة التحكم | http://localhost:3000/admin |
| 🔌 API Base | http://localhost:5000/api |
| 📊 Health Check | http://localhost:5000/api/health |
| 🔍 بحث | http://localhost:5000/api/search |
| 📰 الأخبار | http://localhost:5000/api/news |
| 🏷️ التصنيفات | http://localhost:5000/api/categories |
| 🤖 AI تحليل | http://localhost:5000/api/ai/analyze |

---

## ✨ ملاحظات ختامية

- ✅ المنصة جاهزة للاستخدام الفوري
- ✅ قابلة للتوسع بسهولة
- ✅ تدعم إضافة ميزات جديدة
- ✅ جاهزة لدمج الذكاء الاصطناعي
- ✅ تصميم متجاوب مع جميع الأجهزة

**شكراً لاستخدامك منصة الأخبار! 🎉**
