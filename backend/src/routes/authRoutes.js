import express from 'express';
import {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile,
  refreshToken,
  logout,
  deleteAccount
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  googleAuthValidation,
  profileUpdateValidation
} from '../validators/index.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/google', googleAuthValidation, googleAuth);
router.post('/refresh', refreshToken);

router.get('/me', protect, getMe);
router.put('/profile', protect, profileUpdateValidation, updateProfile);
router.post('/logout', protect, logout);
router.delete('/account', protect, deleteAccount);

export default router;
