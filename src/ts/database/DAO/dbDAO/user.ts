import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { User } from '../../models/user';
import bcrypt from 'bcrypt';
import { UserDAO } from '../userDAO';

export class UserDbDAO implements UserDAO {
    private db: Database<sqlite3.Database>;

    constructor(db: Database<sqlite3.Database>) {
        this.db = db;
    }

    async createUser(username: string, password: string): Promise<User | null> {
        try {
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            const existingUser = await this.getUserByUsername(username);
            if (existingUser) 
                throw new Error('Username already exists');

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const result = await this.db.run(
                'INSERT INTO Users (username, password) VALUES (?, ?)',
                [username, hashedPassword]
            );

            return {
                id: result.lastID ?? 0,
                username,
                password: hashedPassword
            };
        } 
        catch (error) {
            console.error('Error in createUser:', error);
            throw error;
        }
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return await this.db.get('SELECT * FROM Users WHERE username = ?', [username]) || null;
    }

    async getUserById(id: number): Promise<User | null> {
        return await this.db.get('SELECT id, username FROM Users WHERE id = ?', [id]) || null;
    }

    async getAllUsers(): Promise<User[] | null> {
        return await this.db.all('SELECT id, username FROM Users') || null;
    }

    async deleteUser(id: number): Promise<void> {
        try {
            // Check if the user exists
            const user = await this.getUserById(id);
            if (!user)
                throw new Error('User not found');
            await this.db.run('DELETE FROM Users WHERE id = ?', [id]);
        } 
        catch (error) {
            throw error;
        }
    }
}
