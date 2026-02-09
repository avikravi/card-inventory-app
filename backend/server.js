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
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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

// POST - Add new card
app.post("/api/cards", async (req, res) => {
  try {
    const {
      card_name,
      year,
      set_name,
      card_number,
      team_city,
      team_name,
      is_rookie,
      purchase_price,
      image_url,
      ebay_url,
    } = req.body;

    const lastCardResult = await pool.query(
      "SELECT card_id FROM baseball_cards ORDER BY card_id DESC LIMIT 1",
    );

    let nextNumber = 1;
    if (lastCardResult.rows.length > 0) {
      const lastId = lastCardResult.rows[0].card_id;
      const lastNumber = parseInt(lastId.split("-")[1]);
      nextNumber = lastNumber + 1;
    }

    const newCardId = `BSB-${String(nextNumber).padStart(8, "0")}`;

    const result = await pool.query(
      `INSERT INTO baseball_cards (card_id, card_name, year, set_name, card_number, team_city, team_name, is_rookie, purchase_price, image_url, ebay_url, is_sold, created)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        newCardId,
        card_name,
        year,
        set_name,
        card_number,
        team_city,
        team_name,
        is_rookie,
        purchase_price,
        image_url,
        ebay_url,
      ],
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding card:", err);
    res.status(500).json({
      success: false,
      error: "Failed to add card",
    });
  }
});

// PATCH - Update existing card
app.patch("/api/cards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      card_name,
      year,
      set_name,
      card_number,
      team_city,
      team_name,
      is_rookie,
      purchase_price,
      sold_price,
      is_sold,
      sold_date,
      image_url,
      ebay_url,
    } = req.body;

    const result = await pool.query(
      `UPDATE baseball_cards 
       SET card_name = $1, year = $2, set_name = $3, card_number = $4, 
           team_city = $5, team_name = $6, is_rookie = $7, purchase_price = $8, 
           sold_price = $9, is_sold = $10, sold_date = $11, image_url = $12, ebay_url = $13
       WHERE card_id = $14
       RETURNING *`,
      [
        card_name,
        year,
        set_name,
        card_number,
        team_city,
        team_name,
        is_rookie,
        purchase_price,
        sold_price,
        is_sold,
        sold_date,
        image_url,
        ebay_url,
        id,
      ],
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating card:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update card",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Cards API available at http://localhost:${PORT}/api/cards`);
});
