import { AuthorService } from '../src/ts/database/services/authorService';
import { initDB } from '../src/ts/database/database';

jest.mock('../src/ts/database/database', () => ({
    initDB: jest.fn()
}));

describe('AuthorService', () => {
    let authorService: AuthorService;
    let dbMock: any;

    beforeEach(async () => {
        dbMock = {
            run: jest.fn(),
            get: jest.fn(),
            all: jest.fn()
        };

        (initDB as jest.Mock).mockResolvedValue(dbMock);
        authorService = new AuthorService(await initDB());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get all authors', async () => {
        const mockAuthors = [
            { id: 1, name: 'Author 1', birthdate: '1990-01-01' },
            { id: 2, name: 'Author 2', birthdate: '1985-06-15' }
        ];

        dbMock.all.mockResolvedValue(mockAuthors);

        const result = await authorService.getAllAuthors();

        expect(dbMock.all).toHaveBeenCalledWith('SELECT * FROM Author');
        expect(result).toEqual(mockAuthors);
    });

    it('should get an author by id', async () => {
        const mockAuthor = {
            id: 1,
            name: 'Test Author',
            birthdate: '1990-01-01'
        };

        dbMock.get.mockResolvedValue(mockAuthor);

        const result = await authorService.getAuthor(1);

        expect(dbMock.get).toHaveBeenCalledWith(
            'SELECT * FROM Author WHERE id = ?',
            [1]
        );
        expect(result).toEqual(mockAuthor);
    });

    it('should return null for non-existent author', async () => {
        dbMock.get.mockResolvedValue(null);

        const result = await authorService.getAuthor(999);

        expect(dbMock.get).toHaveBeenCalledWith(
            'SELECT * FROM Author WHERE id = ?',
            [999]
        );
        expect(result).toBeNull();
    });

    it('should create an author', async () => {
        dbMock.run.mockResolvedValue({ lastID: 1 });
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'New Author',
            birthdate: '01 January 1990'
        });

        const result = await authorService.createAuthor({
            name: 'New Author',
            birthdate: '1990-01-01'
        });

        expect(dbMock.run).toHaveBeenCalledWith(
            'INSERT INTO Author (name, birthdate) VALUES (?, ?)',
            ['New Author', '1990-01-01']
        );
        expect(result).toEqual({
            id: 1,
            name: 'New Author',
            birthdate: '01 January 1990'
        });
    });

    it('should fail to create author with invalid birthdate', async () => {
        await expect(authorService.createAuthor({
            name: 'Invalid Author',
            birthdate: 'invalid-date'
        })).rejects.toThrow('Invalid birthdate format. Expected format: YYYY-MM-DD');
    });

    it('should update an author', async () => {
        dbMock.get.mockResolvedValueOnce({
            id: 1,
            name: 'Old Name',
            birthdate: '01 January 1990'
        });

        dbMock.run.mockResolvedValue({ changes: 1 });

        dbMock.get.mockResolvedValueOnce({
            id: 1,
            name: 'Updated Name',
            birthdate: '01 January 1990'
        });

        const result = await authorService.updateAuthor(1, {
            name: 'Updated Name'
        });

        expect(dbMock.run).toHaveBeenCalledWith(
            'UPDATE Author SET name = ? WHERE id = ?',
            ['Updated Name', 1]
        );
        expect(result).toEqual({
            id: 1,
            name: 'Updated Name',
            birthdate: '01 January 1990'
        });
    });

    it('should fail to update non-existent author', async () => {
        dbMock.get.mockResolvedValueOnce(null);

        await expect(authorService.updateAuthor(999, {
            name: 'Updated Name'
        })).rejects.toThrow('Author not found.');
    });

    it('should delete an author', async () => {
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Author to Delete',
            birthdate: '1990-01-01'
        });

        await authorService.deleteAuthor(1);

        expect(dbMock.run).toHaveBeenCalledWith(
            'DELETE FROM Author WHERE id = ?',
            [1]
        );
    });

    it('should fail to delete non-existent author', async () => {
        dbMock.get.mockResolvedValue(null);

        await expect(authorService.deleteAuthor(999))
            .rejects.toThrow('Author not found.');
    });
});
