import { Router } from 'express';
import { TermModel } from '../models/Term';
import { getDB, saveDB } from '../db';
import jwt from 'jsonwebtoken';
import { authMiddleware, roleGuard } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'qac-secret-key-change-in-production';

const router = Router();

// Search terms (public for search dropdown)
router.get('/search', (req, res) => {
  const { q, limit } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }
  const lim = Math.min(Number(limit) || 10, 50);
  const results = TermModel.search(q, lim);

  // Record search history if user is authenticated
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
      getDB().run('INSERT INTO search_history (user_id, query) VALUES (?, ?)', [payload.userId, q]);
      saveDB();
    } catch { /* ignore */ }
  }

  res.json(results);
});

// Get latest terms
router.get('/latest', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  res.json(TermModel.latest(limit));
});

// Get recent search queries for current user
router.get('/recent-searches', authMiddleware, (req, res) => {
  const db = getDB();
  const result = db.exec(
    'SELECT DISTINCT query FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
    [req.user!.userId]
  );
  if (result.length === 0) return res.json([]);
  res.json(result[0].values.map(row => row[0]));
});

// Get single term
router.get('/:id', (req, res) => {
  const term = TermModel.findById(Number(req.params.id));
  if (!term) return res.status(404).json({ error: 'Term not found' });
  res.json(term);
});

// Create term (contributor/admin)
router.post('/', authMiddleware, roleGuard('contributor', 'admin'), (req, res) => {
  const { question, answer, category, tags } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }
  const term = TermModel.create(question, answer, category || null, tags || [], req.user!.userId);
  res.status(201).json(term);
});

// Update term (creator or admin)
router.put('/:id', authMiddleware, (req, res) => {
  const termId = Number(req.params.id);
  const term = TermModel.findById(termId);
  if (!term) return res.status(404).json({ error: 'Term not found' });

  if (req.user!.role !== 'admin' && term.created_by !== req.user!.userId) {
    return res.status(403).json({ error: 'Can only edit your own terms' });
  }

  const { question, answer, category, tags } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  TermModel.update(termId, question, answer, category || null, tags || [], req.user!.userId);
  res.json(TermModel.findById(termId));
});

// Delete term (admin only)
router.delete('/:id', authMiddleware, roleGuard('admin'), (req, res) => {
  const deleted = TermModel.delete(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'Term not found' });
  res.json({ success: true });
});

export default router;
