#!/usr/bin/env python3
"""
إنشاء حساب المدير الأول
Create First Admin Account
"""

import sys
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import bcrypt
from rich.console import Console
from rich.prompt import Prompt
from rich.panel import Panel

load_dotenv()

console = Console()

def create_admin():
    """إنشاء حساب مدير أولي"""
    
    console.print(Panel.fit(
        "[bold blue]إنشاء حساب المدير الأول[/bold blue]\n"
        "Create First Admin Account",
        border_style="blue"
    ))
    
    # الاتصال بقاعدة البيانات
    try:
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/news_platform')
        client = MongoClient(mongo_uri)
        db = client.get_database()
        console.print("[green]✓ تم الاتصال بقاعدة البيانات[/green]")
    except Exception as e:
        console.print(f"[red]✗ خطأ في الاتصال بقاعدة البيانات: {e}[/red]")
        sys.exit(1)
    
    # جمع البيانات
    console.print("\n[bold]أدخل بيانات المدير:[/bold]")
    
    username = Prompt.ask("اسم المستخدم")
    email = Prompt.ask("البريد الإلكتروني")
    password = Prompt.ask("كلمة المرور", password=True, display_default="••••••••")
    confirm_password = Prompt.ask("تأكيد كلمة المرور", password=True, display_default="••••••••")
    
    # التحقق من تطابق كلمات المرور
    if password != confirm_password:
        console.print("[red]✗ كلمات المرور غير متطابقة![/red]")
        sys.exit(1)
    
    # التحقق من طول كلمة المرور
    if len(password) < 8:
        console.print("[red]✗ يجب أن تكون كلمة المرور 8 أحرف على الأقل![/red]")
        sys.exit(1)
    
    # التحقق من وجود المستخدم
    if db.users.find_one({'$or': [{'username': username}, {'email': email}]}):
        console.print("[red]✗ المستخدم موجود بالفعل![/red]")
        sys.exit(1)
    
    # تشفير كلمة المرور
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # إنشاء المستخدم
    admin_user = {
        'username': username,
        'email': email,
        'password': hashed_password.decode('utf-8'),
        'role': 'admin',
        'created_at': datetime.utcnow(),
        'is_active': True,
        'permissions': ['all']
    }
    
    try:
        result = db.users.insert_one(admin_user)
        console.print(f"\n[green]✓ تم إنشاء حساب المدير بنجاح![/green]")
        console.print(f"[green]✓ معرّف المستخدم: {str(result.inserted_id)}[/green]")
        
        console.print("\n[bold blue]بيانات الدخول:[/bold blue]")
        console.print(f"  اسم المستخدم: [yellow]{username}[/yellow]")
        console.print(f"  البريد الإلكتروني: [yellow]{email}[/yellow]")
        console.print(f"  الصلاحية: [yellow]admin[/yellow]")
        
        console.print("\n[bold]يمكنك الآن تسجيل الدخول إلى لوحة التحكم[/bold]")
        
    except Exception as e:
        console.print(f"[red]✗ خطأ في إنشاء المستخدم: {e}[/red]")
        sys.exit(1)

if __name__ == '__main__':
    create_admin()
