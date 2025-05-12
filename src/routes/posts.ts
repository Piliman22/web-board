import express, { RequestHandler } from 'express';
import { Post } from './type';
import { openDB_Post } from '../db';

const router = express.Router();

router.get('/threads', (async (req, res) => {
    try {
        const db = await openDB_Post();
        const threads = await db.all(
            'SELECT * FROM posts WHERE parentId IS NULL ORDER BY createdAt DESC'
        );
        res.json(threads);
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).json({ error: 'スレッドの取得に失敗しました' });
    }
}) as RequestHandler);

router.get('/threads/:threadId', (async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId, 10);
        const db = await openDB_Post();
        
        const thread = await db.get('SELECT * FROM posts WHERE id = ?', threadId);
        if (!thread) {
            return res.status(404).json({ error: 'スレッドが見つかりません' });
        }
        
        const responses = await db.all(
            'SELECT * FROM posts WHERE parentId = ? ORDER BY createdAt ASC',
            threadId
        );
        
        res.json({
            thread,
            responses
        });
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ error: 'スレッドの取得に失敗しました' });
    }
}) as RequestHandler);

router.post('/threads', (async (req, res) => {
    try {
        const { title, author, content } = req.body;
        
        if (!title || !author || !content) {
            return res.status(400).json({ error: 'タイトル、著者名、内容は必須です' });
        }

        const db = await openDB_Post();
        const createdAt = new Date().toISOString();
        
        const result = await db.run(
            'INSERT INTO posts (title, author, content, createdAt) VALUES (?, ?, ?, ?)',
            title,
            author,
            content,
            createdAt
        );

        const newThread = await db.get('SELECT * FROM posts WHERE id = ?', result.lastID);
        res.status(201).json(newThread);
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: 'スレッドの作成に失敗しました' });
    }
}) as RequestHandler);

router.post('/threads/:threadId/responses', (async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId, 10);
        const { author, content } = req.body;
        
        if (!author || !content) {
            return res.status(400).json({ error: '著者名と内容は必須です' });
        }

        const db = await openDB_Post();
        
        const thread = await db.get('SELECT * FROM posts WHERE id = ?', threadId);
        if (!thread) {
            return res.status(404).json({ error: 'スレッドが見つかりません' });
        }

        const createdAt = new Date().toISOString();
        
        const result = await db.run(
            `INSERT INTO posts (title, author, content, createdAt, parentId) 
             VALUES (?, ?, ?, ?, ?)`,
            [null, author, content, createdAt, threadId]  
        );

        const newResponse = await db.get('SELECT * FROM posts WHERE id = ?', result.lastID);
        res.status(201).json(newResponse);
    } catch (error) {
        console.error('Error creating response:', error);
        res.status(500).json({ error: 'レスポンスの作成に失敗しました' });
    }
}) as RequestHandler);

router.delete('/threads/:threadId', (async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId, 10);
        const db = await openDB_Post();
        
        const thread = await db.get('SELECT * FROM posts WHERE id = ?', threadId);
        if (!thread) {
            return res.status(404).json({ error: 'スレッドが見つかりません' });
        }

        await db.run('DELETE FROM posts WHERE id = ? OR parentId = ?', threadId, threadId);
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ error: 'スレッドの削除に失敗しました' });
    }
}) as RequestHandler);

router.put('/threads/:threadId', (async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId, 10);
        const { content, author } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: '内容は必須です' });
        }

        const db = await openDB_Post();
        
        const post = await db.get('SELECT * FROM posts WHERE id = ?', threadId);
        if (!post) {
            return res.status(404).json({ error: '投稿が見つかりません' });
        }

        // console.log('Author check:', {
        //     requestAuthor: author,
        //     postAuthor: post.author
        // });

        if (post.author !== author) {
            return res.status(403).json({ error: '投稿者本人のみが編集できます' });
        }

        await db.run(
            'UPDATE posts SET content = ? WHERE id = ?',
            [content, threadId]
        );

        const updatedPost = await db.get('SELECT * FROM posts WHERE id = ?', threadId);
        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: '投稿の更新に失敗しました' });
    }   
}) as RequestHandler);

router.get('/threads/search/:title', (async (req, res) => {
    try {
        const searchQuery = req.params.title;
        const db = await openDB_Post();
        
        const threads = await db.all(
            `SELECT * FROM posts 
             WHERE (title LIKE ? OR content LIKE ?) 
             AND parentId IS NULL 
             ORDER BY createdAt DESC`,
            [`%${searchQuery}%`, `%${searchQuery}%`]
        );
        
        res.json(threads);
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ error: 'スレッドの取得に失敗しました' });
    }
}) as RequestHandler);

export default router;