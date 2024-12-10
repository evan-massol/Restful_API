import { Genre } from '../models/genre';

export interface GenreDAO {
    getGenre(id: number): Promise<Genre | null>;
    getAllGenres(): Promise<Genre[] | null>;
}
