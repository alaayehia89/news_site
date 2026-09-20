FROM python:3.11-slim

WORKDIR /app

# تثبيت المتطلبات الأساسية
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# نسخ ملف المتطلبات وتثبيتها
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ كود التطبيق
COPY . .

# إنشاء مجلدات التخزين
RUN mkdir -p uploads logs data

# فتح المنفذ
EXPOSE 5000

# تشغيل التطبيق
CMD ["python", "app.py"]
