import { User } from '../models/user';

export interface UserDAO {
    createUser(username: string, password: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
}
