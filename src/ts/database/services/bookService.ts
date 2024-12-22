import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { BookDbDAO } from '../DAO/dbDAO/book.js';
import { Book } from '../models/book.js';

export class BookService {
    private bookDbDAO: BookDbDAO;

    constructor(db: Database<sqlite3.Database>) {
        this.bookDbDAO = new BookDbDAO(db);
    }

    async getBook(id: number): Promise<Book | null> {
        return this.bookDbDAO.getBook(id);
    }

    async getAllBooks(): Promise<Book[] | null> {
        return this.bookDbDAO.getAllBooks();
    }

    async createBook(bookData: Partial<Book>): Promise<Book | null> {
        return this.bookDbDAO.createBook(bookData);
    }

    async updateBook(id: number, bookData: Partial<Book>): Promise<Book | null> {
        return this.bookDbDAO.updateBook(id, bookData);
    }

    async deleteBook(id: number): Promise<void> {
        return this.bookDbDAO.deleteBook(id);
    }
} 