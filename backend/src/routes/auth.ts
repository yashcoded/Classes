import { Router, type Router as ExpressRouter } from 'express';
import { register, login, me, googleAuth } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router: ExpressRouter = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', authenticate, me);

export default router;
