import dotenv from "dotenv";
import PQueue from "p-queue";
import { fetchPage } from "./crawler/fetchPage.js";
import { parsePage } from "./crawler/parsePage.js";
import { saveToMongo } from "./storage/saveToMongo.js";
import { isVisited, markVisited } from "./queue/visited.js";
import { increment, printStatus } from "./utils/logger.js";

dotenv.config();

const startUrl = process.env.START_URL;
const maxPages = parseInt(process.env.MAX_PAGES, 10);
const concurrency = parseInt(process.env.CONCURRENCY, 10);

const queue = new PQueue({ concurrency }); // ❶ worker pool
let crawlQueue = [startUrl]; // FIFO for BFS
let crawled = 0;

async function crawlUrl(url) {
  if (isVisited(url) || crawled >= maxPages) {
    increment("skipped");
    return;
  }

  console.log(`🔗  ${url}`);
  try {
    const html = await fetchPage(url);
    const { title, text, links } = parsePage(html, url);
    await saveToMongo({ url, title, text });

    markVisited(url);
    crawled += 1;
    increment("crawled");

    // BFS: enqueue new links at tail
    links.forEach((link) => {
      if (!isVisited(link) && crawlQueue.length < maxPages) {
        crawlQueue.push(link);
      }
    });
  } catch (err) {
    increment("error");
    console.error(`❌  ${url}  →`, err.message);
  }
}

(async () => {
  while (crawlQueue.length && crawled < maxPages) {
    const nextUrl = crawlQueue.shift(); // FIFO == BFS
    queue.add(() => crawlUrl(nextUrl)); // ❷ feed worker
    if (queue.size === 0 && queue.pending === 0) break; // safety
    await queue.onIdle(); // wait until all workers done
  }
  console.log(`\n✅  Finished. Total pages crawled: ${crawled}\n`);
  printStatus(crawlQueue.length);
  process.exit(0);
})();
