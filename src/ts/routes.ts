import { Request, Response, Application } from 'express';
import { createToken } from './utils/jwt.js';
import { authenticateToken } from './utils/middleware.js';
import { AuthorService } from './database/services/authorService.js';
import { BookService } from './database/services/bookService.js';
import { GenreService } from './database/services/genreService.js';
import { UserService } from './database/services/userService.js';
import { Author } from './database/models/author.js';
import { validateId } from './utils/checkParams.js';
import bcrypt from 'bcrypt';
import { Book } from './database/models/book.js';

// Setup routes
export function setupRoutes(app: Application) {
    const booksService = new BookService(app.locals.db);
    const authorService = new AuthorService(app.locals.db);
    const genreService = new GenreService(app.locals.db);
    const userService = new UserService(app.locals.db);

    // Base route
    app.get('/', async (req: Request, res: Response) => {
        res.send('Welcome to the Books API!');
    });

    // Books routes
    // Get all books
    app.get('/books', authenticateToken, async (req: Request, res: Response) => {
        try {
            const books = await booksService.getAllBooks();
            books ? res.json(books) : res.status(404).json({error : 'No books found, try to insert one before getting them.'});
        } 
        catch (error) {
            res.status(500).json({ error: 'Error fetching books' });
        }
    });


    // Get a book by its ISBN
    app.get('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const validId = validateId(req.params.id, 'id');
            const book = await booksService.getBook(validId);
            book ? res.json(book) : res.status(404).json({ error: 'Book not found' });
        } 
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Create a book
    app.post('/books', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { title, authorId, genreId, publishedYear } = req.query;
            
            if (!title || !authorId || !genreId || !publishedYear) {
                res.status(400).json({ error: 'Missing required parameters' });
                return;
            }

            // Validate the parameters
            const validAuthorId = validateId(authorId, 'authorId');
            const validGenreId = validateId(genreId, 'genreId');
            validateId(publishedYear, 'publishedYear');

            const author = await authorService.getAuthor(validAuthorId);
            if (!author) {
                res.status(404).json({ error: 'Author not found' });
                return;
            }

            const genre = await genreService.getGenre(validGenreId);
            if (!genre) {
                res.status(404).json({ error: 'Genre not found' });
                return;
            }

            // Check if book already exists
            const existingBooks = await booksService.getAllBooks();
            const bookExists = existingBooks?.some(book => 
                book.title === String(title) &&
                book.author.id === author.id &&
                book.genre.id === genre.id &&
                book.published_year === Number(publishedYear)
            );

            if (bookExists) {
                res.status(409).json({ error: 'The book with the specified parameters already exists' });
                return;
            }

            const book = await booksService.createBook({
                title: String(title),
                author,
                genre,
                published_year: Number(publishedYear)
            });

            if (!book) {
                res.status(400).json({ error: 'Failed to create the book' });
                return;
            }

            res.status(201).json(book);
        } 
        catch (error : any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Update a book
    app.put('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            // Validate the parameters
            const validId = validateId(req.params.id, 'id');
            const { title, authorId, genreId, publishedYear } = req.query;

            const updateData: Partial<Book> = {};
            
            if (title) 
                updateData.title = String(title);
            
            if (authorId) {
                const validAuthorId = validateId(authorId, 'authorId');
                const author = await authorService.getAuthor(validAuthorId);
                if (!author) {
                    res.status(404).json({ error: 'Author not found' });
                    return;
                }
                updateData.author = author;
            }
            
            if (genreId) {
                const validGenreId = validateId(genreId, 'genreId');
                const genre = await genreService.getGenre(validGenreId);
                if (!genre) {
                    res.status(404).json({ error: 'Genre not found' });
                    return;
                }
                updateData.genre = genre;
            }
            
            if (publishedYear) {
                validateId(publishedYear, 'publishedYear');
                updateData.published_year = Number(publishedYear);
            }

            const book = await booksService.updateBook(validId, updateData);
            if (!book) {
                res.status(404).json({ error: 'Book not found' });
                return;
            }

            res.json(book);
        } 
        catch (error: any) {
            if (error.message.includes('must be a positive integer')) 
                res.status(400).json({ error: error.message });
            else
                res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Delete a book
    app.delete('/books/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const validId = validateId(req.params.id, 'id');
            await booksService.deleteBook(validId);
            res.status(204).send({success : 'Book deleted successfully.'});
        } 
        catch (error : any) {
            if (error.message === 'Book not found.') 
                res.status(404).json({ error: 'Book with the specified ISBN does not exist.' });
            else {
                res.status(500).json({ error: 'Error deleting book' });
            }
        }
    });

    // Authors routes
    // Get all authors
    app.get('/authors', authenticateToken, async (req: Request, res: Response) => {
        try {
            const authors = await authorService.getAllAuthors();
            authors ? res.json(authors) : res.status(404).json({error : 'No authors found.'});
        } 
        catch (error : any) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Get an author by its ID
    app.get('/authors/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const validId = validateId(req.params.id, 'id');
            const author = await authorService.getAuthor(validId);
            author ? res.json(author) : res.status(404).json({ error: 'Author not found' });
        } 
        catch (error : any) {
            if (error.message === 'Author not found.') 
                res.status(404).json({ error: 'Author with the specified ID does not exist.' });
            else 
                res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Create an author
    app.post('/authors', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { name, birthdate } = req.query;
            
            if (!name || !birthdate) 
                res.status(400).json({ error: 'Missing required parameters' });

            const author = await authorService.createAuthor({ 
                name: String(name), 
                birthdate: String(birthdate)
            });

            res.status(201).json(author);
        } 
        catch (error : any) {
            if (error.message === 'Invalid birthdate format') {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Update an author
    app.put('/authors/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const validId = validateId(req.params.id, 'id');
            const { name, birthdate } = req.query;

            const updatedData: Partial<Author> = {};
            if (name) 
                updatedData.name = String(name);

            if (birthdate) 
                updatedData.birthdate = String(birthdate);

            const author = await authorService.updateAuthor(validId, updatedData);
            if (!author) {
                res.status(404).json({ error: 'Author not found' });
                return;
            }

            res.json(author);
        } 
        catch (error : any) {
            if (error.message === 'Invalid birthdate format') {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Delete an author
    app.delete('/authors/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const validId = validateId(req.params.id, 'id');
            await authorService.deleteAuthor(validId);
            res.status(204).send({ success : 'Author successfully deleted.'});
        } 
        catch (error : any) {
            if (error.message === 'Author not found.') 
                res.status(404).json({ error: 'Author with the specified ID does not exist.' });
            else
                res.status(500).json({ error: 'Error deleting author' });
        }
    });

    // Genres routes
    // Get all genres
    app.get('/genres', authenticateToken, async (req: Request, res: Response) => {
        try {
            const genres = await genreService.getAllGenres();
            genres ? res.json(genres) : res.status(404).json({error : 'No genres found.'});
        } 
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Get a genre by its ID
    app.get('/genres/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const genre = await genreService.getGenre(parseInt(req.params.id));
            genre ? res.json(genre) : res.status(404).json({ error: 'Genre not found' });
        } 
        catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Create a genre
    app.post('/genres', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { name } = req.query;
            
            if (!name) {
                res.status(400).json({ error: 'Name is required' });
                return;
            }

            const genre = await genreService.createGenre({ 
                name: String(name)
            });

            res.status(201).json(genre);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Update a genre
    app.put('/genres/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            const { name } = req.query;
            const id = parseInt(req.params.id);

            if (!name) {
                res.status(400).json({ error: 'Name is required' });
                return;
            }

            const genre = await genreService.updateGenre(id, { 
                name: String(name)
            });

            if (!genre) {
                res.status(404).json({ error: 'Genre not found' });
                return;
            }

            res.json(genre);
        } 
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Delete a genre
    app.delete('/genres/:id', authenticateToken, async (req: Request, res: Response) => {
        try {
            await genreService.deleteGenre(parseInt(req.params.id));
            res.status(204).send({ success: "Genre deleted successfully" });
        } 
        catch (error : any) {
            if (error.message === 'Genre not found.') 
                res.status(404).json({ error: 'Genre with the specified ID does not exist.' });
            else
                res.status(500).json({ error: 'Error deleting genre' });
        }
    });

    // Register route
    app.post('/auth/register', async (req: Request, res: Response) => {
        try {
            const { username, password } = req.query;
            
            if (!username || !password) {
                res.status(400).json({ error: 'Username and password are required' });
                return;
            }

            const user = await userService.createUser(String(username), String(password));
            res.status(201).json({ 
                message: 'User created successfully',
                user: { id: user?.id, username: user?.username }
            });
        } 
        catch (error: any) {
            if (error.message === 'Username already exists') 
                res.status(409).json({ error: 'Username already exists' });
            else
                res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Login route
    app.post('/auth/login', async (req: Request, res: Response) => {
        try {
            const { username, password } = req.query;
            
            if (!username || !password) {
                res.status(400).json({ error: 'Username and password are required' });
                return;
            }

            const user = await userService.getUserByUsername(String(username));
            
            if (user && await bcrypt.compare(String(password), user.password)) {
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
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // 404 route
    app.use((res: Response) => {
        res.status(404).json({ error: 'Route not found' });
    });
}