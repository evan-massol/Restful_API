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
}