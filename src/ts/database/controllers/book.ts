import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Book } from "../models/book.js";
import { BookDAO } from '../DAO/bookDAO.js';

export class BooksController implements BookDAO {
    private db: Database<sqlite3.Database>;

    constructor(db: Database<sqlite3.Database>) {
        this.db = db;
    }
    
    async getBook(isbn: number): Promise<Book | null> {
        try {
            const book = await this.db.get(`
                SELECT 
                    b.isbn, 
                    b.title, 
                    a.name AS author, 
                    g.name AS genre, 
                    b.published_year 
                FROM 
                    Book b
                JOIN 
                    Author a ON b.author = a.id
                JOIN 
                    Genre g ON b.genre = g.id
                WHERE 
                    b.isbn = ?
            `, [isbn]);
            return book || null;
        } 
        catch (error) {
            console.error('Error in getBook:', error);
            throw error;
        }
    }

    async getAllBooks(): Promise<Book[] | null> {
        try {
            const books = await this.db.all(`
                SELECT 
                    b.isbn, 
                    b.title, 
                    a.name AS author, 
                    g.name AS genre, 
                    b.published_year 
                FROM 
                    Book b
                JOIN 
                    Author a ON b.author = a.id
                JOIN 
                    Genre g ON b.genre = g.id
            `);
            return books || null;
        } 
        catch (error) {
            console.error('Error in getAllBooks:', error);
            throw error;
        }
    }

    async createBook(bookData: Partial<Book>): Promise<Book | null> {
        try {
            let author = await this.db.get('SELECT * FROM Author WHERE LOWER(name) = ?', [bookData.author!.name.trim().toLowerCase()]);
            if (!author) {
                const result = await this.db.run('INSERT INTO Author (name) VALUES (?)', [bookData.author]);
                author = { id: result.lastID, name: bookData.author }; 
            }

            let genre = await this.db.get('SELECT * FROM Genre WHERE LOWER(name) = ?', [bookData.genre?.name.trim().toLowerCase()]);
            if (!genre) {
                const result = await this.db.run('INSERT INTO Genre (name) VALUES (?)', [bookData.genre]);
                genre = { id: result.lastID, name: bookData.genre };
            }

            const result = await this.db.run(
                'INSERT INTO Book (title, author, genre, published_year) VALUES (?, ?, ?, ?)',
                [bookData.title, author.id, genre.id, bookData.published_year]
            );

            if (result.lastID) 
                return this.getBook(result.lastID);
            return null;
        } 
        catch (error) {
            console.error('Error in createBook:', error);
            throw error;
        }
    }

    async updateBook(isbn: number, bookData: Partial<Book>): Promise<Book | null> {
        try {
            const updates: string[] = [];
            const params: any[] = [];
            
            (Object.keys(bookData) as Array<keyof Partial<Book>>).forEach(key => {
                if (bookData[key] !== undefined || bookData[key] !== null) {
                    updates.push(`${key} = ?`);
                    params.push(bookData[key]);
                }
            });

            params.push(isbn);

            await this.db.run(
                `UPDATE Book 
                SET ${updates.join(', ')}
                WHERE isbn = ?`,
                params
            );

            return this.getBook(isbn);
        } 
        catch (error) {
            console.error('Error in updateBook:', error);
            throw error;
        }
    }

    async deleteBook(isbn: number): Promise<void> {
        try {
            const book = await this.db.get('SELECT * FROM Book WHERE isbn = ?', [isbn]);
            if(!book)
                throw new Error('Book not found.');

            await this.db.run('DELETE FROM Book WHERE isbn = ?', [isbn]);
        } 
        catch (error) {
            console.error('Error in deleteBook:', error);
            throw error;
        }
    }
}