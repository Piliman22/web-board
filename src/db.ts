import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDB_User = async () => {
  return open({
    filename: './user.db',
    driver: sqlite3.Database,
  });
};

const openDB_Post = async () => {
    return open({
        filename: './post.db',
        driver: sqlite3.Database,
    });
}

const openDB_announce = async () => {
    return open({
        filename: './announce.db',
        driver: sqlite3.Database,
    });
}

export {  openDB_User, openDB_Post, openDB_announce };
