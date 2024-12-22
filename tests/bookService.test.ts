import { BookService } from '../src/ts/database/services/bookService';
import { GenreService } from '../src/ts/database/services/genreService';
import { AuthorService } from '../src/ts/database/services/authorService';
import { initDB } from '../src/ts/database/database';

jest.mock('../src/ts/database/database', () => ({
    initDB: jest.fn()
}));

describe('BookService', () => {
    let bookService: BookService;
    let genreService: GenreService;
    let authorService: AuthorService;
    let dbMock: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        dbMock = {
            run: jest.fn(),
            get: jest.fn(),
            exec: jest.fn()
        };

        (initDB as jest.Mock).mockResolvedValue(dbMock);
        bookService = new BookService(await initDB());
        genreService = new GenreService(await initDB());
        authorService = new AuthorService(await initDB());
    });

    it('should create a book', async () => {
        dbMock.run.mockResolvedValueOnce({ lastID: 1 }); 
        dbMock.get.mockResolvedValueOnce({
            id: 1,
            name: 'Author Name',
            birthdate: '1990-01-01',
        });
    
        const auth = await authorService.createAuthor({
            name: 'Author Name',
            birthdate: '1990-01-01',
        });
    
        expect(dbMock.run).toHaveBeenCalledWith(
            'INSERT INTO Author (name, birthdate) VALUES (?, ?)',
            ['Author Name', '1990-01-01']
        );
    
        dbMock.run.mockResolvedValueOnce({ lastID: 1 });
        dbMock.get.mockResolvedValueOnce({
            id: 2,
            name: 'Genre Name',
        });
    
        const genre = await genreService.createGenre({
            name: 'Genre Name',
        });
    
        expect(dbMock.run).toHaveBeenCalledWith(
            'INSERT INTO Genre (name) VALUES (?)',
            ['Genre Name']
        );
    
        // Mock pour insérer un livre
        dbMock.run.mockResolvedValueOnce({ lastID: 1 }); // Appel pour le livre
        dbMock.get.mockResolvedValueOnce({
            isbn: 3,
            title: 'New Book Title',
            author: auth,
            genre: genre,
            published_year: 2021,
        });
    
        const result = await bookService.createBook({
            title: 'New Book Title',
            author: { id: 1, name: 'Author Name', birthdate: '1990-01-01' },
            genre: { id: 2, name: 'Genre Name' },
            published_year: 2021,
        });
    
        expect(dbMock.run).toHaveBeenCalledWith(
            'INSERT INTO Book (title, author, genre, published_year) VALUES (?, ?, ?, ?)',
            ['New Book Title', 1, 2, 2021]
        );
    
        expect(result).toEqual({
            isbn: 3,
            title: 'New Book Title',
            author: auth,
            genre: genre,
            published_year: 2021,
        });
    });
    

    it('should get a book by ISBN', async () => {
        dbMock.get.mockResolvedValue({
            isbn: 1,
            title: 'New Book Title',
            author: 'Author Name',
            genre: 'Genre Name',
            published_year: 2021
        });

        const result = await bookService.getBook(1);

        expect(dbMock.get).toHaveBeenCalledWith(`
                SELECT 
                    b.isbn, 
                    b.title, 
                    a.name AS author, 
                    g.name AS genre, 
                    b.published_year 
                FROM 
                    Book b
                LEFT JOIN 
                    Author a ON b.author = a.id
                LEFT JOIN 
                    Genre g ON b.genre = g.id
                WHERE 
                    b.isbn = ?`,
            [1]
        );

        expect(result).toEqual({
            isbn: 1,
            title: 'New Book Title',
            author: 'Author Name',
            genre: 'Genre Name',
            published_year: 2021
        });
    });

    it('should update a book', async () => {
        dbMock.get.mockResolvedValue({
            isbn: 1,
            title: 'Old Book Title',
            author: 'Old Author',
            genre: 'Old Genre',
            published_year: 2020
        });

        dbMock.run.mockResolvedValue({ changes: 1 });

        dbMock.get.mockResolvedValue({
            isbn: 1,
            title: 'Updated Book Title',
            author: 'Updated Author',
            genre: 'Updated Genre',
            published_year: 2021
        });

        const result = await bookService.updateBook(1, {
            title: 'Updated Book Title',
            author: { id: 1, name: 'Updated Author', birthdate: '1993-08-09' },
            genre: { id: 1, name: 'Updated Genre' },
            published_year: 2021
        });

        expect(dbMock.run).toHaveBeenCalledWith(
            'UPDATE Book SET title = ?, author = ?, genre = ?, published_year = ? WHERE isbn = ?',
            ['Updated Book Title', 1, 1, 2021, 1]
        );

        expect(result).toEqual({
            isbn: 1,
            title: 'Updated Book Title',
            author: 'Updated Author',
            genre: 'Updated Genre',
            published_year: 2021
        });
    });

    it('should delete a book', async () => {
        dbMock.get.mockResolvedValue({
            isbn: 1,
            title: 'Book to Delete',
            author: 'Author Name',
            genre: 'Genre Name',
            published_year: 2021
        });

        dbMock.run.mockResolvedValue({ changes: 1 });

        await bookService.deleteBook(1);

        expect(dbMock.run).toHaveBeenCalledWith(
            'DELETE FROM Book WHERE isbn = ?',
            [1]
        );
    });
}); 