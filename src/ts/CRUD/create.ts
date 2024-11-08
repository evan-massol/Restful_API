import { Database } from 'sqlite';

export async function createEvent(db: Database, title: string, description: string) {
  const result = await db.run(
    'INSERT INTO Event (title, description) VALUES (?, ?)',
    title,
    description
  );
  return result.lastID;
}

export async function createTiming(db: Database, eventId: number, start: Date, end: Date, comment: string) {
  const result = await db.run(
    'INSERT INTO Timing (eventId, start, end, comment) VALUES (?, ?, ?, ?)',
    eventId,
    start.toISOString(),
    end.toISOString(),
    comment
  );
  return result.lastID;
}
