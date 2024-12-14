import { Request, Response, NextFunction } from 'express';
import { verifyToken } from "./jwt.js";

// Adding a middleware for the routes
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.path === '/login' || req.path === '/register') {
        next();
        return;
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'To use this API, please follow these steps:',
            steps: [
                '1. Create an account: POST /register with {"username": "your_username", "password": "your_password"}',
                '2. Get your token: POST /login with the same credentials',
                '3. Use the token in your requests with header: Authorization: Bearer your_token'
            ],
            example: {
                register: 'curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d \'{"username": "your_username", "password": "your_password"}\'',
                login: 'curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d \'{"username": "your_username", "password": "your_password"}\''
            }
        });
        return;
    }

    try {
        const payload = await verifyToken(token);
        req.user = payload;
        next();
    } 
    catch (error) {
        res.status(401).json({
            error: 'Invalid token',
            message: 'Your token is invalid or has expired. Please login again to get a new token.',
            login: 'If your credentials were wrong, make sure to type correctly: curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d \'{"username": "your_username", "password": "your_password"}\'',
            register: 'To get a new token, make sure to do: curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d \'{"username": "your_username", "password": "your_password"}\''
        });
        return;
    }
};