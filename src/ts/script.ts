import express from 'express';
import { addLocation, addEvent, getEvents, getLocations } from './eventService.js';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome on the base page');
});

app.get('/locations', async (req, res) => {
    try {
        const locations = await getLocations(); 
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving locations' });
    }
});

app.post('/locations', async (req, res) => {
  const { name, address, city, country } = req.body;
  const locationId = await addLocation(name, address, city, country);
  res.json({ locationId });
});

app.post('/events', async (req, res) => {
  const { title, date, location_id } = req.body;
  const eventId = await addEvent(title, date, location_id);
  res.json({ eventId });
});

app.get('/events', async (req, res) => {
  const events = await getEvents();
  res.json(events);
});


app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
