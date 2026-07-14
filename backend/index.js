import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'rsvp.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Unable to open database:', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      attending INTEGER NOT NULL,
      message TEXT,
      created_at TEXT NOT NULL
    );
  `);
});

const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const allAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.post('/api/rsvp', async (req, res) => {
  const { name, attending, message } = req.body;
  if (!name || !name.toString().trim()) {
    return res.status(400).json({ detail: 'Họ và tên không được để trống' });
  }

  const trimmedName = name.toString().trim();
  const trimmedMessage = message?.toString().trim();
  const finalMessage = trimmedMessage && trimmedMessage.length > 0 ? trimmedMessage : null;
  const createdAt = new Date().toISOString();

  try {
    const result = await runAsync(
      'INSERT INTO rsvps (name, attending, message, created_at) VALUES (?, ?, ?, ?)',
      [trimmedName, attending ? 1 : 0, finalMessage, createdAt]
    );

    res.status(201).json({
      id: result.lastID,
      name: trimmedName,
      attending: Boolean(attending),
      message: finalMessage,
      created_at: createdAt
    });
  } catch (err) {
    console.error('Insert RSVP error:', err);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

app.get('/api/rsvp', async (req, res) => {
  try {
    const rows = await allAsync(
      'SELECT id, name, attending, message, created_at FROM rsvps ORDER BY datetime(created_at) DESC'
    );
    res.json(rows.map((row) => ({
      ...row,
      attending: Boolean(row.attending)
    })));
  } catch (err) {
    console.error('Query RSVPs error:', err);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Express RSVP API listening on http://localhost:${port}`);
});
