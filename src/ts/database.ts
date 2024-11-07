import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const initDB = async() =>{
  const db = await open({
      filename: resolve(__dirname, '../database/database.db'),
      driver: sqlite3.Database
  });

  const tablesPath = resolve(__dirname, '../database/tables.sql');
  const tables = readFileSync(tablesPath, 'utf-8');

  await db.exec(tables);

  console.log("Database initialized successfully.");

  await db.close();
};

initDB().catch((error) => {
  console.error("Erreur lors de l'initialisation de la base de données : ", error);
})