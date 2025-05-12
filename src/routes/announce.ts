import express from 'express';
import { authenticateToken, isAdmin } from './middleware';
import { openDB_announce } from '../db';
import { RequestHandler } from 'express';
import { AuthRequest } from './type';

const router = express.Router();

router.get('/announcements', (async (req, res) => {
    try {
        const db = await openDB_announce();
        const announcements = await db.all(
            'SELECT * FROM announcements ORDER BY createdAt DESC'
        );
        res.json(announcements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ error: 'お知らせの取得に失敗しました' });
    }
}) as RequestHandler);
// create announcement (only admin)
router.post('/announcements', authenticateToken, isAdmin, (async (req: AuthRequest, res) => {
    try {
        const { title, content } = req.body;
        const author = req.user!.username;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'タイトルと内容は必須です' });
        }

        const db = await openDB_announce();
        const createdAt = new Date().toISOString();
        
        const result = await db.run(
            'INSERT INTO announcements (title, content, createdAt, author) VALUES (?, ?, ?, ?)',
            [title, content, createdAt, author]
        );

        const newAnnouncement = await db.get('SELECT * FROM announcements WHERE id = ?', result.lastID);
        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ error: 'お知らせの作成に失敗しました' });
    }
}) as RequestHandler);
// delete announcement (only admin)
router.delete('/announcements/:id', authenticateToken, isAdmin, (async (req, res) => {
    try {
        const announcementId = parseInt(req.params.id, 10);
        const db = await openDB_announce();
        
        await db.run('DELETE FROM announcements WHERE id = ?', announcementId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ error: 'お知らせの削除に失敗しました' });
    }
}) as RequestHandler);

export default router;