// User管理
import express, { RequestHandler } from 'express';
import { openDB_User } from '../db';
import { User } from './type';
import jwt from 'jsonwebtoken';
import bcrypto from 'bcrypt';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const SALT_ROUNDS = 10;

// user registration
router.post('/register', (async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'ユーザーネームとパスワードが入力されていません。' });
        }



        if (role !== 'user' && role !== 'admin') {
            return res.status(400).json({ error: '無効なロールです' })
        }

        const db = await openDB_User();
        // user exists check
        const userExists = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (userExists) {
            return res.status(409).json({ error: 'そのユーザーネームはすでに使用されています' });
        }

        const hashedPassword = await bcrypto.hash(password, SALT_ROUNDS);

        // input db
        await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            username,
            hashedPassword,
            role);
        res.status(201).json({ message: 'ユーザーが作成されました' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'サーバーエラー' });
    }
}) as RequestHandler);

// user login
router.post('/login', (async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'ユーザーネームとパスワードが入力されていません。' });
        }

        const db = await openDB_User();
        const user = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (!user) {
            return res.status(401).json({ error: 'ユーザーネームかパスワードが間違っています' });
        }

        const isPasswordValid = await bcrypto.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'ユーザーネームかパスワードが間違っています' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username , role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // console.log(token);

        res.status(200).json({
            message: 'ログイン成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'サーバーエラー' });
    }
}) as RequestHandler);


export default router;