import { URL } from "url";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hash = ""; // remove #fragment
    url.searchParams.sort(); // consistent param order
    return url.toString();
  } catch {
    return rawUrl;
  }
}
