import { Book } from '../models/book';

export interface BookDAO {
    getBook(isbn: number): Promise<Book | null>;
    getAllBooks(): Promise<Book[] | null>;
}
