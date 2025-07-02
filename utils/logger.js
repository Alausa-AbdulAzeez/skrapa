const startTime = Date.now();
let crawledCount = 0;
let skippedCount = 0;
let errorCount = 0;

export function increment(type = "crawled") {
  if (type === "crawled") crawledCount++;
  if (type === "skipped") skippedCount++;
  if (type === "error") errorCount++;
}

export function printStatus(queueLength) {
  const now = Date.now();
  const elapsedSec = ((now - startTime) / 1000).toFixed(1);
  const rate = (crawledCount / elapsedSec).toFixed(2);

  // console.clear();
  console.log(`Crawl Stats`);
  console.log(`--------------------------`);
  console.log(`Time elapsed:  ${elapsedSec}s`);
  console.log(`Pages crawled:  ${crawledCount}`);
  console.log(`Skipped URLs:   ${skippedCount}`);
  console.log(`Errors:         ${errorCount}`);
  console.log(`Queue length:   ${queueLength}`);
  console.log(`Pages/sec:      ${rate}`);
  console.log(`--------------------------\n`);
}
