import { AuthorDbDAO } from '../DAO/dbDAO/author.js';
import { Author } from '../models/author.js';

export class AuthorService {
    private authorDbDAO: AuthorDbDAO;

    constructor(db: any) {
        this.authorDbDAO = new AuthorDbDAO(db);
    }

    async getAuthor(id: number): Promise<Author | null> {
        return this.authorDbDAO.getAuthor(id);
    }

    async getAllAuthors(): Promise<Author[] | null> {
        return this.authorDbDAO.getAllAuthors();
    }

    async createAuthor(authorData: Partial<Author>): Promise<Author | null> {
        return this.authorDbDAO.createAuthor(authorData);
    }

    async updateAuthor(id: number, authorData: Partial<Author>): Promise<Author | null> {
        return this.authorDbDAO.updateAuthor(id, authorData);
    }

    async deleteAuthor(id: number): Promise<void> {
        return this.authorDbDAO.deleteAuthor(id);
    }
} 