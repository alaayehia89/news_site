import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validator.middleware';
import { authValidation } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Register
router.post(
  '/register',
  validate(authValidation.register),
  async (req, res, next) => {
    try {
      const result = await authController.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  validate(authValidation.login),
  async (req, res, next) => {
    try {
      const result = await authController.login(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Logout
router.post(
  '/logout',
  async (req, res, next) => {
    try {
      await authController.logout(req.user);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token
router.post(
  '/refresh',
  async (req, res, next) => {
    try {
      const result = await authController.refreshToken(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Forgot password
router.post(
  '/forgot-password',
  validate(authValidation.forgotPassword),
  async (req, res, next) => {
    try {
      await authController.forgotPassword(req.body.email);
      res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
      next(error);
    }
  }
);

// Reset password
router.post(
  '/reset-password',
  validate(authValidation.resetPassword),
  async (req, res, next) => {
    try {
      await authController.resetPassword(req.body.token, req.body.password);
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user
router.get(
  '/me',
  async (req, res, next) => {
    try {
      const user = await authController.getCurrentUser(req.user);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

// Update profile
router.put(
  '/profile',
  validate(authValidation.updateProfile),
  async (req, res, next) => {
    try {
      const user = await authController.updateProfile(req.user, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

// Change password
router.put(
  '/change-password',
  validate(authValidation.changePassword),
  async (req, res, next) => {
    try {
      await authController.changePassword(req.user, req.body);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
