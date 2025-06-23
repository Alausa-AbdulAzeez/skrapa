const { fetchPage } = require("./crawler/fetchPage");
const { parsePage } = require("./crawler/parsePage");
const dotenv = require("dotenv");
const { saveToMongo } = require("./storage/saveToMongo");
const { isVisited, markVisited } = require("./queue/visited");

dotenv.config();

const seedUrl = process.env.START_URL;
const maxPages = parseInt(process.env.MAX_PAGES);
let queue = [seedUrl];
let crawledCount = 0;

const startCrawler = async () => {
  while (queue.length > 0 && crawledCount < maxPages) {
    const url = queue.shift();
    if (isVisited(url)) continue;

    console.log(`Crawling: ${url}`);
    try {
      const html = await fetchPage(url);
      const { title, text, links } = parsePage(html, url);
      await saveToMongo({ url, title, text });

      markVisited(url);
      queue.push(...links.filter((link) => !isVisited(link)));
      crawledCount++;
    } catch (err) {
      console.error(`Error crawling ${url}:`, err.message);
    }
  }
};

startCrawler();
