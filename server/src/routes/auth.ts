import { Router } from 'express';
import { UserModel } from '../models/User';
import { authMiddleware, signToken } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = UserModel.findByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const user = UserModel.create(username, password, 'contributor');
  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  res.status(201).json({ user, token });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = UserModel.findByUsername(username);
  if (!user || !UserModel.verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { password_hash, ...publicUser } = user;
  const token = signToken({ userId: user.id, username: user.username, role: user.role });
  res.json({ user: publicUser, token });
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  const user = UserModel.findById(req.user!.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

export default router;
