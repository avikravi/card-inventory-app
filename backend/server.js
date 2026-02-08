// Load environment variables
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error connecting to database:", err.stack);
  }
  console.log("✓ Connected to PostgreSQL database");
  release();
});

// API Routes

// GET all baseball cards
app.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM baseball_cards ORDER BY card_id",
    );
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching cards:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch cards",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Cards API available at http://localhost:${PORT}/api/cards`);
});
