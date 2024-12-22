import { initDB } from '../src/ts/database/database';
import { AuthorService } from '../src/ts/database/services/authorService';

jest.mock('../src/ts/database/database', () => ({
    initDB: jest.fn()
}));

describe('AuthorService', () => {
    let dbMock: any;
    let authorService: AuthorService;

    beforeEach(async () => {
        jest.clearAllMocks();

        dbMock = {
            run: jest.fn(),
            get: jest.fn()
        };

        (initDB as jest.Mock).mockResolvedValue(dbMock);

        authorService = new AuthorService(await initDB());
    });

    it('should create an author', async () => {
        dbMock.run.mockResolvedValue({ lastID: 1 });
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            birthdate: '1990-01-01'
        });

        const result = await authorService.createAuthor({
            name: 'John Doe',
            birthdate: '1990-01-01',
        });

        expect(dbMock.run).toHaveBeenCalledWith(
            'INSERT INTO Author (name, birthdate) VALUES (?, ?)',
            ['John Doe', '1990-01-01']
        );

        expect(result).toEqual({
            id: 1,
            name: 'John Doe',
            birthdate: '01 January 1990',
        });
    });

    it('should throw an error for invalid birthdate format', async () => {
        await expect(
            authorService.createAuthor({
                name: 'Invalid Author',
                birthdate: 'wrong-format',
            })
        ).rejects.toThrow('Invalid birthdate format. Expected format: YYYY-MM-DD');
    });

    it('should update an author', async () => {
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Jane Doe',
            birthdate: '1992-02-02',
        });
    
        dbMock.run.mockResolvedValue({ changes: 1 });
    
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'New Author',
            birthdate: '1993-08-09',
        });
    
        const result = await authorService.updateAuthor(1, {
            name: 'New Author',
            birthdate: '1993-08-09',
        });
    
        expect(dbMock.run).toHaveBeenCalledWith(
            'UPDATE Author SET name = ?, birthdate = ? WHERE id = ?',
            ['New Author', '1993-08-09', 1]
        );
    
        expect(result).toEqual({
            id: 1,
            name: 'New Author',
            birthdate: '09 August 1993',
        });
    });
    

    it('should delete an author after its creation', async () => {
        dbMock.run.mockResolvedValue({ lastID: 1 });
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'New Author',
            birthdate: '1990-01-01'
        });

        const result = await authorService.createAuthor({
            name: 'New Author',
            birthdate: '1990-01-01',
        });

        expect(result).toEqual({
            id: 1,
            name: 'New Author',
            birthdate: '01 January 1990',
        });

        dbMock.run.mockResolvedValue({ changes: 1 });

        await authorService.deleteAuthor(1);

        expect(dbMock.run).toHaveBeenCalledWith(
            'DELETE FROM Author WHERE id = ?',
            [1]
        );
    });
});
