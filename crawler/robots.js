import robotsParser from "robots-parser";
import axios from "axios";

const cache = {};

export async function isAllowed(url, userAgent = "*") {
  try {
    const { origin } = new URL(url);
    if (cache[origin]) {
      return cache[origin].isAllowed(url, userAgent);
    }

    const robotsUrl = `${origin}/robots.txt`;
    const { data } = await axios.get(robotsUrl, { timeout: 5000 });
    const parser = robotsParser(robotsUrl, data);
    cache[origin] = parser;

    return parser.isAllowed(url, userAgent);
  } catch (err) {
    return true; // Fail open if robots.txt is missing or broken
  }
}
