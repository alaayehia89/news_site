#!/bin/bash

# News Platform - Startup Script
# هذا السكريبت يقوم بتشغيل المنصة الإخبارية كاملة

set -e

echo "======================================"
echo "  News Platform - Startup Script"
echo "======================================"
echo ""

# الألوان للرسائل
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# دالة لطباعة الرسائل
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# التحقق من وجود Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker غير مثبت. يرجى تثبيت Docker أولاً."
    exit 1
fi
print_message "Docker موجود"

# التحقق من وجود Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose غير مثبت. يرجى تثبيته أولاً."
    exit 1
fi
print_message "Docker Compose موجود"

# التحقق من وجود ملف .env
if [ ! -f ".env" ]; then
    print_warning "ملف .env غير موجود. سيتم إنشاء ملف افتراضي."
    cat > .env << EOF
# OpenAI API Key (اختياري - لميزات الذكاء الاصطناعي)
OPENAI_API_KEY=

# JWT Secret Key (يجب تغييره في الإنتاج)
JWT_SECRET=your_super_secret_jwt_key_change_in_production_$(date +%s)
EOF
    print_message "تم إنشاء ملف .env"
fi

# التحقق من المتطلبات الأساسية
print_message "جاري التحقق من المتطلبات..."

# إنشاء المجلدات المطلوبة
mkdir -p uploads data logs
print_message "تم إنشاء المجلدات المطلوبة"

# اختيار وضع التشغيل
echo ""
echo "اختر وضع التشغيل:"
echo "1. Docker (موصى به)"
echo "2. يدوي (Manual)"
echo "3. تطوير (Development)"
echo ""
read -p "أدخل اختيارك [1-3]: " choice

case $choice in
    1)
        print_message "جاري تشغيل المنصة باستخدام Docker..."
        
        # بناء وتشغيل الحاويات
        if command -v docker-compose &> /dev/null; then
            docker-compose up --build -d
        else
            docker compose up --build -d
        fi
        
        print_message "جاري انتظار بدء الخدمات..."
        sleep 10
        
        print_message "تم تشغيل المنصة بنجاح!"
        echo ""
        echo "======================================"
        echo "  الوصول إلى المنصة:"
        echo "======================================"
        echo "  الواجهة الرئيسية: http://localhost:3000"
        echo "  لوحة التحكم:     http://localhost:3000/admin"
        echo "  API Endpoint:    http://localhost:5000/api"
        echo "  MongoDB:         localhost:27017"
        echo "  Redis:           localhost:6379"
        echo "======================================"
        echo ""
        print_warning "لإيقاف المنصة: docker-compose down"
        print_warning "لمشاهدة السجلات: docker-compose logs -f"
        ;;
    
    2)
        print_message "التشغيل اليدوي..."
        
        # تشغيل MongoDB
        print_warning "تأكد من تشغيل MongoDB على المنفذ 27017"
        
        # تشغيل الباك إند
        echo ""
        print_message "جاري تشغيل الباك إند..."
        cd backend
        if [ ! -d "venv" ]; then
            print_message "جاري إنشاء بيئة Python افتراضية..."
            python3 -m venv venv
        fi
        source venv/bin/activate
        pip install -r requirements.txt
        python app.py &
        BACKEND_PID=$!
        cd ..
        
        # تشغيل الفرونت إند
        echo ""
        print_message "جاري تشغيل الفرونت إند..."
        cd frontend
        if [ ! -d "node_modules" ]; then
            print_message "جاري تثبيت حزم Node.js..."
            npm install
        fi
        npm start &
        FRONTEND_PID=$!
        cd ..
        
        echo ""
        print_message "تم تشغيل المنصة في الوضع اليدوي!"
        echo "اضغط Ctrl+C لإيقاف الخدمات"
        
        # انتظار إيقاف المستخدم
        wait
        ;;
    
    3)
        print_message "وضع التطوير..."
        
        # تشغيل جميع الخدمات في وضع التطوير
        if command -v docker-compose &> /dev/null; then
            docker-compose up --build
        else
            docker compose up --build
        fi
        ;;
    
    *)
        print_error "خيار غير صحيح. يرجى إعادة التشغيل واختيار رقم بين 1 و 3."
        exit 1
        ;;
esac

echo ""
print_message "شكراً لاستخدامك News Platform!"
