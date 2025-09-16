const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const db = new sqlite3.Database('./jemaura.db', (err) => {
  if (err) console.error(err);
  else console.log('Connected to SQLite DB');
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price REAL,
  desc TEXT,
  image TEXT
)`);

// Routes
app.get('/', (req, res) => {
  res.send('Backend is working 🚀');
});

app.get('/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) res.status(500).json(err);
    else res.json(rows);
  });
});

app.post('/products', (req, res) => {
  const { name, price, desc, image } = req.body;
  db.run("INSERT INTO products (name, price, desc, image) VALUES (?,?,?,?)",
    [name, price, desc, image],
    function(err) {
      if (err) res.status(500).json(err);
      else res.json({ id: this.lastID, name, price, desc, image });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
