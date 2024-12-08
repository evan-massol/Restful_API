import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initDB() {
  const db = await open({
    filename: join(__dirname, '../database/database.db'),
    driver: sqlite3.Database,
  });

  await clearDatabase(db); //Clear the database
  await createTables(db);  //Create the tables if they don't exist already

  await seedDatabase(db);  //Fill the database with data

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
        author INTEGER NOT NULL,
        genre INTEGER NOT NULL,
        published_year INTEGER NOT NULL,
        FOREIGN KEY (author) REFERENCES Author(id),
        FOREIGN KEY (genre) REFERENCES Genre(id)
    );
  `);
}

async function seedDatabase(db: Database) {
  try {
    // Seed authors
    await db.exec(`
      INSERT OR REPLACE INTO Author (id, name, birthdate) VALUES
      (1, 'J.K. Rowling', '1965-07-31'),
      (2, 'George R.R. Martin', '1948-09-20'),
      (3, 'J.R.R. Tolkien', '1892-09-03')
    `);

    // Seed genres
    await db.exec(`
      INSERT OR REPLACE INTO Genre (id, name) VALUES
      (1, 'Fantasy'),
      (2, 'Science Fiction'),
      (3, 'Mystery'),
      (4, 'Non-Fiction')
    `);

    // Seed books
    await db.exec(`
      INSERT OR REPLACE INTO Book (isbn, title, author, genre, published_year) VALUES
      (1, "Harry Potter and the Philosopher's Stone", 1, 1, 1997),
      (2, 'Game of Thrones', 2, 1, 1996),
      (3, 'The Hobbit', 3, 1, 1937),
      (4, 'Dune', 2, 2, 1965)
    `);
  } 
  catch (error) {
    console.error('Error in seedDatabase:', error);
    throw error;
  }
}

async function clearDatabase(db: Database) {
    try {
        await db.exec(`
			DROP TABLE IF EXISTS Author;
			DROP TABLE IF EXISTS Genre;
			DROP TABLE IF EXISTS Book;
        `);
    } 
    catch (error) {
        console.error('Error clearing the database:', error);
        throw error;
    }
}

