import { GenreService } from '../src/ts/database/services/genreService';
import { initDB } from '../src/ts/database/database';

jest.mock('../src/ts/database/database', () => ({
    initDB: jest.fn()
}));

describe('GenreService', () => {
    let genreService: GenreService;
    let dbMock: any;

    beforeEach(async () => {
        jest.clearAllMocks();
    
        dbMock = {
            run: jest.fn(),
            get: jest.fn(),
            exec: jest.fn()
        };
    
        dbMock.get.mockResolvedValue(null);
        dbMock.run.mockResolvedValue({ lastID: 1 });
    
        (initDB as jest.Mock).mockResolvedValue(dbMock);
        genreService = new GenreService(await initDB());
    });
    

    it('should create a genre', async () => {
        dbMock.run.mockResolvedValue({ lastID: 1 });
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Fantasy'
        });

        const result = await genreService.createGenre({ name: 'Fantasy' });

        expect(dbMock.run).toHaveBeenCalledWith(
            'INSERT INTO Genre (name) VALUES (?)',
            ['Fantasy']
        );

        expect(dbMock.get).toHaveBeenCalledWith(
            'SELECT * FROM Genre WHERE id = ?',
            [1]
        );

        expect(result).toEqual({
            id: 1,
            name: 'Fantasy'
        });
    });

    it('should get a genre by id', async () => {
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Fantasy'
        });

        const result = await genreService.getGenre(1);

        expect(dbMock.get).toHaveBeenCalledWith(
            'SELECT * FROM Genre WHERE id = ?',
            [1]
        );

        expect(result).toEqual({
            id: 1,
            name: 'Fantasy'
        });
    });

    it('should update a genre', async () => {
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Fantasy',
        });

        const result = await genreService.createGenre({
            name: 'Fantasy',
        });

        expect(result).toEqual({
            id: 1,
            name: 'Fantasy'
        });

        dbMock.run.mockResolvedValue({ changes: 1 });

        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Science Fiction'
        });

        const result1 = await genreService.updateGenre(1, {
            name: 'Science Fiction',
        });

        expect(dbMock.run).toHaveBeenCalledWith(
            'UPDATE Genre SET name = ? WHERE id = ?',
            ['Science Fiction', 1]
        );

        expect(result1).toEqual({
            id: 1,
            name: 'Science Fiction'
        });
    });

    it('should delete a genre after its creation', async () => {
        dbMock.run.mockResolvedValue({ lastID: 1 });
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Fantasy'
        });

        const result = await genreService.createGenre({
            name: 'Fantasy',
        });

        expect(result).toEqual({
            id: 1,
            name: 'Fantasy'
        });

        dbMock.run.mockResolvedValue({ changes: 1 });

        await genreService.deleteGenre(1);

        expect(dbMock.run).toHaveBeenCalledWith(
            'DELETE FROM Genre WHERE id = ?',
            [1]
        );
    });
});
