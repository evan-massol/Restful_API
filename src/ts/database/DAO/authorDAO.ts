import { Author } from '../models/author';

export interface AuthorDAO {
    getAuthor(id: number): Promise<Author | null>;
    getAllAuthors(): Promise<Author[] | null>;
} 