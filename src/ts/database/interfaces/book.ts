import { Author } from './author.js';
import { Genre } from './genre.js';

export interface Book {
    isbn: number;
    title: string;
    author: Author;
    genre: Genre;
    published_year: number;
}