#!/bin/bash

# ============================================
# سكريبت إيقاف منصة الأخبار
# News Platform Stop Script
# ============================================

set -e

echo "======================================"
echo "  News Platform - Stop Script"
echo "  إيقاف منصة الأخبار"
echo "======================================"
echo ""

# الألوان
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
    print_error "Docker غير مثبت"
    exit 1
fi

# اختيار وضع الإيقاف
echo "اختر وضع الإيقاف:"
echo "1. إيقاف مؤقت (Restart later)"
echo "2. إيقاف كامل مع حذف الحاويات"
echo "3. إيقاف وحذف البيانات (تحذير: سيحذف كل شيء!)"
echo "4. إعادة تشغيل الخدمات"
echo ""
read -p "أدخل اختيارك [1-4]: " choice

case $choice in
    1)
        print_message "جاري إيقاف الخدمات مؤقتاً..."
        if command -v docker-compose &> /dev/null; then
            docker-compose stop
        else
            docker compose stop
        fi
        print_message "تم إيقاف الخدمات مؤقتاً"
        print_warning "لإعادة التشغيل: docker-compose start"
        ;;
    
    2)
        print_message "جاري إيقاف الخدمات وحذف الحاويات..."
        if command -v docker-compose &> /dev/null; then
            docker-compose down
        else
            docker compose down
        fi
        print_message "تم إيقاف الخدمات وحذف الحاويات"
        print_warning "البيانات لا تزال محفوظة في Volumes"
        print_warning "لإعادة التشغيل: docker-compose up -d"
        ;;
    
    3)
        echo ""
        print_error "⚠️ تحذير: هذا سيحذف جميع البيانات!"
        read -p "هل أنت متأكد؟ اكتب 'yes' للمتابعة: " confirm
        
        if [ "$confirm" = "yes" ]; then
            print_message "جاري حذف جميع البيانات والحاويات..."
            if command -v docker-compose &> /dev/null; then
                docker-compose down -v
            else
                docker compose down -v
            fi
            print_message "تم حذف جميع البيانات"
            print_warning "لإعادة التثبيت من الصفر: ./start.sh"
        else
            print_message "تم إلغاء العملية"
        fi
        ;;
    
    4)
        print_message "جاري إعادة تشغيل الخدمات..."
        if command -v docker-compose &> /dev/null; then
            docker-compose restart
        else
            docker compose restart
        fi
        print_message "تم إعادة تشغيل الخدمات"
        ;;
    
    *)
        print_error "خيار غير صحيح"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "  حالة الخدمات الحالية:"
echo "======================================"
docker-compose ps 2>/dev/null || docker compose ps 2>/dev/null || echo "لا توجد خدمات نشطة"

echo ""
print_message "انتهى العملية"
