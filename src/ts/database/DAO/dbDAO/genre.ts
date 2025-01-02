import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Genre } from '../../models/genre.js';
import { GenreDAO } from '../genreDAO.js';

export class GenreDbDAO implements GenreDAO {
    private db: Database<sqlite3.Database>;

    constructor(db: Database<sqlite3.Database>) {
        this.db = db;
    }

    async getAllGenres(): Promise<Genre[] | null> {
        try {
            const genres = await this.db.all('SELECT * FROM Genre');
            return genres || null;
        } 
        catch (error) {
            console.error('Error in getAllGenres:', error);
            throw error;
        }
    }

    async getGenre(idGenre: number): Promise<Genre | null> {
        try {
            const genre = await this.db.get('SELECT * FROM Genre WHERE id = ?', [idGenre]);
            return genre || null;
        } 
        catch (error) {
            console.error('Error in getGenre:', error);
            throw error;
        }
    }

    async createGenre(genre: Partial<Genre>): Promise<Genre | null> {
        try {
            if (!genre || !genre.name) return null;
            const existingGenre = await this.db.get(
                'SELECT * FROM Genre WHERE LOWER(name) = ?', 
                [genre.name.trim().toLowerCase()]
            );

            // If the genre already exists
            if (existingGenre !== undefined) 
                return null;

            const result = await this.db.run(
                'INSERT INTO Genre (name) VALUES (?)',
                [genre.name]
            );

            if (result.lastID) 
                return this.getGenre(result.lastID);
            
            return null;
        } 
        catch (error) {
            console.error('Error in createGenre:', error);
            throw error;
        }
    }

    async updateGenre(id: number, genreData: Partial<Genre>): Promise<Genre | null> {
        try {
            const genre = await this.getGenre(id);
            if (!genre) 
                throw new Error('Genre not found.');

            const updates: string[] = [];
            const params: any[] = [];

            if (genreData.name) {
                updates.push('name = ?');
                params.push(genreData.name);
            }

            params.push(id);

            if (updates.length > 0) 
                await this.db.run(
                    `UPDATE Genre SET ${updates.join(', ')} WHERE id = ?`,
                    params
                );

            return this.getGenre(id);
        } 
        catch (error) {
            console.error('Error in updateGenre:', error);
            throw error;
        }
    }

    async deleteGenre(id: number): Promise<void> {
        try {
            const genre = await this.db.get('SELECT * FROM Genre WHERE id = ?', [id]);
            if (!genre) 
                throw new Error('Genre not found.');

            await this.db.run('UPDATE Book SET genre = NULL WHERE genre = ?', [id]);

            await this.db.run('DELETE FROM Genre WHERE id = ?', [id]);
        } 
        catch (error) {
            console.error('Error in deleteGenre:', error);
            throw error;
        }
    }
}