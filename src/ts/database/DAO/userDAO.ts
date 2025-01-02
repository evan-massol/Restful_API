import { User } from '../models/user';

export interface UserDAO {
    createUser(username: string, password: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserById(id: number): Promise<User | null>;
    getAllUsers(): Promise<User[] | null>;
    deleteUser(id: number): Promise<void>;
}
