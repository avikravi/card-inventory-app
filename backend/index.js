const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 1. MIDDLEWARE
// Updated CORS to allow both local development and your live Vercel app
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-vercel-app-name.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// 2. DATABASE CONNECTION
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

// 3. HEALTH CHECK (Visit http://localhost:3001/ to test)
app.get("/", (req, res) => {
  res.send("Vault Server is ONLINE");
});

// --- API ROUTES ---

// GET ALL CARDS
app.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cards ORDER BY id DESC");
    res.json({ data: result.rows });
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Could not fetch cards from database" });
  }
});

// INTAKE NEW CARD
app.post("/api/cards", async (req, res) => {
  const {
    card_id,
    first_name,
    last_name,
    card_name,
    year,
    set_name,
    card_number,
    purchase_price,
    image_url,
    is_rookie,
    category,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO cards (
        card_id, first_name, last_name, card_name, year, 
        set_name, card_number, purchase_price, image_url, 
        is_rookie, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        card_id,
        first_name,
        last_name,
        card_name,
        year,
        set_name,
        card_number,
        purchase_price,
        image_url,
        is_rookie,
        category,
      ],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Intake Error:", err.message);
    res.status(500).send("Server Error during intake");
  }
});

// RECORD SALE (Updates Card + Logs Ledger)
app.put("/api/cards/:id", async (req, res) => {
  const { id } = req.params;
  const {
    is_sold,
    sold_price,
    ebay_fees,
    ad_fee,
    shipping_cost,
    packaging_material_cost,
    net_profit,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update the card status
    await client.query(
      "UPDATE cards SET is_sold = $1, sold_price = $2 WHERE card_id = $3",
      [is_sold, sold_price, id],
    );

    // Create the transaction record
    await client.query(
      `INSERT INTO sales_transactions (
        card_id, ebay_sale_price, ebay_fees, ad_fee, 
        shipping_cost, packaging_material_cost, net_profit
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        sold_price,
        ebay_fees,
        ad_fee,
        shipping_cost,
        packaging_material_cost,
        net_profit,
      ],
    );

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Sale Error:", err.message);
    res.status(500).json({ error: "Transaction failed" });
  } finally {
    client.release();
  }
});

// ACCOUNTING SUMMARY
app.get("/api/sales-report", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(net_profit), 0) as total_profit, 
        COALESCE(SUM(ebay_fees + ad_fee), 0) as total_fees,
        COUNT(*) as total_sales
      FROM sales_transactions
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Report Error:", err.message);
    res.status(500).send("Report Error");
  }
});

const PORT = process.env.PORT || 3001; // Force it to 3001 locally
app.listen(PORT, () => {
  console.log(`Vault Server running on port ${PORT}`);
});
