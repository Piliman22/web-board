import { Express } from 'express';
import cors from 'cors';
import express from 'express';
import postsRouter from './routes/posts';
import usersRouer from './routes/users';
import adminRouter from './admin/index';
import announceRouter from './routes/announce';
import { openDB_User, openDB_Post, openDB_announce } from './db';

export const setup = (async (app: Express) => {
    const user_db = await openDB_User();
    const post_db = await openDB_Post();
    const announce_db = await openDB_announce();
    
    app.use(cors());
    app.use(express.json());
    app.use('/posts', postsRouter);
    app.use('/users', usersRouer);
    app.use('/admin', adminRouter);
    app.use('/announce', announceRouter);

    await user_db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user'
        )
      `);
      await post_db.run(`
          CREATE TABLE IF NOT EXISTS posts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT,           
              author TEXT NOT NULL,
              content TEXT NOT NULL,
              createdAt TEXT NOT NULL,
              parentId INTEGER,
              FOREIGN KEY (parentId) REFERENCES posts(id)
          )
      `);
      await announce_db.run(`
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            author TEXT NOT NULL
        )
    `);
})
