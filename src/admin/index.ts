import express from 'express';
import { RequestHandler } from 'express';
import { openDB_User } from '../db';
import { authenticateToken,isAdmin } from '../routes/middleware';

const router = express.Router();

router.put('/users/:userId/role', authenticateToken, isAdmin, (async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || (role !== 'user' && role !== 'admin')) {
            return res.status(400).json({ error: '無効なロールです' });
        }

        const db = await openDB_User();
        const user = await db.get('SELECT * FROM users WHERE id = ?', userId);

        if (!user) {
            return res.status(404).json({ error: 'ユーザーが見つかりません' });
        }

        await db.run('UPDATE users SET role = ? WHERE id = ?', role, userId);
        res.status(200).json({ message: 'ユーザーのロールが更新されました' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'サーバーエラー' });
    }
}) as RequestHandler);

router.get('/users', authenticateToken, isAdmin, (async (req, res) => {
    try {
        const db = await openDB_User();
        const users = await db.all('SELECT id, username, role FROM users');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'サーバーエラー' });
    }
}))

export default router;