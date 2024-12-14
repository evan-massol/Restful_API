import { Genre } from '../models/genre';

export interface GenreDAO {
    getGenre(id: number): Promise<Genre | null>;
    getAllGenres(): Promise<Genre[] | null>;
    createGenre(genre: Partial<Genre>): Promise<Genre | null>;
    updateGenre(id: number, genre: Partial<Genre>): Promise<Genre | null>;
    deleteGenre(id: number): Promise<void>;
}
