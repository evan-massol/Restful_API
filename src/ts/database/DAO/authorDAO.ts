import { Author } from '../models/author';

export interface AuthorDAO {
    getAuthor(id: number): Promise<Author | null>;
    getAllAuthors(): Promise<Author[] | null>;
    createAuthor(author: Partial<Author>): Promise<Author | null>;
    updateAuthor(id: number, author: Partial<Author>): Promise<Author | null>;
    deleteAuthor(id: number): Promise<void>;
} 