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
}