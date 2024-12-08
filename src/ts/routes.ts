import { Request, Response, Application } from 'express';
import { BooksDao } from './database/DAO/bookDao.js';
import { AuthorDao } from './database/DAO/authorDao.js';
import { GenreDao } from './database/DAO/genreDAO.js';
import { UserDao } from './database/DAO/userDAO.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export function setupRoutes(app: Application) {
    const booksDao = new BooksDao(app.locals.db);
    const authorDao = new AuthorDao(app.locals.db);
    const genreDao = new GenreDao(app.locals.db);
    const userDao = new UserDao(app.locals.db);

    // Base route
    app.get('/', async (req: Request, res: Response) => {
        res.send("Welcome to the Books API!");
    });

    // Books routes
    app.get('/books', async (req: Request, res: Response) => {
        try {
            const books = await booksDao.getAllBooks();
            books ? res.json(books) : res.status(404).json({error : 'No books found.'});
        } 
        catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/books/:id', async (req: Request, res: Response) => {
        try {
            const book = await booksDao.getBook(parseInt(req.params.id));
            book ? res.json(book) : res.status(404).json({ error: 'Book not found' });
        } 
        catch (error) {
            console.error('Error fetching book:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Authors routes
    app.get('/authors', async (req: Request, res: Response) => {
        try {
            const authors = await authorDao.getAllAuthors();
            authors ? res.json(authors) : res.status(404).json({error : 'No authors found.'});
        } 
        catch (error) {
            console.error('Error fetching authors:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/authors/:id', async (req: Request, res: Response) => {
        try {
            const author = await authorDao.getAuthor(parseInt(req.params.id));
            author ? res.json(author) : res.status(404).json({ error: 'Author not found' });
        } 
        catch (error) {
            console.error('Error fetching author:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Genres routes
    app.get('/genres', async (req: Request, res: Response) => {
        try {
            const genres = await genreDao.getAllGenres();
            genres ? res.json(genres) : res.status(404).json({error : 'No genres found.'});
        } 
        catch (error) {
            console.error('Error fetching genres:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/genres/:id', async (req: Request, res: Response) => {
        try {
            const genre = await genreDao.getGenre(parseInt(req.params.id));
            genre ? res.json(genre) : res.status(404).json({ error: 'Genre not found' });
        } 
        catch (error) {
            console.error('Error fetching genre:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Register route
    app.post('/register', async (req: Request, res: Response) => {
        const { username, password } = req.body;
        const user = await userDao.createUser(username, password);
        res.status(201).json(user);
    });

    // Login route
    app.post('/login', async (req: Request, res: Response) => {
        const { username, password } = req.body;
        const user = await userDao.getUserByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });

    // Error handling for invalid routes
    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Route not found' });
    });
}