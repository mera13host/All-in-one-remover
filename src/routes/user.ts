import { Router } from 'express';
import db from '../database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateToken, (req: any, res) => {
    try {
        const stmt = db.prepare('SELECT id, email, apiKey FROM users WHERE id = ?');
        const user = stmt.get(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
