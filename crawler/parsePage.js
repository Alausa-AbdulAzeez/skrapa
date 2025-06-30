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
      if (fullUrl.startsWith(baseUrl)) {
        links.push(fullUrl);
      }
    } catch {}
  });

  return { title, text: bodyText, links };
}
