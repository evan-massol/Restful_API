import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '../database/database.db');

export async function initDB() {
    const dbExists = existsSync(DB_PATH);

    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database,
    });


    await db.exec('PRAGMA foreign_keys = ON;');

    if (!dbExists) {
        console.log('Database does not exist, creating tables and seeding data...');
        await createTables(db);
        await seedDatabase(db);
        console.log('Database initialized successfully!');
    } 
    else 
        console.log('Database already exists, skipping initialization.');

    return db;
}

async function createTables(db: Database) {

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Author (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(40) NOT NULL,
            birthdate DATETIME
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Genre (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Book (
            isbn INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(40) NOT NULL,
            author INTEGER,
            genre INTEGER,
            published_year INTEGER NOT NULL,
            FOREIGN KEY (author) REFERENCES Author(id) ON DELETE SET NULL,
            FOREIGN KEY (genre) REFERENCES Genre(id) ON DELETE SET NULL
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        );
    `);
}

async function seedDatabase(db: Database) {
    try {
        const hasData = await db.get('SELECT COUNT(*) as count FROM Author');
        if (hasData.count > 0) {
            console.log('Data already exists, skipping seeding.');
            return;
        }

        console.log('Seeding initial data...');
        
        // Seed authors
        await db.exec(`
            INSERT INTO Author (id, name, birthdate) VALUES
            (1, 'J.K. Rowling', '1965-07-31'),
            (2, 'George R.R. Martin', '1948-09-20'),
            (3, 'J.R.R. Tolkien', '1892-09-03')
        `);

        // Seed genres
        await db.exec(`
            INSERT INTO Genre (id, name) VALUES
            (1, 'Fantasy'),
            (2, 'Science Fiction'),
            (3, 'Mystery'),
            (4, 'Non-Fiction')
        `);

        // Seed books
        await db.exec(`
            INSERT INTO Book (isbn, title, author, genre, published_year) VALUES
            (1, "Harry Potter and the Philosopher's Stone", 1, 1, 1997),
            (2, 'Game of Thrones', 2, 1, 1996),
            (3, 'The Hobbit', 3, 1, 1937),
            (4, 'Dune', 2, 2, 1965)
        `);

        console.log('Initial data seeded successfully!');
    } 
    catch (error) {
        console.error('Error in seedDatabase:', error);
        throw error;
    }
}
