import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest,middleware_user } from './type';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: '認証が必要です' });
        return;
    }

    try {
        const user = jwt.verify(token, JWT_SECRET) as middleware_user;
        req.user = user;
        console.log(token);
        next();
    } catch (error) {
        res.status(403).json({ error: 'トークンが無効です' });
        return;
    }
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: '管理者権限が必要です' });
    }
}