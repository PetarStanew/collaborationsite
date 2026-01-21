const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDb = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS outreach_entries (
      id SERIAL PRIMARY KEY,
      business_name TEXT,
      business_type TEXT,
      email TEXT,
      phone TEXT,
      address_url TEXT,
      collaborator TEXT,
      service_option TEXT,
      offer_status TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`
  );

  await pool.query(
    "ALTER TABLE outreach_entries ADD COLUMN IF NOT EXISTS service_option TEXT;"
  );
  await pool.query(
    "ALTER TABLE outreach_entries ADD COLUMN IF NOT EXISTS offer_status TEXT;"
  );
};

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/api/entries", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, business_name, business_type, email, phone, address_url, collaborator,
      service_option, offer_status, created_at
      FROM outreach_entries ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entries." });
  }
});

app.post("/api/entries", async (req, res) => {
  const {
    businessName = "",
    businessType = "",
    email = "",
    phone = "",
    addressUrl = "",
    collaborator = "",
    serviceOption = "",
    offerStatus = ""
  } = req.body || {};

  const hasData = [
    businessName,
    businessType,
    email,
    phone,
    addressUrl,
    collaborator,
    serviceOption,
    offerStatus
  ].some((value) => String(value).trim().length > 0);

  if (!hasData) {
    res.status(400).json({ error: "At least one field is required." });
    return;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO outreach_entries (
        business_name,
        business_type,
        email,
        phone,
        address_url,
        collaborator,
        service_option,
        offer_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, business_name, business_type, email, phone, address_url, collaborator,
      service_option, offer_status, created_at`,
      [
        businessName.trim(),
        businessType.trim(),
        email.trim(),
        phone.trim(),
        addressUrl.trim(),
        collaborator.trim(),
        serviceOption.trim(),
        offerStatus.trim()
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to save entry." });
  }
});

app.put("/api/entries/:id", async (req, res) => {
  const entryId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(entryId)) {
    res.status(400).json({ error: "Invalid entry id." });
    return;
  }

  const {
    businessName = "",
    businessType = "",
    email = "",
    phone = "",
    addressUrl = "",
    collaborator = "",
    serviceOption = "",
    offerStatus = ""
  } = req.body || {};

  const hasData = [
    businessName,
    businessType,
    email,
    phone,
    addressUrl,
    collaborator,
    serviceOption,
    offerStatus
  ].some((value) => String(value).trim().length > 0);

  if (!hasData) {
    res.status(400).json({ error: "At least one field is required." });
    return;
  }

  try {
    const { rows } = await pool.query(
      `UPDATE outreach_entries
      SET business_name = $1,
        business_type = $2,
        email = $3,
        phone = $4,
        address_url = $5,
        collaborator = $6,
        service_option = $7,
        offer_status = $8
      WHERE id = $9
      RETURNING id, business_name, business_type, email, phone, address_url, collaborator,
      service_option, offer_status, created_at`,
      [
        businessName.trim(),
        businessType.trim(),
        email.trim(),
        phone.trim(),
        addressUrl.trim(),
        collaborator.trim(),
        serviceOption.trim(),
        offerStatus.trim(),
        entryId
      ]
    );

    if (!rows.length) {
      res.status(404).json({ error: "Entry not found." });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update entry." });
  }
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

initDb()
  .then(() => {
    console.log("Database ready");
  })
  .catch((error) => {
    console.error("Database init failed", error);
  });
