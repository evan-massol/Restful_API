import { Author } from './author';
import { Genre } from './genre';

export interface Book {
    isbn: number;
    title: string;
    author: Author;
    genre: Genre;
    published_year: number;
};