import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Author } from "../models/author";
import { format } from 'date-fns';

export class AuthorDao {
    private db: Database<sqlite3.Database>;

    constructor(db: Database<sqlite3.Database>) {
        this.db = db;
    }

    async getAuthor(idAuthor: number): Promise<Author | null> {
        try {
            const result = await this.db.get('SELECT * FROM Author WHERE id = ?', [idAuthor]);
            if (result) 
                result.birthdate = format(new Date(result.birthdate), 'dd MMMM yyyy');
            return result || null;
        } 
        catch (error) {
            console.error('Error in getAuthor:', error);
            throw error;
        }
    }

    async getAllAuthors(): Promise<Author[] | null> {
        try {
            const result = await this.db.all('SELECT * FROM Author');
            if (result) {
                result.forEach(author => {
                    author.birthdate = format(new Date(author.birthdate), 'dd MMMM yyyy');
                });
            }
            return result || null;
        } 
        catch (error) {
            console.error('Error in getAllAuthors:', error);
            throw error;
        }
    }
}