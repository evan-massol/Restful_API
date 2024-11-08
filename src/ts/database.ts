import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createEvent, createTiming } from './CRUD/create';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initDB() {
  const db = await open({
    filename: join(__dirname, '../database/database.db'),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS event (
      idEvent INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Timing (
      idTiming INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER,
      start DATETIME NOT NULL,
      end DATETIME NOT NULL,
      comment TEXT,
      FOREIGN KEY (eventId) REFERENCES Event(idEvent) ON DELETE CASCADE
    );
  `)

  seedDatabase(db);

  await db.exec(`
    INSERT INTO Event (title, description) VALUES 
      ('Réunion de projet', "Réunion pour discuter de l'avancement du projet."),
      ('Formation interne', 'Session de formation pour les nouveaux employés.'),
      ('Développement produit', 'Session de brainstorming pour le nouveau produit.'),
      ("Journée d'intégration", 'Événement de bienvenue pour les nouvelles recrues.');
  `);

  await db.exec(`
    INSERT INTO Timing (eventId, start, end, comment) VALUES 
    (1, '2024-11-10 09:00:00', '2024-11-10 10:30:00', 'Introduction au projet'),
    (1, '2024-11-10 10:45:00', '2024-11-10 12:00:00', 'Discussion sur les fonctionnalités principales');

    INSERT INTO Timing (eventId, start, end, comment) VALUES 
    (2, '2024-11-12 14:00:00', '2024-11-12 15:30:00', 'Formation sur les processus internes'),
    (2, '2024-11-12 15:45:00', '2024-11-12 17:00:00', "Présentation de l'équipe et des outils");

    INSERT INTO Timing (eventId, start, end, comment) VALUES 
    (3, '2024-11-14 09:30:00', '2024-11-14 11:00:00', 'Brainstorming sur les idées de produit'),
    (3, '2024-11-14 11:15:00', '2024-11-14 12:30:00', 'Analyse des tendances du marché');

    INSERT INTO Timing (eventId, start, end, comment) VALUES 
    (4, '2024-11-15 08:30:00', '2024-11-15 10:00:00', "Présentation de l'entreprise"),
    (4, '2024-11-15 10:15:00', '2024-11-15 12:00:00', 'Rencontre avec les équipes'),
    (4, '2024-11-15 13:30:00', '2024-11-15 15:00:00', 'Activités de team-building');  
  `);

  return db;
}

async function seedDatabase(db: Database) {
  const event1Id = await createEvent(db, 'Réunion de projet', "Réunion pour discuter de l'avancement du projet.");
  const event2Id = await createEvent(db, 'Formation interne', 'Session de formation pour les nouveaux employés.');
  const event3Id = await createEvent(db, 'Développement produit', 'Session de brainstorming pour le nouveau produit.');
  const event4Id = await createEvent(db, "Journée d'intégration", 'Événement de bienvenue pour les nouvelles recrues.');

  if(event1Id !== undefined){
    await createTiming(db, event1Id, new Date('2024-11-10T09:00:00'), new Date('2024-11-10T10:30:00'), 'Introduction au projet');
    await createTiming(db, event1Id, new Date('2024-11-10T10:45:00'), new Date('2024-11-10T12:00:00'), 'Discussion sur les fonctionnalités principales');
  }

  if(event2Id !== undefined){
    await createTiming(db, event2Id, new Date('2024-11-12T14:00:00'), new Date('2024-11-12T15:30:00'), 'Formation sur les processus internes');
    await createTiming(db, event2Id, new Date('2024-11-12T15:45:00'), new Date('2024-11-12T17:00:00'), "Présentation de l'équipe et des outils");  
  }
    
  if(event3Id !== undefined){
    await createTiming(db, event3Id, new Date('2024-11-14T09:30:00'), new Date('2024-11-14T11:00:00'), 'Brainstorming sur les idées de produit');
    await createTiming(db, event3Id, new Date('2024-11-14T11:15:00'), new Date('2024-11-14T12:30:00'), 'Analyse des tendances du marché');
  }

  if(event4Id !== undefined){
    await createTiming(db, event4Id, new Date('2024-11-15T08:30:00'), new Date('2024-11-15T10:00:00'), "Présentation de l'entreprise");
    await createTiming(db, event4Id, new Date('2024-11-15T10:15:00'), new Date('2024-11-15T12:00:00'), 'Rencontre avec les équipes');
    await createTiming(db, event4Id, new Date('2024-11-15T13:30:00'), new Date('2024-11-15T15:00:00'), 'Activités de team-building');
  }
}

