import { GenreService } from '../src/ts/database/services/genreService';
import { initDB } from '../src/ts/database/database';

jest.mock('../src/ts/database/database', () => ({
    initDB: jest.fn()
}));

describe('GenreService', () => {
    let genreService: GenreService;
    let dbMock: any;

    beforeEach(async () => {
        dbMock = {
            run: jest.fn(),
            get: jest.fn(),
            all: jest.fn(),
            exec: jest.fn()
        };

        (initDB as jest.Mock).mockResolvedValue(dbMock);
        genreService = new GenreService(await initDB());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get all genres', async () => {
        const mockGenres = [
            { id: 1, name: 'Fantasy' },
            { id: 2, name: 'Science Fiction' }
        ];

        dbMock.all.mockResolvedValue(mockGenres);

        const result = await genreService.getAllGenres();

        expect(dbMock.all).toHaveBeenCalledWith('SELECT * FROM Genre');
        expect(result).toEqual(mockGenres);
    });

    it('should get a genre by id', async () => {
        const mockGenre = {
            id: 1,
            name: 'Fantasy'
        };

        dbMock.get.mockResolvedValue(mockGenre);

        const result = await genreService.getGenre(1);

        expect(dbMock.get).toHaveBeenCalledWith(
            'SELECT * FROM Genre WHERE id = ?',
            [1]
        );
        expect(result).toEqual(mockGenre);
    });

    it('should return null for non-existent genre', async () => {
        dbMock.get.mockResolvedValue(null);

        const result = await genreService.getGenre(999);

        expect(dbMock.get).toHaveBeenCalledWith(
            'SELECT * FROM Genre WHERE id = ?',
            [999]
        );
        expect(result).toBeNull();
    });

    it('should create a genre', async () => {
        dbMock.run.mockResolvedValue({ lastID: 1 });
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'New Genre'
        });

        const result = await genreService.createGenre({
            name: 'New Genre'
        });

        expect(dbMock.run).toHaveBeenCalledWith(
            'INSERT INTO Genre (name) VALUES (?)',
            ['New Genre']
        );
        expect(result).toEqual({
            id: 1,
            name: 'New Genre'
        });
    });

    it('should update a genre', async () => {
        dbMock.get.mockResolvedValueOnce({
            id: 1,
            name: 'Old Genre'
        });

        dbMock.run.mockResolvedValueOnce({ changes: 1 });

        dbMock.get.mockResolvedValueOnce({
            id: 1,
            name: 'Updated Genre'
        });

        const result = await genreService.updateGenre(1, {
            name: 'Updated Genre'
        });

        expect(dbMock.run).toHaveBeenCalledWith(
            'UPDATE Genre SET name = ? WHERE id = ?',
            ['Updated Genre', 1]
        );
        expect(result).toEqual({
            id: 1,
            name: 'Updated Genre'
        });
    });

    it('should fail to update non-existent genre', async () => {
        dbMock.get.mockResolvedValueOnce(null);

        await expect(genreService.updateGenre(999, {
            name: 'Updated Genre'
        })).rejects.toThrow('Genre not found.');
    });

    it('should delete a genre', async () => {
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Genre to Delete'
        });

        await genreService.deleteGenre(1);

        expect(dbMock.run).toHaveBeenCalledWith(
            'DELETE FROM Genre WHERE id = ?',
            [1]
        );
    });

    it('should fail to delete non-existent genre', async () => {
        dbMock.get.mockResolvedValue(null);

        await expect(genreService.deleteGenre(999))
            .rejects.toThrow('Genre not found.');
    });

    it('should handle genre deletion with associated books', async () => {
        dbMock.get.mockResolvedValue({
            id: 1,
            name: 'Genre with Books'
        });

        await genreService.deleteGenre(1);

        expect(dbMock.run).toHaveBeenNthCalledWith(1,
            'UPDATE Book SET genre = NULL WHERE genre = ?',
            [1]
        );

        expect(dbMock.run).toHaveBeenNthCalledWith(2,
            'DELETE FROM Genre WHERE id = ?',
            [1]
        );
    });

    it('should return null when creating genre fails', async () => {
        dbMock.run.mockResolvedValue({ lastID: null });

        const result = await genreService.createGenre({
            name: 'Failed Genre'
        });

        expect(result).toBeNull();
    });
});
