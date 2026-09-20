# ===========================================
# News Platform - دليل التشغيل السريع
# ===========================================

## 🚀 طرق التشغيل المتاحة

### الطريقة 1: Docker (الأسهل والموصى بها)

#### المتطلبات:
- Docker مثبت على جهازك
- Docker Compose مثبت

#### خطوات التشغيل:

1. **انتقل إلى مجلد المشروع:**
```bash
cd /workspace/news_platform
```

2. **أنشئ ملف .env (اختياري):**
```bash
cp .env.example .env
# عدل الملف وأضف مفاتيح API إذا أردت استخدام الذكاء الاصطناعي
```

3. **شغل المنصة:**
```bash
# باستخدام السكريبت التفاعلي
./start.sh

# أو مباشرة باستخدام Docker Compose
docker-compose up --build -d
```

4. **انتظر حتى تبدأ الخدمات (حوالي 30 ثانية):**
```bash
docker-compose ps
```

5. **افتح المتصفح:**
- الواجهة الرئيسية: http://localhost:3000
- لوحة التحكم: http://localhost:3000/admin
- API: http://localhost:5000/api

---

### الطريقة 2: التشغيل اليدوي (للمطورين)

#### المتطلبات:
- Python 3.11+
- Node.js 18+
- MongoDB 7+
- Redis 7+

#### خطوات التشغيل:

**أولاً: تشغيل قاعدة البيانات**
```bash
# تشغيل MongoDB
mongod --dbpath /data/db

# في نافذة أخرى، شغّل Redis
redis-server
```

**ثانياً: تشغيل الباك إند**
```bash
cd backend

# إنشاء بيئة افتراضية
python3 -m venv venv
source venv/bin/activate  # على Linux/Mac
# أو venv\Scripts\activate على Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# إنشاء ملف .env
cp .env.example .env

# تشغيل التطبيق
python app.py
```

**ثالثاً: تشغيل الفرونت إند**
```bash
cd frontend

# تثبيت المتطلبات
npm install

# تشغيل التطبيق
npm start
```

---

## 📋 إدارة المنصة

### إيقاف المنصة (Docker):
```bash
docker-compose down
```

### إعادة التشغيل:
```bash
docker-compose restart
```

### عرض السجلات:
```bash
# جميع السجلات
docker-compose logs -f

# سجلات الباك إند فقط
docker-compose logs -f backend

# سجلات الفرونت إند فقط
docker-compose logs -f frontend
```

### تحديث المنصة:
```bash
docker-compose pull
docker-compose up -d --build
```

---

## 👤 إنشاء حساب مدير

بعد تشغيل المنصة، أنشئ حساب المدير الأول:

```bash
cd backend
python create_admin.py
```

سيطلب منك:
- اسم المستخدم
- البريد الإلكتروني
- كلمة المرور

---

## 📤 رفع الأخبار

### عبر لوحة التحكم:
1. سجل الدخول كمدير
2. اذهب إلى "إدارة الأخبار"
3. اختر "رفع JSON" أو "إضافة خبر يدوياً"

### عبر API:
```bash
curl -X POST http://localhost:5000/api/news/import \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@news.json"
```

### مثال على ملف JSON:
```json
{
  "title": "عنوان الخبر",
  "content": "محتوى الخبر...",
  "category": "سياسة",
  "tags": ["كلمة مفتاحية 1", "كلمة مفتاحية 2"],
  "author": "اسم الكاتب",
  "isBreaking": false,
  "publishDate": "2024-01-01T12:00:00Z"
}
```

---

## 🤖 تفعيل الذكاء الاصطناعي

1. احصل على مفتاح API من OpenAI
2. أضفه إلى ملف `.env`:
```
OPENAI_API_KEY=sk-your-key-here
AI_MODEL=gpt-4
```

3. أعد تشغيل الباك إند:
```bash
docker-compose restart backend
```

4. من لوحة التحكم، فعل ميزات الذكاء الاصطناعي

---

## 🔧 استكشاف الأخطاء

### المشكلة: لا يمكن الاتصال بقاعدة البيانات
**الحل:**
```bash
# تأكد من تشغيل MongoDB
docker-compose ps mongodb

# إذا لم يكن يعمل، أعد تشغيله
docker-compose restart mongodb
```

### المشكلة: أخطاء في تثبيت الحزم
**الحل:**
```bash
# للباك إند
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# للفرونت إند
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### المشكلة: المنفذ مشغول
**الحل:**
```bash
# اعرف العملية التي تستخدم المنفذ
lsof -i :3000  # للفرونت إند
lsof -i :5000  # للباك إند

# أوقف العملية
kill -9 <PID>
```

---

## 📊 الوصول إلى قواعد البيانات

### MongoDB:
```bash
# الاتصال المباشر
mongo mongodb://admin:admin123@localhost:27017/news_platform

# أو عبر Docker
docker exec -it news_mongodb mongosh -u admin -p admin123
```

### Redis:
```bash
redis-cli -h localhost -p 6379
```

---

## 🎯 الروابط المهمة

| الخدمة | الرابط |
|--------|--------|
| الواجهة الرئيسية | http://localhost:3000 |
| لوحة التحكم | http://localhost:3000/admin |
| API Base | http://localhost:5000/api |
| API Docs | http://localhost:5000/api/docs |
| WebSocket | ws://localhost:5000/ws |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

---

## 📞 الدعم

للمزيد من المساعدة:
- راجع ملف README.md للتفاصيل الكاملة
- تفقد مجلد docs/ للوثائق المفصلة
- راجع سجلات التطبيق لاكتشاف الأخطاء
