import { Request, Response, NextFunction } from 'express';
import { verifyToken } from "./jwt.js";

// Adding a middleware for the routes
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Allow login and register without authentication
    if (req.path === '/login' || req.path === '/register') {
        next();
        return;
    }

    // Check if the token is present in the request
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'To use this API, please follow these steps:',
            steps: [
                '1. Go to the swagger UI at http://localhost:3000/api-docs',
                '2. Create a user with the register endpoint',
                '3. Login with the login endpoint to get a token',
                '4. Use the token by adding it to the Authorize button in the swagger UI'
            ]
        });
        return;
    }

    // Verify the token
    try {
        const payload = await verifyToken(token);
        req.user = payload;
        next();
    } 
    catch (error) {
        res.status(401).json({
            error: 'Invalid token',
            message: 'Your token is invalid or has expired. Please login again to get a new token.'
        });
        return;
    }
};