const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'users.db');
const DATA_DIR = path.join(__dirname, 'data');
const ARTICLES_IMPORT_FILE = 'articles.import.json';
const SESSION_COOKIE = 'news_session';
const SESSION_DAYS = 7;
const DEFAULT_CATEGORIES = ['سياسة', 'اقتصاد', 'رياضة', 'تقنية', 'ثقافة'];
const DEFAULT_REGIONS = ['محلي', 'العالم العربي', 'العالم'];
const DEFAULT_SITE_SETTINGS = {
  siteName: 'الخبر',
  tagline: 'تغطية مستمرة للأحداث المحلية والإقليمية والعالمية',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#1d4ed8',
  accentColor: '#dc2626',
  backgroundColor: '#f4f7fb',
  textColor: '#0f172a',
  heroBadge: 'أحدث الأخبار',
  heroTitle: 'تغطية مستمرة للأحداث المحلية والإقليمية والعالمية',
  heroDescription: 'متابعة دقيقة للسياسة والاقتصاد والرياضة والثقافة مع تقارير وتحليلات صحفية متجددة.',
  heroPrimaryAction: 'اقرأ الأخبار',
  heroSecondaryAction: 'لوحة التحرير',
  showBreaking: true,
  showLatestAnalysis: true,
  showFilters: true,
  sectionLabels: {
    breaking: 'العواجل',
    politics: 'سياسة',
    economy: 'اقتصاد',
    sports: 'رياضة',
    technology: 'تقنية',
    culture: 'ثقافة',
    opinion: 'الرأي',
    analysis: 'التحليلات',
  },
};

app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  if (req.path === '/users.db' || req.path === '/server.log' || req.path.startsWith('/data/')) {
    return res.sendStatus(404);
  }
  return next();
});
app.use(express.static(__dirname));

function readJsonFile(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonFile(fileName, value) {
  const filePath = path.join(DATA_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function readConfigList(fileName, defaults) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) return [...defaults];
  const value = readJsonFile(fileName);
  return Array.isArray(value) ? value : [...defaults];
}

function normalizeArticle(article) {
  return {
    id: Number(article.id),
    title: String(article.title || '').trim(),
    summary: String(article.summary || '').trim(),
    content: String(article.content || '').trim(),
    type: String(article.type || 'خبر').trim(),
    category: String(article.category || '').trim(),
    region: String(article.region || '').trim(),
    keywords: Array.isArray(article.keywords) ? article.keywords : [],
    image_url: article.image_url || '',
    author: article.author || 'إدارة التحرير',
    status: article.status || 'Published',
    date: article.date || new Date().toISOString().slice(0, 10),
    published_at: article.published_at || new Date().toISOString(),
  };
}

function importArticlesIntoDatabase(articles, replaceExisting, callback) {
  const normalizedArticles = articles.map(normalizeArticle);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION', (beginErr) => {
      if (beginErr) return callback(beginErr);

      const finish = (err) => {
        if (err) {
          return db.run('ROLLBACK', () => callback(err));
        }
        return db.run('COMMIT', callback);
      };

      const clearArticles = replaceExisting ? 'DELETE FROM articles' : 'SELECT 1';
      db.run(clearArticles, (clearErr) => {
        if (clearErr) return finish(clearErr);

        const insertArticle = db.prepare(
          `INSERT INTO articles
            (title, summary, content, type, category, region, keywords, image_url, author, status, date, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          (prepareErr) => {
            if (prepareErr) return finish(prepareErr);

            let index = 0;
            const insertNext = () => {
              if (index >= normalizedArticles.length) {
                return insertArticle.finalize(finish);
              }

              const article = normalizedArticles[index++];
              insertArticle.run([
                article.title,
                article.summary,
                article.content,
                article.type,
                article.category,
                article.region,
                JSON.stringify(article.keywords),
                article.image_url,
                article.author,
                article.status,
                article.date,
                article.published_at,
              ], (insertErr) => {
                if (insertErr) return insertArticle.finalize(() => finish(insertErr));
                return insertNext();
              });
            };

            insertNext();
          }
        );
      });
    });
  });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }

  console.log('Connected to SQLite database.');

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'reader',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Upgrade databases created before roles were introduced. The oldest
    // existing account remains the administrator; later accounts are readers.
    db.run("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'reader'", (roleErr) => {
      if (roleErr && !/duplicate column name/i.test(roleErr.message)) {
        console.error('Failed to add user role column:', roleErr.message);
        process.exit(1);
      }
    });
    db.run("UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users) AND (role IS NULL OR role = 'reader')");

    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'reader',
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        region TEXT NOT NULL,
        keywords TEXT,
        image_url TEXT,
        author TEXT,
        status TEXT DEFAULT 'Published',
        date TEXT NOT NULL,
        published_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (tableErr) => {
      if (tableErr) {
        console.error('Failed to create articles table:', tableErr.message);
        process.exit(1);
      }

      db.run(`
        CREATE TABLE IF NOT EXISTS breaking_headlines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          keywords TEXT DEFAULT '[]',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (headlinesErr) => {
        if (headlinesErr) {
          console.error('Failed to create breaking headlines table:', headlinesErr.message);
          process.exit(1);
        }

        db.all('PRAGMA table_info(breaking_headlines)', (columnsErr, columns) => {
          if (columnsErr) {
            console.error('Failed to inspect breaking headlines table:', columnsErr.message);
            process.exit(1);
          }

          const hasKeywords = columns.some((column) => column.name === 'keywords');
          const continueInitialization = () => db.get('SELECT COUNT(*) AS total FROM articles', (countErr, row) => {
        if (countErr) {
          console.error('Failed to check articles table:', countErr.message);
          process.exit(1);
        }

        if (Number(row.total) > 0) {
          console.log('Users and articles tables ready.');
          return;
        }

        const importPath = path.join(DATA_DIR, ARTICLES_IMPORT_FILE);
        let initialArticles = [];
        if (fs.existsSync(importPath)) {
          try {
            initialArticles = readJsonFile(ARTICLES_IMPORT_FILE);
          } catch (importErr) {
            console.warn('Failed to read articles.import.json:', importErr.message);
          }
        } else if (fs.existsSync(path.join(DATA_DIR, 'articles.json'))) {
          try {
            initialArticles = readJsonFile('articles.json');
          } catch (jsonErr) {
            console.warn('Failed to read articles.json:', jsonErr.message);
          }
        }

        if (initialArticles.length === 0) {
          console.log('No initial articles found. Starting with empty database.');
          console.log('Users and articles tables ready.');
          return;
        }

        importArticlesIntoDatabase(initialArticles, false, (articlesErr) => {
      if (articlesErr) {
        console.error('Failed to import initial articles:', articlesErr.message);
        process.exit(1);
      }

          console.log('Users and articles tables ready.');
        });
      });

          if (hasKeywords) return continueInitialization();
          db.run("ALTER TABLE breaking_headlines ADD COLUMN keywords TEXT DEFAULT '[]'", (alterErr) => {
            if (alterErr) {
              console.error('Failed to add breaking headline keywords:', alterErr.message);
              process.exit(1);
            }
            continueInitialization();
          });
        });
      });
    });
  });
});

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((cookies, item) => {
    const separator = item.indexOf('=');
    if (separator < 0) return cookies;
    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function createSession(userId, role, callback) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.run(
    'INSERT INTO sessions (token_hash, user_id, role, expires_at) VALUES (?, ?, ?, ?)',
    [hashSessionToken(token), userId, role || 'reader', expiresAt],
    (err) => callback(err, token, expiresAt)
  );
}

function setSessionCookie(res, token, expiresAt) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax${secure}; Expires=${new Date(expiresAt).toUTCString()}`);
}

function getSessionUser(req, callback) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return callback(null, null);

  db.get(
    `SELECT users.id, users.name, users.email, users.role, sessions.expires_at
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ? AND sessions.expires_at > CURRENT_TIMESTAMP`,
    [hashSessionToken(token)],
    callback
  );
}

function requireAdmin(req, res, next) {
  getSessionUser(req, (err, user) => {
    if (err) return sendError(res, 500, 'تعذر التحقق من الجلسة.');
    if (!user) return sendError(res, 401, 'يجب تسجيل الدخول أولاً.');
    if (user.role !== 'admin') return sendError(res, 403, 'لا تملك صلاحية إدارة المحتوى.');
    req.user = user;
    return next();
  });
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.get('/api/me', (req, res) => {
  getSessionUser(req, (err, user) => {
    if (err) return sendError(res, 500, 'تعذر التحقق من الجلسة.');
    if (!user) return res.status(401).json({ success: false, authenticated: false });
    return res.json({ success: true, authenticated: true, user });
  });
});

app.post('/api/logout', (req, res) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return res.json({ success: true });

  db.run('DELETE FROM sessions WHERE token_hash = ?', [hashSessionToken(token)], () => {
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    return res.json({ success: true });
  });
});

app.get('/api/site-settings', (req, res) => {
  try {
    const savedSettings = readJsonFile('site-settings.json');
    return res.json({
      success: true,
      settings: {
        ...DEFAULT_SITE_SETTINGS,
        ...savedSettings,
        sectionLabels: {
          ...DEFAULT_SITE_SETTINGS.sectionLabels,
          ...(savedSettings.sectionLabels || {}),
        },
      },
    });
  } catch (error) {
    return sendError(res, 500, 'تعذر تحميل إعدادات هوية الموقع.');
  }
});

app.put('/api/site-settings', requireAdmin, (req, res) => {
  const currentSettings = {
    ...DEFAULT_SITE_SETTINGS,
    ...readJsonFile('site-settings.json'),
  };
  const body = req.body || {};
  const siteName = String(body.siteName || '').trim();
  const tagline = String(body.tagline || '').trim();
  const logoUrl = String(body.logoUrl || '').trim();
  const faviconUrl = String(body.faviconUrl || '').trim();
  const primaryColor = String(body.primaryColor || '').trim();
  const accentColor = String(body.accentColor || '').trim();
  const backgroundColor = String(body.backgroundColor || '').trim();
  const textColor = String(body.textColor || '').trim();
  const heroBadge = String(body.heroBadge || '').trim();
  const heroTitle = String(body.heroTitle || '').trim();
  const heroDescription = String(body.heroDescription || '').trim();
  const heroPrimaryAction = String(body.heroPrimaryAction || '').trim();
  const heroSecondaryAction = String(body.heroSecondaryAction || '').trim();
  const showBreaking = body.showBreaking !== false;
  const showLatestAnalysis = body.showLatestAnalysis !== false;
  const showFilters = body.showFilters !== false;
  const sectionLabels = body.sectionLabels && typeof body.sectionLabels === 'object'
    ? body.sectionLabels
    : currentSettings.sectionLabels;

  if (!siteName || !heroTitle) return sendError(res, 400, 'اسم الموقع والعنوان الرئيسي مطلوبان.');

  const colorPattern = /^#[0-9a-fA-F]{6}$/;
  if (![primaryColor, accentColor, backgroundColor, textColor].every((color) => colorPattern.test(color))) {
    return sendError(res, 400, 'ألوان الهوية يجب أن تكون بصيغة HEX مثل #1d4ed8.');
  }

  const settings = {
    ...DEFAULT_SITE_SETTINGS,
    ...currentSettings,
    siteName,
    tagline,
    logoUrl,
    faviconUrl,
    primaryColor,
    accentColor,
    backgroundColor,
    textColor,
    heroBadge,
    heroTitle,
    heroDescription,
    heroPrimaryAction,
    heroSecondaryAction,
    showBreaking,
    showLatestAnalysis,
    showFilters,
    sectionLabels,
  };

  try {
    writeJsonFile('site-settings.json', settings);
    return res.json({ success: true, settings });
  } catch (error) {
    return sendError(res, 500, 'تعذر حفظ إعدادات هوية الموقع.');
  }
});

app.post('/api/site-settings/reset', requireAdmin, (req, res) => {
  try {
    writeJsonFile('site-settings.json', DEFAULT_SITE_SETTINGS);
    return res.json({ success: true, settings: DEFAULT_SITE_SETTINGS });
  } catch (error) {
    return sendError(res, 500, 'تعذر استعادة إعدادات الموقع الافتراضية.');
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return sendError(res, 400, 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة.');
  }

  if (password.length < 6) {
    return sendError(res, 400, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(String(email).trim())) {
    return sendError(res, 400, 'يرجى إدخال عنوان بريد إلكتروني صالح.');
  }

  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  db.get('SELECT COUNT(*) AS total FROM users', (countErr, row) => {
    if (countErr) return sendError(res, 500, 'خطأ في قاعدة البيانات أثناء إنشاء الحساب.');
    const role = Number(row.total) === 0 ? 'admin' : 'reader';
    db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [trimmedName, trimmedEmail, passwordHash, role],
      function insertUser(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return sendError(res, 409, 'هذا البريد الإلكتروني مسجل بالفعل.');
        }
        return sendError(res, 500, 'خطأ في قاعدة البيانات أثناء إنشاء الحساب.');
      }

      return res.status(201).json({
        success: true,
        message: 'تم تسجيل المستخدم بنجاح.',
        user: {
          id: this.lastID,
          name: trimmedName,
          email: trimmedEmail,
          role,
        },
      });
      }
    );
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return sendError(res, 400, 'البريد الإلكتروني وكلمة المرور مطلوبة.');
  }

  const trimmedEmail = String(email).trim().toLowerCase();

  db.get('SELECT * FROM users WHERE email = ?', [trimmedEmail], async (err, user) => {
    if (err) {
      return sendError(res, 500, 'خطأ في قاعدة البيانات أثناء التحقق من المستخدم.');
    }

    if (!user) {
      return sendError(res, 401, 'البريد الإلكتروني أو كلمة المرور غير صحيح.');
    }

    const isPasswordValid = await bcrypt.compare(String(password), user.password_hash);
    if (!isPasswordValid) {
      return sendError(res, 401, 'البريد الإلكتروني أو كلمة المرور غير صحيح.');
    }

    createSession(user.id, user.role, (sessionErr, token, expiresAt) => {
      if (sessionErr) return sendError(res, 500, 'تعذر إنشاء جلسة الدخول.');

      setSessionCookie(res, token, expiresAt);
      return res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
});

app.get('/api/articles', (req, res) => {
  getSessionUser(req, (sessionErr, user) => {
    if (sessionErr) return sendError(res, 500, 'تعذر التحقق من الجلسة.');
    const includeAll = req.query.includeAll === 'true' && user?.role === 'admin';
  const { category, region, type, status, keyword, fromDate, toDate } = req.query;
  let query = 'SELECT * FROM articles';
  const conditions = [];
  const params = [];

  if (!includeAll) {
    conditions.push("(status = 'Published' OR status = 'Breaking' OR status = 'عاجل')");
  }

  if (category && category !== 'all') {
    if (category === 'تقنية') {
      conditions.push("(category = 'تقنية' OR category = 'تكنولوجيا')");
    } else {
      conditions.push('category = ?');
      params.push(category);
    }
  }

  if (region && region !== 'all') {
    conditions.push('region = ?');
    params.push(region);
  }

  if (type && type !== 'all') {
    conditions.push('type = ?');
    params.push(type);
  }

  if (status && status !== 'all') {
    if (status === 'Breaking') {
      conditions.push("(status = 'Breaking' OR status = 'عاجل')");
    } else {
      conditions.push('status = ?');
      params.push(status);
    }
  }

  if (keyword && keyword.trim()) {
    conditions.push('(title LIKE ? OR summary LIKE ? OR content LIKE ? OR keywords LIKE ?)');
    const searchTerm = `%${keyword.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (fromDate) {
    conditions.push('date >= ?');
    params.push(fromDate);
  }

  if (toDate) {
    conditions.push('date <= ?');
    params.push(toDate);
  }

  if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
  query += ' ORDER BY date DESC, published_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return sendError(res, 500, 'فشل تحميل المقالات الإخبارية من قاعدة البيانات.');

    return res.json({
      success: true,
      articles: rows.map((row) => ({
        ...row,
        keywords: row.keywords ? JSON.parse(row.keywords) : [],
      })),
    });
  });
  });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  db.get(
    'SELECT (SELECT COUNT(*) FROM articles) AS articles, (SELECT COUNT(*) FROM users) AS users',
    (err, row) => {
      if (err) return sendError(res, 500, 'تعذر تحميل إحصاءات لوحة التحكم.');
      return res.json({ success: true, stats: row });
    }
  );
});

app.get('/api/articles/:id', (req, res) => {
  const articleId = Number(req.params.id);
  if (!Number.isInteger(articleId) || articleId < 1) return sendError(res, 400, 'معرف المقال غير صالح.');

  getSessionUser(req, (sessionErr, user) => {
    if (sessionErr) return sendError(res, 500, 'تعذر التحقق من الجلسة.');
    const includeAll = user?.role === 'admin';
    const query = includeAll
      ? 'SELECT * FROM articles WHERE id = ?'
      : "SELECT * FROM articles WHERE id = ? AND (status = 'Published' OR status = 'Breaking' OR status = 'عاجل')";
  db.get(query, [articleId], (err, row) => {
    if (err) return sendError(res, 500, 'تعذر تحميل المقال.');
    if (!row) return sendError(res, 404, 'المقال غير موجود.');
    return res.json({
      success: true,
      article: {
        ...row,
        keywords: row.keywords ? JSON.parse(row.keywords) : [],
      },
    });
  });
  });
});

app.get('/api/breaking-headlines', (req, res) => {
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
  const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);

  db.all(
    'SELECT id, title, keywords, created_at, updated_at FROM breaking_headlines ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, rows) => {
      if (err) return sendError(res, 500, 'تعذر تحميل عناوين العواجل.');
      return res.json({
        success: true,
        headlines: rows.map((row) => ({
          ...row,
          keywords: row.keywords ? JSON.parse(row.keywords) : [],
        })),
        hasMore: rows.length === limit,
      });
    }
  );
});

app.post('/api/breaking-headlines', requireAdmin, (req, res) => {
  const title = String(req.body?.title || '').trim();
  const keywords = Array.isArray(req.body?.keywords) ? req.body.keywords : [];
  if (!title) return sendError(res, 400, 'عنوان العاجل مطلوب.');

  db.run(
    'INSERT INTO breaking_headlines (title, keywords) VALUES (?, ?)',
    [title, JSON.stringify(keywords)],
    function onInsert(err) {
      if (err) return sendError(res, 500, 'تعذر حفظ عنوان العاجل.');
      return res.status(201).json({
        success: true,
        headline: { id: this.lastID, title, keywords },
      });
    }
  );
});

app.post('/api/breaking-headlines/import', requireAdmin, (req, res) => {
  const imported = Array.isArray(req.body) ? req.body : req.body?.headlines;
  const headlines = (imported || []).map((item) => {
    if (typeof item === 'string') return { title: item.trim(), keywords: [] };
    return {
      title: String(item?.title || '').trim(),
      keywords: Array.isArray(item?.keywords) ? item.keywords : [],
    };
  }).filter((item) => item.title);

  if (!headlines.length) {
    return sendError(res, 400, 'ملف JSON يجب أن يحتوي على عناوين عواجل.');
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION', (beginErr) => {
      if (beginErr) return sendError(res, 500, 'تعذر بدء استيراد العواجل.');

      const insertHeadline = db.prepare('INSERT INTO breaking_headlines (title, keywords) VALUES (?, ?)', (prepareErr) => {
        if (prepareErr) {
          return db.run('ROLLBACK', () => sendError(res, 500, 'تعذر تجهيز استيراد العواجل.'));
        }

        let index = 0;
        const finish = (err) => {
          if (err) return db.run('ROLLBACK', () => sendError(res, 500, 'تعذر استيراد العواجل إلى SQLite.'));
          return db.run('COMMIT', (commitErr) => {
            if (commitErr) return sendError(res, 500, 'تعذر تثبيت استيراد العواجل.');
            return res.status(201).json({
              success: true,
              imported: headlines.length,
              message: `تم إدخال ${headlines.length} عاجل إلى قاعدة البيانات.`,
            });
          });
        };

        const insertNext = () => {
          if (index >= headlines.length) return insertHeadline.finalize(finish);
          const headline = headlines[index++];
          insertHeadline.run(headline.title, JSON.stringify(headline.keywords), (insertErr) => {
            if (insertErr) return insertHeadline.finalize(() => finish(insertErr));
            return insertNext();
          });
        };

        insertNext();
      });
    });
  });
});

app.put('/api/breaking-headlines/:id', requireAdmin, (req, res) => {
  const headlineId = Number(req.params.id);
  const title = String(req.body?.title || '').trim();
  const keywords = Array.isArray(req.body?.keywords) ? req.body.keywords : [];
  if (!Number.isInteger(headlineId) || headlineId < 1) return sendError(res, 400, 'معرف العاجل غير صالح.');
  if (!title) return sendError(res, 400, 'عنوان العاجل مطلوب.');

  db.run(
    'UPDATE breaking_headlines SET title = ?, keywords = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, JSON.stringify(keywords), headlineId],
    function onUpdate(err) {
      if (err) return sendError(res, 500, 'تعذر تعديل عنوان العاجل.');
      if (this.changes === 0) return sendError(res, 404, 'عنوان العاجل غير موجود.');
      return res.json({ success: true, message: 'تم تعديل عنوان العاجل.' });
    }
  );
});

app.delete('/api/breaking-headlines/:id', requireAdmin, (req, res) => {
  const headlineId = Number(req.params.id);
  if (!Number.isInteger(headlineId) || headlineId < 1) return sendError(res, 400, 'معرف العاجل غير صالح.');

  db.run('DELETE FROM breaking_headlines WHERE id = ?', [headlineId], function onDelete(err) {
    if (err) return sendError(res, 500, 'تعذر حذف عنوان العاجل.');
    if (this.changes === 0) return sendError(res, 404, 'عنوان العاجل غير موجود.');
    return res.json({ success: true, message: 'تم حذف عنوان العاجل.' });
  });
});

app.get('/api/search', (req, res) => {
  const {
    q = '',
    category,
    region,
    type,
    fromDate,
    toDate,
    sort = 'relevance',
    page = '1',
    limit = '12',
  } = req.query;
  const searchTerms = String(q)
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 1)
    .slice(0, 8);
  const conditions = [];
  const conditionParams = [];
  const relevanceParts = [];
  const relevanceParams = [];

  // Search is public, so drafts and other unpublished states must not appear.
  conditions.push("(status = 'Published' OR status = 'Breaking' OR status = 'عاجل')");

  searchTerms.forEach((term) => {
    const pattern = `%${term}%`;
    conditions.push('(title LIKE ? OR summary LIKE ? OR content LIKE ? OR category LIKE ? OR region LIKE ? OR author LIKE ? OR keywords LIKE ? OR type LIKE ?)');
    conditionParams.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern, pattern);
    relevanceParts.push(`
      CASE WHEN title LIKE ? THEN 12 ELSE 0 END +
      CASE WHEN summary LIKE ? THEN 7 ELSE 0 END +
      CASE WHEN content LIKE ? THEN 3 ELSE 0 END +
      CASE WHEN keywords LIKE ? THEN 5 ELSE 0 END +
      CASE WHEN category LIKE ? OR region LIKE ? OR type LIKE ? THEN 2 ELSE 0 END
    `);
    relevanceParams.push(pattern, pattern, pattern, pattern, pattern, pattern, pattern);
  });

  if (category && category !== 'all') {
    if (category === 'تقنية') {
      conditions.push("(category = 'تقنية' OR category = 'تكنولوجيا')");
    } else {
      conditions.push('category = ?');
      conditionParams.push(category);
    }
  }

  if (region && region !== 'all') {
    conditions.push('region = ?');
    conditionParams.push(region);
  }

  if (type && type !== 'all') {
    conditions.push('type = ?');
    conditionParams.push(type);
  }

  if (fromDate) {
    conditions.push('date >= ?');
    conditionParams.push(fromDate);
  }

  if (toDate) {
    conditions.push('date <= ?');
    conditionParams.push(toDate);
  }

  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 12));
  const offset = (safePage - 1) * safeLimit;
  const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const relevanceExpression = relevanceParts.length ? relevanceParts.join(' + ') : '0';
  const orderClause = sort === 'date' ? 'date DESC, published_at DESC' : 'relevance_score DESC, date DESC, published_at DESC';
  const dataQuery = `SELECT *, (${relevanceExpression}) AS relevance_score FROM articles${whereClause}`;
  const breakingConditions = searchTerms.map(() => '(title LIKE ? OR keywords LIKE ?)');
  const breakingParams = searchTerms.flatMap((term) => [`%${term}%`, `%${term}%`]);
  const breakingQuery = `SELECT id, title, keywords, created_at, updated_at FROM breaking_headlines${breakingConditions.length ? ` WHERE ${breakingConditions.join(' AND ')}` : ''}`;

  db.all(dataQuery, [...relevanceParams, ...conditionParams], (err, rows) => {
    if (err) return sendError(res, 500, 'فشل البحث في المقالات.');

    db.all(breakingQuery, breakingParams, (breakingErr, breakingRows) => {
      if (breakingErr) return sendError(res, 500, 'فشل البحث في العواجل.');

      const articleResults = rows.map((row) => ({
        ...row,
        resultType: 'article',
        keywords: row.keywords ? JSON.parse(row.keywords) : [],
        resultDate: row.date || row.published_at,
      }));
      const headlineResults = breakingRows.map((row) => ({
        ...row,
        resultType: 'breaking',
        type: 'عاجل',
        category: 'العواجل',
        region: '',
        summary: 'عنوان عاجل من غرفة الأخبار',
        date: row.updated_at || row.created_at,
        published_at: row.updated_at || row.created_at,
        keywords: row.keywords ? JSON.parse(row.keywords) : [],
        relevance_score: searchTerms.length ? searchTerms.reduce((score, term) => {
          return score
            + (row.title.includes(term) ? 12 : 0)
            + ((row.keywords || '').includes(term) ? 5 : 0);
        }, 0) : 0,
        resultDate: row.updated_at || row.created_at,
      }));
      const combined = [...articleResults, ...headlineResults]
        .filter((item) => !type || type === 'all' || item.resultType === 'article' || type === 'خبر' || type === 'عاجل')
        .sort((first, second) => {
          if (sort !== 'date' && second.relevance_score !== first.relevance_score) {
            return second.relevance_score - first.relevance_score;
          }
          return String(second.resultDate).localeCompare(String(first.resultDate));
        });
      const pagedResults = combined.slice(offset, offset + safeLimit);

      return res.json({
        success: true,
        query: q,
        page: safePage,
        limit: safeLimit,
        total: combined.length,
        pages: Math.ceil(combined.length / safeLimit),
        articles: pagedResults,
      });
    });
  });
});

app.post('/api/articles', requireAdmin, (req, res) => {
  const article = req.body || {};
  const {
    title,
    summary,
    content,
    type,
    category,
    region,
    keywords,
    image_url,
    author,
    status,
    date,
  } = article;

  if (!title || !summary || !content || !category || !region || !type) {
    return sendError(res, 400, 'Title, summary, content, type, category, and region are required.');
  }

  db.run(
    `INSERT INTO articles
      (title, summary, content, type, category, region, keywords, image_url, author, status, date, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(title).trim(),
      String(summary).trim(),
      String(content).trim(),
      String(type).trim(),
      String(category).trim(),
      String(region).trim(),
      JSON.stringify(Array.isArray(keywords) ? keywords : []),
      image_url || '',
      author || 'إدارة التحرير',
      status || 'Published',
      date || new Date().toISOString().slice(0, 10),
      new Date().toISOString(),
    ],
    function onInsert(err) {
      if (err) return sendError(res, 500, 'فشل حفظ المقال في قاعدة البيانات.');

      return res.status(201).json({
        success: true,
        message: 'تم حفظ المقال بنجاح.',
        articleId: this.lastID,
      });
    }
  );
});

app.put('/api/articles/:id', requireAdmin, (req, res) => {
  const articleId = Number(req.params.id);
  const article = req.body || {};
  const {
    title, summary, content, type, category, region, keywords, image_url, author, status, date,
  } = article;

  if (!Number.isInteger(articleId) || articleId < 1) return sendError(res, 400, 'معرف المقال غير صالح.');
  if (!title || !summary || !content || !type || !category || !region) {
    return sendError(res, 400, 'العنوان والملخص والمحتوى والنوع والقسم والمنطقة مطلوبة.');
  }

  db.run(
    `UPDATE articles SET title = ?, summary = ?, content = ?, type = ?, category = ?, region = ?,
      keywords = ?, image_url = ?, author = ?, status = ?, date = ? WHERE id = ?`,
    [
      String(title).trim(),
      String(summary).trim(),
      String(content).trim(),
      String(type).trim(),
      String(category).trim(),
      String(region).trim(),
      JSON.stringify(Array.isArray(keywords) ? keywords : []),
      image_url || '',
      author || 'إدارة التحرير',
      status || 'Published',
      date || new Date().toISOString().slice(0, 10),
      articleId,
    ],
    function onUpdate(err) {
      if (err) return sendError(res, 500, 'تعذر تعديل المقال في SQLite.');
      if (this.changes === 0) return sendError(res, 404, 'المقال غير موجود.');
      return res.json({ success: true, message: 'تم تعديل المقال بنجاح.' });
    }
  );
});

app.delete('/api/articles/:id', requireAdmin, (req, res) => {
  const articleId = Number(req.params.id);

  if (!Number.isInteger(articleId) || articleId < 1) {
    return sendError(res, 400, 'معرف المقال غير صالح.');
  }

  db.run('DELETE FROM articles WHERE id = ?', [articleId], function onDelete(err) {
    if (err) return sendError(res, 500, 'تعذر حذف المقال من SQLite.');
    if (this.changes === 0) return sendError(res, 404, 'المقال غير موجود.');

    return res.json({ success: true, message: 'تم حذف المقال بنجاح.' });
  });
});

app.post('/api/articles/import', requireAdmin, (req, res) => {
  const importedArticles = Array.isArray(req.body) ? req.body : req.body.articles;

  if (!Array.isArray(importedArticles) || importedArticles.length === 0) {
    return sendError(res, 400, 'JSON must contain a non-empty articles array.');
  }

  const invalidArticle = importedArticles.find((article) => {
    return !article.title || !article.summary || !article.content || !article.type
      || !article.category || !article.region;
  });

  if (invalidArticle) {
    return sendError(res, 400, 'كل مقال مستورد يجب أن يحتوي على عنوان وملخص ومحتوى ونوع وقسم ومنطقة.');
  }

  importArticlesIntoDatabase(importedArticles, false, (err) => {
    if (err) return sendError(res, 500, 'فشل استيراد المقالات إلى قاعدة البيانات.');

    return res.status(201).json({
      success: true,
      message: `تم استيراد ${importedArticles.length} مقالاً بنجاح.`,
      imported: importedArticles.length,
    });
  });
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = readConfigList('categories.json', DEFAULT_CATEGORIES);
    return res.json({ success: true, categories });
  } catch (error) {
    return sendError(res, 500, 'فشل قراءة ملف الأقسام.');
  }
});

app.post('/api/categories', requireAdmin, (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return sendError(res, 400, 'اسم القسم مطلوب.');
  }

  const categories = readConfigList('categories.json', DEFAULT_CATEGORIES);
  const cleanName = String(name).trim();

  if (categories.includes(cleanName)) {
    return sendError(res, 409, 'هذا القسم موجود بالفعل.');
  }

  categories.push(cleanName);
  writeJsonFile('categories.json', categories);
  return res.status(201).json({ success: true, categories });
});

app.get('/api/regions', (req, res) => {
  try {
    const regions = readConfigList('regions.json', DEFAULT_REGIONS);
    return res.json({ success: true, regions });
  } catch (error) {
    return sendError(res, 500, 'فشل قراءة ملف المناطق.');
  }
});

app.post('/api/regions', requireAdmin, (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return sendError(res, 400, 'اسم المنطقة مطلوب.');
  }

  const regions = readConfigList('regions.json', DEFAULT_REGIONS);
  const cleanName = String(name).trim();

  if (regions.includes(cleanName)) {
    return sendError(res, 409, 'هذه المنطقة موجودة بالفعل.');
  }

  regions.push(cleanName);
  writeJsonFile('regions.json', regions);
  return res.status(201).json({ success: true, regions });
});

app.use('/api', (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'ملف JSON غير صالح. تحقق من علامات الاقتباس والفواصل.');
  }

  return next(err);
});

app.use('/api', (req, res) => {
  return sendError(res, 404, 'مسار API غير موجود. أعد تشغيل الخادم الحالي.');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'news-home.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'news-home.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/editor-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'editor-dashboard.html'));
});

app.get('/writer-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'writer-dashboard.html'));
});

app.post('/api/staff-register', async (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    return sendError(res, 400, 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة.');
  }

  if (!['admin', 'editor', 'writer'].includes(role)) {
    return sendError(res, 400, 'الدور الوظيفي غير صالح.');
  }

  if (password.length < 6) {
    return sendError(res, 400, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(String(email).trim())) {
    return sendError(res, 400, 'يرجى إدخال عنوان بريد إلكتروني صالح.');
  }

  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  db.get('SELECT COUNT(*) AS total FROM users', (countErr, row) => {
    if (countErr) return sendError(res, 500, 'خطأ في قاعدة البيانات أثناء إنشاء الحساب.');
    
    // Only the first user can be admin without invitation
    if (role === 'admin' && Number(row.total) > 0) {
      return sendError(res, 403, 'يجب استخدام رمز دعوة المدير لإنشاء حساب مدير جديد.');
    }
    
    db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [trimmedName, trimmedEmail, passwordHash, role],
      function insertUser(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return sendError(res, 409, 'هذا البريد الإلكتروني مسجل بالفعل.');
          }
          return sendError(res, 500, 'خطأ في قاعدة البيانات أثناء إنشاء الحساب.');
        }

        return res.status(201).json({
          success: true,
          message: 'تم تسجيل المستخدم بنجاح.',
          user: {
            id: this.lastID,
            name: trimmedName,
            email: trimmedEmail,
            role,
          },
        });
      }
    );
  });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  if (req.path === '/login' || req.path === '/index.html' || req.path === '/index') {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }

  if (req.path === '/signup' || req.path === '/signup.html') {
    return res.sendFile(path.join(__dirname, 'signup.html'));
  }

  res.sendFile(path.join(__dirname, 'news-home.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
