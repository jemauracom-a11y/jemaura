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

// Default route
app.get("/", (req, res) => {
  res.send("Jemaura backend is running 🚀");
});

// Products API route
app.get("/api/products", (req, res) => {
  const products = [
    { id: 1, name: "Classic Cotton Shirt", price: 499 },
    { id: 2, name: "Denim Jeans", price: 999 },
    { id: 3, name: "Sneakers", price: 1499 },
    { id: 4, name: "Wrist Watch", price: 1999 },
    { id: 5, name: "Sunglasses", price: 799 },
  ];
  res.json(products);
});

// Users API route (example)
app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Ajay", email: "ajay@example.com" },
    { id: 2, name: "Priya", email: "priya@example.com" },
  ];
  res.json(users);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});