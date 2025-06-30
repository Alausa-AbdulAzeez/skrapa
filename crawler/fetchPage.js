import axios from "axios";
import dotenv from "dotenv";
import { sleep } from "../utils/sleep.js";

dotenv.config();

const delay = parseInt(process.env.REQUEST_DELAY_MS, 10);
const maxRetries = parseInt(process.env.MAX_RETRIES, 10);

export const fetchPage = async (url) => {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "MyNodeCrawlerBot/1.0" },
        timeout: 10_000,
      });
      await sleep(delay); // politeness delay
      return data; // success
    } catch (err) {
      attempt += 1;
      if (attempt > maxRetries) throw err; // give up
      console.log(`↻ Retry ${attempt}/${maxRetries} for ${url}`);
      await sleep(1_000); // back-off
    }
  }
};
