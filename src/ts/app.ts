import express from 'express';
import { initDB } from './database/database.js';
import { setupRoutes } from './routes.js';

const app = express();
app.use(express.json()); //Middleware to only parse JSON
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
    const db = await initDB();
    app.locals.db = db;
    
    setupRoutes(app);

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } 
  catch (error) {
    console.error('Error initializing the database:', error);
  }
}

startServer();