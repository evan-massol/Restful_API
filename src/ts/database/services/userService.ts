import { UserDbDAO } from '../DAO/dbDAO/user.js';
import { User } from '../models/user.js';

export class UserService {
    private userDbDAO: UserDbDAO;

    constructor(db: any) {
        this.userDbDAO = new UserDbDAO(db);
    }

    async getUserByUsername(username : string): Promise<User | null> {
        return this.userDbDAO.getUserByUsername(username);
    }

    async createUser(username : string, password : string): Promise<User | null> {
        return this.userDbDAO.createUser(username, password);
    }
} 