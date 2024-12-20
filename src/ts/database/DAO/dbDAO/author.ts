import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Author } from "../../models/author";
import { format } from 'date-fns';
import { AuthorDAO } from '../authorDAO';

export class AuthorDbDAO implements AuthorDAO {
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

    async createAuthor(authorData: Partial<Author>): Promise<Author | null> {
        try {
            const result = await this.db.run(
                'INSERT INTO Author (name, birthdate) VALUES (?, ?)',
                [authorData.name, authorData.birthdate]
            );
            
            if (result.lastID) 
                return this.getAuthor(result.lastID);
            return null;
        } 
        catch (error) {
            console.error('Error in createAuthor:', error);
            throw error;
        }
    }

    async updateAuthor(id: number, authorData: Partial<Author>): Promise<Author | null> {
        try {
            const updates: string[] = [];
            const params: any[] = [];

            (Object.keys(authorData) as Array<keyof Partial<Author>>).forEach(key => {
                if (authorData[key] !== undefined || authorData[key] !== null) {
                    updates.push(`${key} = ?`);
                    params.push(authorData[key]);
                }
            });

            params.push(id);

            await this.db.run(
                `UPDATE Author 
                SET ${updates.join(', ')}
                WHERE id = ?`,
                params
            );

            return this.getAuthor(id);
        } 
        catch (error) {
            console.error('Error in updateAuthor:', error);
            throw error;
        }
    }

    async deleteAuthor(id: number): Promise<void> {
        try {
            const author = await this.db.get('SELECT * FROM Author WHERE id = ?', [id]);
            if(!author)
                throw new Error('Author not found.');

            await this.db.run('UPDATE Book SET author = NULL WHERE author = ?', [id]);

            await this.db.run('DELETE FROM Author WHERE id = ?', [id]);
        } 
        catch (error) {
            console.error('Error in deleteAuthor:', error);
            throw error;
        }
    }
}