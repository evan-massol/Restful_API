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
            if (authorData.birthdate && !this.isValidDate(authorData.birthdate)) 
                throw new Error('Invalid birthdate format. Expected format: YYYY-MM-DD');

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
            // Vérifier que l'auteur existe
            const author = await this.getAuthor(id);
            if (!author) 
                throw new Error('Author not found.');

            const updates: string[] = [];
            const params: any[] = [];

            if (authorData.name) {
                updates.push('name = ?');
                params.push(authorData.name);
            }
            if (authorData.birthdate) {
                if (!this.isValidDate(authorData.birthdate))
                    throw new Error('Invalid birthdate format. Expected format: YYYY-MM-DD');
                updates.push('birthdate = ?');
                params.push(authorData.birthdate);
            }

            params.push(id);

            if (updates.length > 0) {
                await this.db.run(
                    `UPDATE Author SET ${updates.join(', ')} WHERE id = ?`,
                    params
                );
            }

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

    private isValidDate(dateString: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
}
