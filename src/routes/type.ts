import { Request } from 'express';

export interface Post {
    id: number;
    title: string;
    author: string;
    content: string;
    createdAt: string;
    parentId?: number;
}

export interface User {
    id: number;
    username: string;
    password: string;
    role: string; // 'admin' or 'user'
}

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: string; // 'admin' or 'user'
    };
}

export interface middleware_user {
    id: number;
    username: string;
    role: string;
}

