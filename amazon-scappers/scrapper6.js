import puppeteer from "puppeteer";

const URL = "https://www.amazon.in/s?k=dairy";

async function scrapeDairy() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
  );

  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-IN,en;q=0.9",
  });

  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("div.s-result-item");

  const products = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll("div.s-result-item"));

    return items
      .map((el) => {
        const name = el.querySelector("h2 span")?.innerText || null;

        const image =
          el.querySelector("img.s-image")?.getAttribute("src") || null;

        const discountedPriceText =
          el.querySelector(".a-price-whole")?.innerText || null;

        const actualPriceText =
          el.querySelector(".a-text-price span")?.innerText || null;

        const linkSuffix = el.querySelector("h2 a")?.getAttribute("href") || "";
        const link = linkSuffix
          ? "https://www.amazon.in" + linkSuffix
          : "https://www.amazon.in/s?k=" + encodeURIComponent(name);

        // DETAILS (safe & real)
        const details = Array.from(
          el.querySelectorAll(".a-row.a-size-base div span")
        )
          .map((span) => span.innerText.trim())
          .filter(Boolean);

        // PRICE CLEANING
        const discountedPrice = discountedPriceText
          ? parseFloat(discountedPriceText.replace(/[^0-9]/g, ""))
          : null;

        const actualPrice = actualPriceText
          ? parseFloat(actualPriceText.replace(/[^0-9]/g, ""))
          : discountedPrice;

        // DISCOUNT CALCULATION
        let discount = null;
        if (actualPrice && discountedPrice && actualPrice > discountedPrice) {
          discount =
            Math.round(((actualPrice - discountedPrice) / actualPrice) * 100) +
            "%";
        }

        if (!name || !image) return null;

        return {
          category: "groceries",
          subcategory: "dairy",
          website: "amazon",
          name,
          image,
          quantity: null,
          actualPrice: actualPriceText,
          discountedPrice: discountedPriceText,
          discount,
          details,
          link,
        };
      })
      .filter(Boolean);
  });

  // Output as JSON for aggregator
  console.log(JSON.stringify(products, null, 2));

  await browser.close();
}

scrapeDairy();
