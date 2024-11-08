import { Request, Response, Application } from 'express';

export function setupRoutes(app: Application) {

  // Base route
  app.get('/', async (req: Request, res: Response) => {
    res.send("Welcome to the Clash Royale API!");
  });

  // Cards route
  app.get('/cards', async (req: Request, res: Response) => {
    const db = req.app.locals.db;
    try {
      const events = await db.all('SELECT * FROM Cards');
      res.json(events);
    } 
    catch (error) {
      console.error('Error fetching cards:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
