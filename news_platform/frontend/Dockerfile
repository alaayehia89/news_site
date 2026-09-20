# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

# نسخ ملف package.json وتثبيت التبعيات
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# نسخ كود التطبيق
COPY . .

# بناء التطبيق
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# نسخ الملفات المبنية
COPY --from=build /app/build /usr/share/nginx/html

# نسخ إعدادات nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# فتح المنفذ
EXPOSE 80

# تشغيل nginx
CMD ["nginx", "-g", "daemon off;"]
