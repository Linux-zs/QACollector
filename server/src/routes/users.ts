import { Router } from 'express';
import { UserModel } from '../models/User';
import { authMiddleware, roleGuard } from '../middleware/auth';

const router = Router();

// All routes require admin
router.use(authMiddleware, roleGuard('admin'));

// List all users
router.get('/', (req, res) => {
  res.json(UserModel.findAll());
});

// Update user role
router.patch('/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['admin', 'contributor', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const updated = UserModel.updateRole(Number(req.params.id), role);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(UserModel.findById(Number(req.params.id)));
});

// Delete user
router.delete('/:id', (req, res) => {
  if (Number(req.params.id) === req.user!.userId) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  const deleted = UserModel.delete(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true });
});

export default router;
