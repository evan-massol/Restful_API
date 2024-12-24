import express from 'express';
import { initDB } from './database/database.js';
import { setupRoutes } from './routes.js';
import { setupSwagger } from './swagger.js';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

async function startServer() {
  try {
    // Initialize database
    const db = await initDB();
    app.locals.db = db;
    
    // Swagger documentation
    setupSwagger(app);
    
    // Routes API
    setupRoutes(app);

    // Middleware pour les routes non trouvées (doit être après toutes les autres routes)
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Start server
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } 
  catch (error) {
    console.error('Error initializing the database:', error);
  }
}

startServer();