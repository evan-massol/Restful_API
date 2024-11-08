import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initDB() {
  const db = await open({
    filename: join(__dirname, '../database/database.db'),
    driver: sqlite3.Database,
  });

  await createTables(db); //Create the tables if they don't exist already

  await seedDatabase(db); //Fill the database with data

  return db;
}

async function createTables(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Cards (
      idCard INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(20) NOT NULL,
      rarity TEXT CHECK(rarity IN ('common', 'rare', 'epic', 'legendary', 'champion')) NOT NULL,
      type TEXT CHECK(type IN ('troop', 'building', 'spell')) NOT NULL,
      elixir_cost INTEGER NOT NULL,
      description VARCHAR(255)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Players (
      idPlayer INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(30) NOT NULL,
      king_level INTEGER NOT NULL,
      trophies INTEGER DEFAULT 0,
      joined_on TIMESTAMP NOT NULL,
      favorite_card VARCHAR(20) NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Decks (
      idDeck INTEGER PRIMARY KEY AUTOINCREMENT, 
      idPlayer INT NOT NULL,                     
      FOREIGN KEY (idPlayer) REFERENCES Players(idPlayer)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS DeckCards (
      idDeck INTEGER NOT NULL,
      idCard INTEGER NOT NULL,
      PRIMARY KEY (idDeck, idCard),
      FOREIGN KEY (idDeck) REFERENCES Decks(idDeck),
      FOREIGN KEY (idCard) REFERENCES Cards(idCard)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS BattleStats (
      idBattle INTEGER PRIMARY KEY AUTOINCREMENT,
      idPlayer1 INTEGER NOT NULL,
      idPlayer2 INTEGER NOT NULL,
      winner VARCHAR(30) NOT NULL,
      duration INTEGER NOT NULL,
      FOREIGN KEY (idPlayer1) REFERENCES Players(idPlayer),
      FOREIGN KEY (idPlayer2) REFERENCES Players(idPlayer),
      FOREIGN KEY (winner) REFERENCES Players(idPlayer)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS PlayerCards (
      idPlayer INTEGER NOT NULL,
      idCard INTEGER NOT NULL,
      card_level INTEGER DEFAULT 1,
      PRIMARY KEY (idPlayer, idCard),
      FOREIGN KEY (idPlayer) REFERENCES Players(idPlayer),
      FOREIGN KEY (idCard) REFERENCES Cards(idCard)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS CardStats (
      idCard INTEGER NOT NULL,
      level INTEGER NOT NULL,
      hitpoints INTEGER,
      damage INTEGER,
      PRIMARY KEY (idCard, level),
      FOREIGN KEY (idCard) REFERENCES Cards(idCard)
    );
  `);
}

async function seedDatabase(db: Database) {
  await db.exec(`
    INSERT OR REPLACE INTO Cards (name, rarity, type, elixir_cost, description) VALUES
    ('Knight', 'common', 'troop', 3, 'Melee troop with moderate damage and hitpoints.'),
    ('Archers', 'common', 'troop', 3, 'Ranged attackers with low hitpoints and moderate damage.'),
    ('Fireball', 'rare', 'spell', 4, 'Damages all troops and buildings in an area.'),
    ('Giant', 'rare', 'troop', 5, 'High hitpoints troop that targets buildings.'),
    ('Baby Dragon', 'epic', 'troop', 4, 'Flying troop with splash damage.'),
    ('P.E.K.K.A', 'epic', 'troop', 7, 'Heavy damage dealer with high hitpoints.'),
    ('Mega Minion', 'rare', 'troop', 3, 'Flying troop with decent damage output.'),
    ('Zap', 'common', 'spell', 2, 'Damages and stuns all enemies in a small area.')
  `).catch((err) => {
    console.log(err)
  });

  // Insert CardStats data (levels 1 to 11 for each card as an example)
  await db.exec(`
    INSERT OR REPLACE INTO CardStats (idCard, level, hitpoints, damage) VALUES
    (1, 1, 600, 100), (1, 2, 660, 110), (1, 3, 726, 121), (1, 4, 798, 133), (1, 5, 876, 146),
    (1, 6, 960, 160), (1, 7, 1056, 175), (1, 8, 1158, 191), (1, 9, 1266, 210), (1, 10, 1398, 230),
    (1, 11, 1536, 252),

    (3, 1, NULL, 572), (3, 2, NULL, 627), (3, 3, NULL, 689), (3, 4, NULL, 757), (3, 5, NULL, 832),
    (3, 6, NULL, 915), (3, 7, NULL, 1006), (3, 8, NULL, 1107), (3, 9, NULL, 1217), (3, 10, NULL, 1339),
    (3, 11, NULL, 1468),

    (4, 1, 2000, 120), (4, 2, 2200, 132), (4, 3, 2420, 145), (4, 4, 2660, 159), (4, 5, 2920, 174),
    (4, 6, 3200, 191), (4, 7, 3520, 209), (4, 8, 3870, 230), (4, 9, 4250, 251), (4, 10, 4660, 276),
    (4, 11, 5120, 302)
  `).catch((err) => {
    console.log(err)
  });

  // Insert Players data
  await db.exec(`
    INSERT OR REPLACE INTO Players (name, king_level, trophies, joined_on, favorite_card) VALUES
    ('PlayerOne', 10, 3500, '2023-01-01 10:00:00', 'Knight'),
    ('PlayerTwo', 9, 2900, '2023-02-15 14:30:00', 'Fireball'),
    ('PlayerThree', 8, 2500, '2023-03-10 12:45:00', 'Giant')
  `).catch((err) => {
    console.log(err)
  });

  // Insert PlayerCards data (to assign card levels to specific players)
  await db.exec(`
    INSERT OR REPLACE INTO PlayerCards (idPlayer, idCard, card_level) VALUES
    (1, 1, 10), 
    (1, 2, 10), 
    (2, 3, 9), 
    (3, 4, 8)   
  `).catch((err) => {
    console.log(err)
  });

  await db.exec(`
    INSERT OR REPLACE INTO Decks (idPlayer) VALUES
    (1), (2), (3)
  `).catch((err) => {
    console.log(err)
  });

  await db.exec(`
    INSERT OR REPLACE INTO DeckCards (idDeck, idCard) VALUES
    (1, 1), (1, 2), (1, 3), 
    (2, 3), (2, 4), (2, 1), 
    (3, 4), (3, 1), (3, 2)  
  `).catch((err) => {
    console.log(err)
  });

  // Insert BattleStats data to record some example battles
  await db.exec(`
    INSERT OR REPLACE INTO BattleStats (idPlayer1, idPlayer2, winner, duration) VALUES
    (1, 2, 'PlayerOne', 300),
    (2, 3, 'PlayerTwo', 250), 
    (1, 3, 'PlayerOne', 200)  
  `);
}

