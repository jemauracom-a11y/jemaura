const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000; // ✅ important for Render

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // frontend files

// Database connection
const db = new sqlite3.Database("./jemaura.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite DB");
  }
});

// Example route
app.get("/", (req, res) => {
  res.send("Jemaura backend is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
