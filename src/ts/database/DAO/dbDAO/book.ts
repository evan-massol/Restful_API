import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Book } from "../../models/book.js";
import { BookDAO } from '../bookDAO.js';

export class BookDbDAO implements BookDAO {
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
                LEFT JOIN 
                    Author a ON b.author = a.id
                LEFT JOIN 
                    Genre g ON b.genre = g.id
                WHERE 
                    b.isbn = ?`, [isbn]);
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
                LEFT JOIN 
                    Author a ON b.author = a.id
                LEFT JOIN 
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
            const author = await this.db.get('SELECT * FROM Author WHERE id = ?', [bookData.author?.id]);
            if (!author) 
                throw new Error(`Author with id ${bookData.author?.id} does not exist`);

            const genre = await this.db.get('SELECT * FROM Genre WHERE id = ?', [bookData.genre?.id]);
            if (!genre) 
                throw new Error(`Genre with id ${bookData.genre?.id} does not exist`);

            const result = await this.db.run(
                'INSERT INTO Book (title, author, genre, published_year) VALUES (?, ?, ?, ?)',
                [bookData.title, bookData.author?.id, bookData.genre?.id, bookData.published_year]
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
            const existingBook = await this.getBook(isbn);
            if (!existingBook) 
                throw new Error('Book not found');

            if (bookData.author?.id) {
                const author = await this.db.get('SELECT * FROM Author WHERE id = ?', [bookData.author.id]);
                if (!author) 
                    throw new Error(`Author with id ${bookData.author.id} does not exist`);
            }

            if (bookData.genre?.id) {
                const genre = await this.db.get('SELECT * FROM Genre WHERE id = ?', [bookData.genre.id]);
                if (!genre) 
                    throw new Error(`Genre with id ${bookData.genre.id} does not exist`);
            }

            const updates: string[] = [];
            const params: any[] = [];

            if (bookData.title) {
                updates.push('title = ?');
                params.push(bookData.title);
            }
            if (bookData.author?.id) {
                updates.push('author = ?');
                params.push(bookData.author.id);
            }
            if (bookData.genre?.id) {
                updates.push('genre = ?');
                params.push(bookData.genre.id);
            }
            if (bookData.published_year) {
                updates.push('published_year = ?');
                params.push(bookData.published_year);
            }

            params.push(isbn);

            if (updates.length > 0)
                await this.db.run(
                    `UPDATE Book SET ${updates.join(', ')} WHERE isbn = ?`,
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