import { GenreDbDAO } from '../DAO/dbDAO/genre.js';
import { Genre } from '../models/genre.js';

export class GenreService {
    private genreDbDAO: GenreDbDAO;

    constructor(db: any) {
        this.genreDbDAO = new GenreDbDAO(db);
    }

    async getGenre(id: number): Promise<Genre | null> {
        return this.genreDbDAO.getGenre(id);
    }

    async getAllGenres(): Promise<Genre[] | null> {
        return this.genreDbDAO.getAllGenres();
    }

    async createGenre(genreData: Partial<Genre>): Promise<Genre | null> {
        return this.genreDbDAO.createGenre(genreData);
    }

    async updateGenre(id: number, genreData: Partial<Genre>): Promise<Genre | null> {
        return this.genreDbDAO.updateGenre(id, genreData);
    }

    async deleteGenre(id: number): Promise<void> {
        return this.genreDbDAO.deleteGenre(id);
    }
} 