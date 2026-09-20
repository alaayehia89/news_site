#!/usr/bin/env python3
"""
News Platform - Main Application Entry Point
منصة الأخبار - نقطة الدخول الرئيسية للتطبيق
"""

import os
import sys
from datetime import timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson.json_util import dumps
import bcrypt
import redis
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

# تحميل متغيرات البيئة
load_dotenv()

# تهيئة التطبيق
app = Flask(__name__, 
            static_folder='../frontend/build',
            static_url_path='')

# إعدادات CORS
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# إعدادات JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'default-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# إعدادات MongoDB
mongo_client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/news_platform'))
db = mongo_client.get_database()

# إعدادات Redis
redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))

# تهيئة وحدة التحكم الغنية
console = Console()

# ============================================
# مسارات API الأساسية
# ============================================

@app.route('/')
def serve_react():
    """تقديم تطبيق React"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/health')
def health_check():
    """فحص صحة النظام"""
    try:
        # فحص قاعدة البيانات
        db.command('ping')
        db_status = "connected"
    except:
        db_status = "disconnected"
    
    try:
        # فحص Redis
        redis_client.ping()
        redis_status = "connected"
    except:
        redis_status = "disconnected"
    
    return jsonify({
        "status": "healthy",
        "database": db_status,
        "cache": redis_status,
        "version": "1.0.0"
    })

# ============================================
# مسارات المصادقة
# ============================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """تسجيل مستخدم جديد"""
    data = request.get_json()
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')
    
    # التحقق من وجود المستخدم
    if db.users.find_one({'$or': [{'username': username}, {'email': email}]}):
        return jsonify({"error": "المستخدم موجود بالفعل"}), 400
    
    # تشفير كلمة المرور
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # إنشاء المستخدم
    user = {
        'username': username,
        'email': email,
        'password': hashed_password.decode('utf-8'),
        'role': role,
        'created_at': datetime.utcnow(),
        'is_active': True
    }
    
    result = db.users.insert_one(user)
    
    return jsonify({
        "message": "تم التسجيل بنجاح",
        "user_id": str(result.inserted_id)
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """تسجيل الدخول"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # البحث عن المستخدم
    user = db.users.find_one({'username': username})
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "اسم المستخدم أو كلمة المرور غير صحيحة"}), 401
    
    # إنشاء توكن الوصول
    access_token = create_access_token(
        identity=str(user['_id']),
        additional_claims={'username': user['username'], 'role': user['role']}
    )
    
    return jsonify({
        "access_token": access_token,
        "user": {
            "id": str(user['_id']),
            "username": user['username'],
            "email": user['email'],
            "role": user['role']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """الحصول على بيانات المستخدم الحالي"""
    current_user_id = get_jwt_identity()
    user = db.users.find_one({'_id': current_user_id})
    
    if not user:
        return jsonify({"error": "المستخدم غير موجود"}), 404
    
    return jsonify({
        "id": str(user['_id']),
        "username": user['username'],
        "email": user['email'],
        "role": user['role']
    })

# ============================================
# مسارات الأخبار
# ============================================

@app.route('/api/news', methods=['GET'])
def get_news():
    """الحصول على قائمة الأخبار"""
    category = request.args.get('category')
    is_breaking = request.args.get('breaking')
    limit = int(request.args.get('limit', 20))
    skip = int(request.args.get('skip', 0))
    
    query = {}
    if category:
        query['category'] = category
    if is_breaking:
        query['isBreaking'] = is_breaking.lower() == 'true'
    
    news_list = list(db.news.find(query)
                     .sort('publishDate', -1)
                     .skip(skip)
                     .limit(limit))
    
    return app.response_class(dumps(news_list), mimetype='application/json')

@app.route('/api/news/<news_id>', methods=['GET'])
def get_news_item(news_id):
    """الحصول على خبر محدد"""
    from bson.objectid import ObjectId
    
    try:
        news = db.news.find_one({'_id': ObjectId(news_id)})
        if not news:
            return jsonify({"error": "الخبر غير موجود"}), 404
        
        return app.response_case(dumps(news), mimetype='application/json')
    except:
        return jsonify({"error": "معرف الخبر غير صحيح"}), 400

@app.route('/api/news', methods=['POST'])
@jwt_required()
def create_news():
    """إنشاء خبر جديد"""
    from datetime import datetime
    
    current_user_id = get_jwt_identity()
    user = db.users.find_one({'_id': current_user_id})
    
    if user['role'] not in ['admin', 'editor']:
        return jsonify({"error": "غير مصرح لك بإنشاء أخبار"}), 403
    
    data = request.get_json()
    
    news = {
        'title': data.get('title'),
        'content': data.get('content'),
        'summary': data.get('summary', ''),
        'category': data.get('category'),
        'tags': data.get('tags', []),
        'author': data.get('author', user['username']),
        'isBreaking': data.get('isBreaking', False),
        'publishDate': data.get('publishDate', datetime.utcnow()),
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow(),
        'views': 0,
        'status': 'published'
    }
    
    result = db.news.insert_one(news)
    
    return jsonify({
        "message": "تم إنشاء الخبر بنجاح",
        "news_id": str(result.inserted_id)
    }), 201

@app.route('/api/news/import', methods=['POST'])
@jwt_required()
def import_news_json():
    """استيراد أخبار من ملف JSON"""
    from datetime import datetime
    import json
    
    current_user_id = get_jwt_identity()
    user = db.users.find_one({'_id': current_user_id})
    
    if user['role'] != 'admin':
        return jsonify({"error": "غير مصرح لك باستيراد الأخبار"}), 403
    
    if 'file' not in request.files:
        return jsonify({"error": "لم يتم رفع أي ملف"}), 400
    
    file = request.files['file']
    
    try:
        data = json.load(file)
        
        # دعم القائمة المفردة أو المتعددة
        if isinstance(data, dict):
            data = [data]
        
        imported_count = 0
        for item in data:
            news = {
                'title': item.get('title'),
                'content': item.get('content'),
                'summary': item.get('summary', ''),
                'category': item.get('category'),
                'tags': item.get('tags', []),
                'author': item.get('author', user['username']),
                'isBreaking': item.get('isBreaking', False),
                'publishDate': item.get('publishDate', datetime.utcnow()),
                'createdAt': datetime.utcnow(),
                'views': 0,
                'status': 'published'
            }
            
            db.news.insert_one(news)
            imported_count += 1
        
        return jsonify({
            "message": f"تم استيراد {imported_count} خبر بنجاح",
            "count": imported_count
        })
    
    except json.JSONDecodeError:
        return jsonify({"error": "ملف JSON غير صالح"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# مسارات التصنيفات
# ============================================

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """الحصول على قائمة التصنيفات"""
    categories = list(db.categories.find().sort('name', 1))
    return app.response_class(dumps(categories), mimetype='application/json')

# ============================================
# مسارات الذكاء الاصطناعي
# ============================================

@app.route('/api/ai/analyze', methods=['POST'])
@jwt_required()
def ai_analyze():
    """تحليل نص باستخدام الذكاء الاصطناعي"""
    import openai
    
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return jsonify({"error": "لم يتم تكوين مفتاح API للذكاء الاصطناعي"}), 503
    
    data = request.get_json()
    text = data.get('text')
    analysis_type = data.get('type', 'summary')
    
    try:
        client = openai.OpenAI(api_key=api_key)
        
        prompts = {
            'summary': 'لخص النص التالي باللغة العربية:',
            'sentiment': 'حلل المشاعر في النص التالي:',
            'keywords': 'استخرج الكلمات المفتاحية من النص التالي:',
            'translate': 'ترجم النص التالي إلى الإنجليزية:'
        }
        
        prompt = prompts.get(analysis_type, prompts['summary'])
        
        response = client.chat.completions.create(
            model=os.getenv('AI_MODEL', 'gpt-4'),
            messages=[
                {"role": "system", "content": "أنت مساعد ذكي متخصص في تحليل النصوص الإخبارية."},
                {"role": "user", "content": f"{prompt}\n\n{text}"}
            ],
            max_tokens=int(os.getenv('MAX_TOKENS', 1000)),
            temperature=float(os.getenv('AI_TEMPERATURE', 0.7))
        )
        
        return jsonify({
            "analysis": response.choices[0].message.content,
            "type": analysis_type
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# مسارات البحث
# ============================================

@app.route('/api/search', methods=['GET'])
def search():
    """البحث في الأخبار"""
    query = request.args.get('q', '')
    category = request.args.get('category')
    
    if not query:
        return jsonify([])
    
    # بحث نصي بسيط (يمكن تحسينه باستخدام Elasticsearch لاحقاً)
    search_query = {
        '$or': [
            {'title': {'$regex': query, '$options': 'i'}},
            {'content': {'$regex': query, '$options': 'i'}},
            {'tags': {'$regex': query, '$options': 'i'}}
        ]
    }
    
    if category:
        search_query['category'] = category
    
    results = list(db.news.find(search_query)
                   .sort('publishDate', -1)
                   .limit(50))
    
    return app.response_class(dumps(results), mimetype='application/json')

# ============================================
# مسارات الإحصائيات
# ============================================

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """الحصول على إحصائيات المنصة"""
    current_user_id = get_jwt_identity()
    user = db.users.find_one({'_id': current_user_id})
    
    if user['role'] != 'admin':
        return jsonify({"error": "غير مصرح"}), 403
    
    stats = {
        'total_news': db.news.count_documents({}),
        'total_users': db.users.count_documents({}),
        'total_categories': db.categories.count_documents({}),
        'breaking_news': db.news.count_documents({'isBreaking': True}),
        'recent_views': db.news.aggregate([
            {'$group': {'_id': None, 'total': {'$sum': '$views'}}}
        ]).try_next()['total'] if db.news.aggregate([
            {'$group': {'_id': None, 'total': {'$sum': '$views'}}}
        ]).clone().try_next() else 0
    }
    
    return jsonify(stats)

# ============================================
# معالجة الأخطاء
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "الصفحة غير موجودة"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "خطأ داخلي في الخادم"}), 500

# ============================================
# تشغيل التطبيق
# ============================================

if __name__ == '__main__':
    # عرض معلومات الترحيب
    console.print(Panel.fit(
        "[bold blue]News Platform Backend[/bold blue]\n"
        "منصة الأخبار - الخادم الخلفي\n\n"
        "[green]Starting server...[/green]",
        title="🚀 News Platform",
        border_style="blue"
    ))
    
    # عرض جدول المعلومات
    table = Table(title="إعدادات الخادم")
    table.add_column("الإعداد", style="cyan")
    table.add_column("القيمة", style="green")
    
    table.add_row("Port", os.getenv('PORT', '5000'))
    table.add_row("Database", "MongoDB")
    table.add_row("Cache", "Redis")
    table.add_row("AI Support", "Enabled" if os.getenv('OPENAI_API_KEY') else "Disabled")
    
    console.print(table)
    
    # تشغيل الخادم
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
