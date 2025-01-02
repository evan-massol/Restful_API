import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { UserDbDAO } from '../DAO/dbDAO/user.js';
import { User } from '../models/user.js';

export class UserService {
    private userDbDAO: UserDbDAO;

    constructor(db: Database<sqlite3.Database>) {
        this.userDbDAO = new UserDbDAO(db);
    }

    async getUserByUsername(username : string): Promise<User | null> {
        return this.userDbDAO.getUserByUsername(username);
    }

    async getUserById(id: number): Promise<User | null> {
        return this.userDbDAO.getUserById(id);
    }

    async createUser(username : string, password : string): Promise<User | null> {
        return this.userDbDAO.createUser(username, password);
    }

    async getAllUsers(): Promise<User[] | null> {
        return this.userDbDAO.getAllUsers();
    }

    async deleteUser(id: number): Promise<void> {
        return this.userDbDAO.deleteUser(id);
    }
} 