import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getDBConnection = async () => {
  return open({
    filename: resolve(__dirname, '../database/database.db'),
    driver: sqlite3.Database
  });
};

export const addLocation = async (name: string, address: string, city: string, country: string) => {
  const db = await getDBConnection();
  const result = await db.run(
    `INSERT INTO Locations (name, address, city, country) VALUES (?, ?, ?, ?)`,
    name, address, city, country
  );
  await db.close();
  return result.lastID;
};

export const addEvent = async (title: string, date: string, location_id: number) => {
  const db = await getDBConnection();
  const result = await db.run(
    `INSERT INTO Events (title, date, location_id) VALUES (?, ?, ?)`,
    title, date, location_id
  );
  await db.close();
  return result.lastID;
};

export const getEvents = async () => {
  const db = await getDBConnection();
  const events = await db.all(`
    SELECT Events.id, Events.title, Events.date, Locations.name as location_name
    FROM Events
    JOIN Locations ON Events.location_id = Locations.id
  `);
  await db.close();
  return events;
};


export const getLocations = async () => {
    const db = await getDBConnection();
    const locations = await db.all('SELECT * FROM locations');
    return locations;
  };