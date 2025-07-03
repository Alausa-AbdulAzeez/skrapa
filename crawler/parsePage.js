import * as cheerio from "cheerio";
import { URL } from "url";

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
    } catch {}
  });

  return { title, text: bodyText, links };
}
