import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const articleController = new ArticleController();

// Public routes - Get articles
router.get('/', async (req, res, next) => {
  try {
    const articles = await articleController.getArticles(req.query);
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
});

router.get('/breaking', async (req, res, next) => {
  try {
    const breakingNews = await articleController.getBreakingNews();
    res.json({ success: true, data: breakingNews });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const article = await articleController.getArticleBySlug(req.params.slug);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
});

// Protected routes - Create, Update, Delete articles
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR_IN_CHIEF, Role.SENIOR_EDITOR, Role.EDITOR, Role.JOURNALIST),
  async (req, res, next) => {
    try {
      const article = await articleController.createArticle(req.body, req.user);
      res.status(201).json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR_IN_CHIEF, Role.SENIOR_EDITOR, Role.EDITOR),
  async (req, res, next) => {
    try {
      const article = await articleController.updateArticle(req.params.id, req.body, req.user);
      res.json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR_IN_CHIEF),
  async (req, res, next) => {
    try {
      await articleController.deleteArticle(req.params.id, req.user);
      res.json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Publish article
router.post(
  '/:id/publish',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR_IN_CHIEF, Role.SENIOR_EDITOR, Role.EDITOR),
  async (req, res, next) => {
    try {
      const article = await articleController.publishArticle(req.params.id, req.user);
      res.json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  }
);

// Schedule article
router.post(
  '/:id/schedule',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR_IN_CHIEF, Role.SENIOR_EDITOR, Role.EDITOR),
  async (req, res, next) => {
    try {
      const article = await articleController.scheduleArticle(req.params.id, req.body.scheduledAt, req.user);
      res.json({ success: true, data: article });
    } catch (error) {
      next(error);
    }
  }
);

// Import articles from JSON
router.post(
  '/import',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR_IN_CHIEF),
  async (req, res, next) => {
    try {
      const result = await articleController.importFromJSON(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Get article statistics
router.get(
  '/stats/analytics',
  authenticate,
  authorize(Role.ADMIN, Role.EDITOR_IN_CHIEF, Role.SENIOR_EDITOR),
  async (req, res, next) => {
    try {
      const stats = await articleController.getAnalytics(req.query);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
