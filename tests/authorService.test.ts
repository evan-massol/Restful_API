import { AuthorService } from '../src/ts/database/services/authorService.js';
import { AuthorDbDAO } from '../src/ts/database/DAO/dbDAO/author.js';
import { Author } from '../src/ts/database/models/author.js';

jest.mock('../src/ts/database/DAO/dbDAO/author.js');

describe('AuthorService', () => {
    let authorService: AuthorService;
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            get: jest.fn(),
            all: jest.fn(),
            run: jest.fn(),
        };
        authorService = new AuthorService(mockDb);
    });

    it('should create an author', async () => {
        const authorData: Partial<Author> = { name: 'John Doe', birthdate: '1990-01-01' };
        (AuthorDbDAO.prototype.createAuthor as jest.Mock).mockResolvedValue({ id: 1, ...authorData });

        const result = await authorService.createAuthor(authorData);
        expect(result).toEqual({ id: 1, ...authorData });
    });

    it('should get an author by id', async () => {
        const author: Author = { id: 1, name: 'John Doe', birthdate: '1990-01-01' };
        (AuthorDbDAO.prototype.getAuthor as jest.Mock).mockResolvedValue(author);

        const result = await authorService.getAuthor(1);
        expect(result).toEqual(author);
    });

    it('should get all authors', async () => {
        const authors: Author[] = [
            { id: 1, name: 'John Doe', birthdate: '1990-01-01' },
            { id: 2, name: 'Jane Smith', birthdate: '1985-05-15' },
        ];
        (AuthorDbDAO.prototype.getAllAuthors as jest.Mock).mockResolvedValue(authors);

        const result = await authorService.getAllAuthors();
        expect(result).toEqual(authors);
    });

    it('should update an author', async () => {
        const authorData: Partial<Author> = { name: 'John Doe Updated', birthdate: '1990-01-01' };
        (AuthorDbDAO.prototype.updateAuthor as jest.Mock).mockResolvedValue({ id: 1, ...authorData });

        const result = await authorService.updateAuthor(1, authorData);
        expect(result).toEqual({ id: 1, ...authorData });
    });

    it('should delete an author', async () => {
        (AuthorDbDAO.prototype.deleteAuthor as jest.Mock).mockResolvedValue(undefined);

        await authorService.deleteAuthor(1);
        expect(AuthorDbDAO.prototype.deleteAuthor).toHaveBeenCalledWith(1);
    });
});