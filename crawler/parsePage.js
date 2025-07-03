import * as cheerio from "cheerio";
import { URL } from "url";
import { normalizeUrl } from "../utils/utils.js";

export function parsePage(html, baseUrl) {
  const $ = cheerio.load(html);
  const title = $("title").text().trim();
  const bodyText = $("body").text().replace(/\s+/g, " ").slice(0, 500);

  const links = [];
  $("a[href]").each((_, el) => {
    let href = $(el).attr("href");
    try {
      const fullUrl = new URL(href, baseUrl).href;
      const cleanUrl = normalizeUrl(fullUrl);
      if (cleanUrl.startsWith(baseUrl)) {
        links.push(cleanUrl);
      }
    } catch (error) {
      console.log(error);
    }
  });

  return { title, text: bodyText, links };
}
