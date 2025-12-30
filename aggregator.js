// aggregator.js
// Aggregates outputs from all scrapers and writes to a single JSON file

import { exec } from "child_process";
import fs from "fs";

// List of scraper scripts to run (relative to workspace root)
const scrapers = [
  "amazon-scappers/scrapper1.js",
  "amazon-scappers/scrapper2.js",
  "amazon-scappers/scrapper3.js",
  "amazon-scappers/scrapper4.js",
  "amazon-scappers/scrapper5.js",
  "amazon-scappers/scrapper6.js",
  "flipkart-scrappers/scrapper1.js",
  "flipkart-scrappers/scrapper2.js",
  "flipkart-scrappers/scrapper3.js",
  "bigbasket-scraper/scraper1.js",
];

async function runScraper(script) {
  return new Promise((resolve, reject) => {
    exec(
      `node ${script}`,
      { maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running ${script}:`, error);
          return resolve([]); // Continue even if one fails
        }
        try {
          // Try to parse JSON output from scraper
          const match = stdout.match(/\[.*\]|\{.*\}/s);
          if (match) {
            const data = JSON.parse(match[0]);
            resolve(data);
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      }
    );
  });
}

async function aggregate() {
  let allProducts = [];
  for (const script of scrapers) {
    const products = await runScraper(script);
    if (Array.isArray(products)) {
      allProducts = allProducts.concat(products);
    } else if (products) {
      allProducts.push(products);
    }
  }
  fs.writeFileSync(
    "all_products_output.json",
    JSON.stringify(allProducts, null, 2)
  );
  console.log("Aggregated output written to all_products_output.json");
}

aggregate();
