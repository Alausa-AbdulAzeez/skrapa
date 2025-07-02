import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const dbName = "webcrawler";
const uri = process.env.MONGO_URI;
let client;
let pages;
let db;

const initDb = async () => {
  if (db) return { db, pages }; // reuse if already connected

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    pages = db.collection("pages");

    // Ensure URL is unique
    await pages.createIndex({ url: 1 }, { unique: true });
    await pages.createIndex({ title: "text", text: "text" });

    console.log("Connected to MongoDB");
    return { db, pages };
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
};

export const saveToMongo = async ({ url, title, text }) => {
  await initDb();
  try {
    await pages.insertOne({ url, title, text, crawledAt: new Date() });
  } catch (err) {
    if (err.code === 11000) {
      console.warn(`⚠️ Duplicate URL skipped: ${url}`);
    } else {
      console.log("DB Error", err?.mwssage);
      throw err;
    }
  }
};

export const closeDb = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    pages = null;
    console.log("🔌 Disconnected from MongoDB");
  }
};
