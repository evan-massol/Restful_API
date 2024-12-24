import { BookService } from '../src/ts/database/services/bookService';
import { GenreService } from '../src/ts/database/services/genreService';
import { AuthorService } from '../src/ts/database/services/authorService';
import { initDB } from '../src/ts/database/database';

jest.mock('../src/ts/database/database', () => ({
    initDB: jest.fn()
}));

describe('BookService', () => {
    let bookService: BookService;
    let dbMock: any;

    beforeEach(async () => {
        dbMock = {
            run: jest.fn(),
            get: jest.fn(),
            all: jest.fn()
        };

        (initDB as jest.Mock).mockResolvedValue(dbMock);
        bookService = new BookService(await initDB());
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should create a book', async () => {
        dbMock.run.mockResolvedValueOnce({ lastID: 1 }); 
        dbMock.get.mockResolvedValueOnce({
            id: 1,
            name: 'Author Name',
            birthdate: '1990-01-01',
        });
    
        dbMock.run.mockResolvedValueOnce({ lastID: 2 });
        dbMock.get.mockResolvedValueOnce({
            id: 2,
            name: 'Genre Name',
        });
    
        dbMock.run.mockResolvedValueOnce({ lastID: 3 });
        dbMock.get.mockResolvedValueOnce({
            isbn: 3,
            title: 'New Book Title',
            author: { id: 1, name: 'Author Name', birthdate: '1990-01-01' },
            genre: { id: 2, name: 'Genre Name' },
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
            author: { id: 1, name: 'Author Name', birthdate: '1990-01-01' },
            genre: { id: 2, name: 'Genre Name' },
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
            author: { id: 1, name: 'Updated Author', birthdate: '1990-01-01' },
            genre: { id: 1, name: 'Updated Genre' },
            published_year: 2021,
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

    it('should return null when getting a non-existent book', async () => {
        dbMock.get.mockResolvedValue(null);

        const result = await bookService.getBook(999);

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
            [999]
        );
        expect(result).toBeNull();
    });

    it('should get all books', async () => {
        const mockBooks = [
            {
                isbn: 1,
                title: 'Book 1',
                author: 'Author 1',
                genre: 'Genre 1',
                published_year: 2021
            },
            {
                isbn: 2,
                title: 'Book 2',
                author: 'Author 2',
                genre: 'Genre 2',
                published_year: 2022
            }
        ];

        dbMock.all.mockResolvedValue(mockBooks);

        const result = await bookService.getAllBooks();

        expect(dbMock.all).toHaveBeenCalledWith(`
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
            `);
        expect(result).toEqual(mockBooks);
    });

    it('should fail to create a book with non-existent author', async () => {
        dbMock.get.mockResolvedValueOnce(null);

        await expect(bookService.createBook({
            title: 'New Book Title',
            author: { id: 999, name: 'Non-existent Author', birthdate: '1990-01-01' },
            genre: { id: 1, name: 'Genre Name' },
            published_year: 2021,
        })).rejects.toThrow('Author with id 999 does not exist');
    });

    it('should fail to create a book with non-existent genre', async () => {
        dbMock.get.mockResolvedValueOnce({
            id: 1,
            name: 'Author Name',
            birthdate: '1990-01-01',
        });
        dbMock.get.mockResolvedValueOnce(null);

        await expect(bookService.createBook({
            title: 'New Book Title',
            author: { id: 1, name: 'Author Name', birthdate: '1990-01-01' },
            genre: { id: 999, name: 'Non-existent Genre' },
            published_year: 2021,
        })).rejects.toThrow('Genre with id 999 does not exist');
    });

    it('should delete a book', async () => {
        dbMock.get.mockResolvedValueOnce({
            isbn: 1,
            title: 'Book to Delete',
            author: 'Author Name',
            genre: 'Genre Name',
            published_year: 2021
        });

        await bookService.deleteBook(1);

        expect(dbMock.run).toHaveBeenCalledWith(
            'DELETE FROM Book WHERE isbn = ?',
            [1]
        );
    });

    it('should fail to delete a non-existent book', async () => {
        dbMock.get.mockResolvedValue(null);

        await expect(bookService.deleteBook(999))
            .rejects.toThrow('Book not found.');
    });

    it('should handle partial book updates', async () => {
        dbMock.get.mockResolvedValueOnce({
            isbn: 1,
            title: 'Old Title',
            author: 'Old Author',
            genre: 'Old Genre',
            published_year: 2020
        });

        const partialUpdate = await bookService.updateBook(1, {
            title: 'New Title'
        });

        expect(dbMock.run).toHaveBeenCalledWith(
            'UPDATE Book SET title = ? WHERE isbn = ?',
            ['New Title', 1]
        );
    });

    it('should fail to update with invalid author', async () => {
        dbMock.get.mockResolvedValueOnce({
            isbn: 1,
            title: 'Old Title',
            author: 'Old Author',
            genre: 'Old Genre',
            published_year: 2020
        });

        dbMock.get.mockResolvedValueOnce(null);

        await expect(bookService.updateBook(1, {
            author: { id: 999, name: 'Non-existent Author', birthdate: '1990-01-01' }
        })).rejects.toThrow('Author with id 999 does not exist');
    });
}); 