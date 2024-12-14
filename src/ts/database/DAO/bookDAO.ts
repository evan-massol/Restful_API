import { Book } from '../models/book';

export interface BookDAO {
    getBook(isbn: number): Promise<Book | null>;
    getAllBooks(): Promise<Book[] | null>;
    createBook(book: Partial<Book>): Promise<Book | null>;
    updateBook(isbn: number, book: Partial<Book>): Promise<Book | null>;
    deleteBook(isbn: number): Promise<void>;
}
