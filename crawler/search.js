// search.js
import "dotenv/config";
import readline from "readline";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();

const db = client.db("webcrawler");
const pages = db.collection("pages");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("🔍 Enter search keyword: ", async (query) => {
  console.log(`\nSearching for: "${query}"\n`);

  // Basic MongoDB $text search
  const results = await pages
    .find({ $text: { $search: query } })
    .project({ title: 1, url: 1 })
    .limit(10)
    .toArray();

  if (results.length === 0) {
    console.log("❌ No results found.\n");
  } else {
    results.forEach((doc, i) => {
      console.log(`${i + 1}. 📄 ${doc.title}`);
      console.log(`   🔗 ${doc.url}\n`);
    });
  }

  rl.close();
  process.exit(0);
});
