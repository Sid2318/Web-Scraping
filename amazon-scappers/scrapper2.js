import puppeteer from "puppeteer";

const URL = "https://www.amazon.in/s?k=grocery"; // Change to any grocery search URL

async function scrapeGrocery() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({ "Accept-Language": "en-IN,en;q=0.9" });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
  );

  await page.goto(URL, { waitUntil: "networkidle2" });
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const products = await page.evaluate(() => {
    const productElements = Array.from(
      document.querySelectorAll('div[data-component-type="s-search-result"]')
    ); // Top 10 products

    return productElements.map((el) => {
      const name = el.querySelector("h2 span")?.innerText || "";
      let link = el.querySelector("h2 a")?.href || "";
      if (!link && name)
        link = "https://www.amazon.in/s?k=" + encodeURIComponent(name);

      const image = el.querySelector("img.s-image")?.src || "";
      const discountedPriceText =
        el.querySelector(".a-price .a-offscreen")?.innerText || "";
      const actualPriceText =
        el.querySelector(".a-price.a-text-price .a-offscreen")?.innerText ||
        discountedPriceText;

      // Calculate discount percentage
      let discount = "0%";
      if (discountedPriceText && actualPriceText) {
        const cleanDiscounted = parseFloat(
          discountedPriceText.replace(/[^0-9.]/g, "")
        );
        const cleanActual = parseFloat(actualPriceText.replace(/[^0-9.]/g, ""));
        if (cleanActual && cleanDiscounted && cleanActual > cleanDiscounted) {
          discount =
            Math.round(((cleanActual - cleanDiscounted) / cleanActual) * 100) +
            "%";
        }
      }

      // Details (highlights) if available
      const details = Array.from(
        el.querySelectorAll(".a-row.a-size-small span")
      )
        .map((span) => span.innerText)
        .slice(0, 5);

      const quantity = "N/A";

      return {
        category: "grocery",
        subcategory: "groceries",
        website: "amazon",
        name,
        image,
        quantity,
        actualPrice: actualPriceText,
        discountedPrice: discountedPriceText,
        discount,
        details,
        link,
      };
    });
  });

  // Output as JSON for aggregator
  console.log(JSON.stringify(products, null, 2));

  await browser.close();
}

scrapeGrocery();
