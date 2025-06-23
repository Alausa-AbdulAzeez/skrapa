const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
let pages;

const initDb = async () => {
  // Only connect once
  if (!pages) {
    await client.connect();
    const db = client.db("webcrawler");
    pages = db.collection("pages");
  }
};

const saveToMongo = async ({ url, title, text }) => {
  await initDb();
  await pages.insertOne({ url, title, text, crawledAt: new Date() });
};

module.exports = { saveToMongo };
