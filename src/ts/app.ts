import express from 'express';
import { initDB } from './database.js';
import { setupRoutes } from './routes.js';

const app = express();
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline';"
  );
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