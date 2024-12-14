import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Genre } from '../models/genre.js';
import { GenreDAO } from '../DAO/genreDAO.js';

export class GenreController implements GenreDAO {
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

    async updateGenre(id: number, genre: Partial<Genre>): Promise<Genre | null> {
        try {
            if (genre.name) {
                await this.db.run(
                    'UPDATE Genre SET name = ? WHERE id = ?',
                    [genre.name, id]
                );
            }
            return this.getGenre(id);
        } 
        catch (error) {
            console.error('Error in updateGenre:', error);
            throw error;
        }
    }

    async deleteGenre(id: number): Promise<void> {
        try {
            await this.db.run('DELETE FROM Genre WHERE id = ?', [id]);
        } 
        catch (error) {
            console.error('Error in deleteGenre:', error);
            throw error;
        }
    }
}