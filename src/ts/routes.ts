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
        res.send('Welcome to the Books API!');
    });

    // Books routes
    app.get('/books', authenticateToken, async (req: Request, res: Response) => {
        try {
            const books = await booksController.getAllBooks();
            books ? res.json(books) : res.status(404).json({error : 'No books found, try to insert one before getting them.'});
        } 
        catch (error) {
            res.status(500).json({ error: 'Error fetching books' });
        }
    });

    app.get('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const book = await booksController.getBook(parseInt(req.params.id));
            book ? res.json(book) : res.status(404).json({ error: 'Book not found' });
        } 
        catch (error) {
            console.error('Error fetching the book: ', error);
            res.status(500).json({ error: 'Couldn\'t get the specified book' });
        }
    });

    app.post('/books', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { title, author, genre, published_year } = req.body;
            const book = await booksController.createBook({ title, author, genre, published_year });
            book ? res.status(201).json(book) : res.status(404).json({error : 'Error in one or multiple fields when making the request in POST /books'});
        } 
        catch (error) {
            console.error('Error creatina a book: ', error);
            res.status(500).json({ error: 'Error creating a book' });
        }
    });

    app.put('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const book = await booksController.updateBook(parseInt(req.params.id), req.body);
            book ? res.json(book) : res.status(400).json({error : 'Error updating the book with id: ' + book!.isbn});
        } 
        catch (error) {
            console.error('Error updating a book: ', error);
            res.status(500).json({ error: 'Error updating book' });
        }
    });

    app.delete('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            await booksController.deleteBook(parseInt(req.params.id));
            res.status(204).send({success : 'Book successfully deleted.'});
        } 
        catch (error) {
            console.error('Error deleting a book: ', error);
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
            console.error('Error fetching authors: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.get('/authors/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const author = await authorController.getAuthor(parseInt(req.params.id));
            author ? res.json(author) : res.status(404).json({ error: 'Author not found' });
        } 
        catch (error) {
            console.error('Error fetching author: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/authors', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { name, birthdate } = req.body;
            const author = await authorController.createAuthor({ name, birthdate });
            author ? res.status(201).json(author) : res.status(404).json({ error : 'Error in one or multiple fields when making the request in POST /authors'});
        } 
        catch (error) {
            console.error('Error creating an author: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.put('/authors/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const author = await authorController.updateAuthor(parseInt(req.params.id), req.body);
            author ? res.json(author) : res.status(404).json({ error: 'Error updating the author with id: ' + author!.id});
        } 
        catch (error) {
            console.error('Error updating an author: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.delete('/authors/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            await authorController.deleteAuthor(parseInt(req.params.id));
            res.status(204).send({ success : 'Author successfully deleted.'});
        } catch (error) {
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

    app.post('/genres', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            const genre = await genreController.createGenre({ name });
            res.status(201).json(genre);
        } 
        catch (error) {
            console.error('Error creating a genre: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.put('/genres/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const genre = await genreController.updateGenre(parseInt(req.params.id), req.body);
            genre ? res.json(genre) : res.status(404).json({ error: 'Genre not found' });
        } 
        catch (error) {
            console.error('Error updating a genre: ', error);
            res.status(500).json({ error: 'Error updating genre' });
        }
    });

    app.delete('/genres/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            await genreController.deleteGenre(parseInt(req.params.id));
            res.status(204).send({ success : "Genre deleted successfully"});
        } 
        catch (error) {
            res.status(500).json({ error: 'Error deleting genre' });
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

    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'Route not found' });
    });
}