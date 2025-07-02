import dotenv from "dotenv";
import PQueue from "p-queue";
import { fetchPage } from "./crawler/fetchPage.js";
import { parsePage } from "./crawler/parsePage.js";
import { closeDb, saveToMongo } from "./storage/saveToMongo.js";
import { isVisited, markVisited } from "./queue/visited.js";
import { increment, printStatus } from "./utils/logger.js";
import { isAllowed } from "./crawler/robots.js";

dotenv.config();

const startUrl = process.env.START_URL;
const maxPages = parseInt(process.env.MAX_PAGES, 10);
const concurrency = parseInt(process.env.CONCURRENCY, 10);

const queue = new PQueue({ concurrency }); // worker pool
let crawlQueue = [{ url: startUrl, depth: 0 }]; // FIFO for BFS
const maxDepth = 3;
let crawled = 0;

async function crawlUrl({ url, depth }) {
  console.log("INDEX.JS", url);
  if (isVisited(url) || crawled >= maxPages) {
    increment("skipped");
    return;
  }

  const allowed = await isAllowed(url, "MyNodeCrawlerBot/1.0");
  if (!allowed) {
    console.log(`🚫 Blocked by robots.txt: ${url}`);
    increment("skipped");
    return;
  }

  console.log(`🔗  ${url}`);
  try {
    const html = await fetchPage(url, depth);
    const { title, text, links } = parsePage(html, url);
    await saveToMongo({ url, title, text });

    markVisited(url);
    crawled += 1;
    increment("crawled");

    // BFS: enqueue new links at tail
    links.forEach((link) => {
      if (!isVisited(link) && crawlQueue.length < maxPages) {
        crawlQueue.push({ url: link, depth: depth + 1 });
      }
    });
  } catch (err) {
    increment("error");
    console.error(`❌  ${url}  →`, err.message);
  }
}

(async () => {
  while (crawlQueue.length && crawled < maxPages) {
    const { url, depth } = crawlQueue.shift(); // FIFO == BFS
    queue.add(() => crawlUrl({ url, depth })); //  feed worker
    if (queue.size === 0 && queue.pending === 0) break; // safety
    await queue.onIdle(); // wait until all workers done
  }
  console.log(`\n✅  Finished. Total pages crawled: ${crawled}\n`);
  printStatus(crawlQueue.length);
  await closeDb();
  process.exit(0);
})();
