import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from './database/models/user';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'your_jwt_secret', (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

