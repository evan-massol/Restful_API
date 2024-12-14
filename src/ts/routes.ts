import { Request, Response, Application } from 'express';
import { BooksController } from './database/controllers/book.js';
import { AuthorController } from './database/controllers/author.js';
import { GenreController } from './database/controllers/genre.js';
import { UserController } from './database/controllers/user.js';
import { createToken } from './utils/jwt.js';
import { authenticateToken } from './utils/middleware.js';
import bcrypt from 'bcrypt';

export function setupRoutes(app: Application) {
    const booksController = new BooksController(app.locals.db);
    const authorController = new AuthorController(app.locals.db);
    const genreController = new GenreController(app.locals.db);
    const userController = new UserController(app.locals.db);

    // Base route
    app.get('/', authenticateToken, async (req: Request, res: Response) => {
        res.send("Welcome to the Books API!");
    });

    // Books routes
    app.get('/books', authenticateToken, async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const books = await booksController.getBooks(page, limit);
            res.json({
                data: books,
                page,
                limit,
                total: await booksController.getTotalBooks()
            });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching books' });
        }
    });

    app.get('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const book = await booksController.getBook(parseInt(req.params.id));
            book ? res.json(book) : res.status(404).json({ error: 'Book not found' });
        } 
        catch (error) {
            console.error('Error fetching book:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/books', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { title, author, genre, published_year } = req.body;
            const book = await booksController.createBook({ title, author, genre, published_year });
            res.status(201).json(book);
        } catch (error) {
            res.status(500).json({ error: 'Error creating book' });
        }
    });

    app.put('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const book = await booksController.updateBook(parseInt(req.params.id), req.body);
            res.json(book);
        } catch (error) {
            res.status(500).json({ error: 'Error updating book' });
        }
    });

    app.delete('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            await booksController.deleteBook(parseInt(req.params.id));
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Error deleting book' });
        }
    });

    // Authors routes
    app.get('/authors', authenticateToken, async (req: Request, res: Response) => {
        try {
            const authors = await authorController.getAllAuthors();
            authors ? res.json(authors) : res.status(404).json({error : 'No authors found.'});
        } 
        catch (error) {
            console.error('Error fetching authors:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/authors/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const author = await authorController.getAuthor(parseInt(req.params.id));
            author ? res.json(author) : res.status(404).json({ error: 'Author not found' });
        } 
        catch (error) {
            console.error('Error fetching author:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Genres routes
    app.get('/genres', authenticateToken, async (req: Request, res: Response) => {
        try {
            const genres = await genreController.getAllGenres();
            genres ? res.json(genres) : res.status(404).json({error : 'No genres found.'});
        } 
        catch (error) {
            console.error('Error fetching genres:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/genres/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const genre = await genreController.getGenre(parseInt(req.params.id));
            genre ? res.json(genre) : res.status(404).json({ error: 'Genre not found' });
        } 
        catch (error) {
            console.error('Error fetching genre:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Register route
    app.post('/register', async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;
            const user = await userController.createUser(username, password);
            res.status(201).json({ 
                message: 'User created successfully',
                user: { id: user?.id, username: user?.username }
            });
        } catch (error: any) {
            if (error.message === 'Username already exists') 
                res.status(409).json({ error: 'Username already exists' });

            else if (error.message === 'Username and password are required')
                res.status(400).json({ error: 'Username and password are required' });
            
            else {
                console.error('Error in register:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    });

    // Login route
    app.post('/login', async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;
            const user = await userController.getUserByUsername(username);
            
            if (user && await bcrypt.compare(password, user.password)) {
                const token = await createToken({ 
                    id: user.id,
                    username: user.username 
                });
                res.json({ token });
            }
            else 
                res.status(401).json({ error: 'Invalid credentials' });
        } 
        catch (error) {
            console.error('Error during connection:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/login', (req: Request, res: Response) => {
        res.json({ 
            message: 'Please login with a POST request if you already have a JWT token.',
            example: 'An example using \'curl\' can be:\n',
            ex: 'curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d \'{"username": "your_username", "password": "your_password"}\''
        });
    });

    app.get('/books/search', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { title, author, genre, year } = req.query;
            const books = await booksController.searchBooks({ title, author, genre, year });
            res.json(books);
        } catch (error) {
            res.status(500).json({ error: 'Error searching books' });
        }
    });

    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Route not found' });
    });
}