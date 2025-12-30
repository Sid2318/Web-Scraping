import puppeteer from "puppeteer";

const flipkartCategories= [
  {
    category: "electronics",
    subcategory: "wearables",
    url: "https://www.flipkart.com/search?q=smartwatch",
    selectors: {
      item: "div[data-id]",
      name: "a.atJtCj",
      quantity: "div.not-available",
      actualPrice: "div.kRYCnD",
      discountedPrice: "div.hZ3P6w",
      discountDetail: "div.HQe8jr span",
      image: "img.MZeksS",
      details: "div.o_eY3O",
      link: "a.atJtCj",
    },
  },
  {
    category: "electronics",
    subcategory: "audio",
    url: "https://www.flipkart.com/search?q=headphones",
    selectors: {
      item: "div.RGLWAk",
      name: "a.pIpigb",
      quantity: "div.not-available",
      actualPrice: "div.kRYCnD",
      discountedPrice: "div.hZ3P6w",
      discountDetail: "div.HQe8jr span",
      image: "img.UCc1lI",
      details: "div.o_eY3O li",
      link: "a.pIpigb",
    },
  },
  {
    category: "electronics",
    subcategory: "cameras",
    url: "https://www.flipkart.com/search?q=camera",
    selectors: {
      item: "div.RGLWAk",
      name: "a.pIpigb",
      quantity: "div.IxWX8O",
      actualPrice: "div.kRYCnD",
      discountedPrice: "div.hZ3P6w",
      discountDetail: "div.HQe8jr span",
      image: "img.UCc1lI",
      details: "div.U_GKRr",
      link: "a.pIpigb",
    },
  },
  {
    category: "electronics",
    subcategory: "gaming",
    url: "https://www.flipkart.com/search?q=gaming",
    selectors: {
      item: "div.RGLWAk",
      name: "a.pIpigb",
      quantity: "div.not-available",
      actualPrice: "div.hZ3P6w",
      discountedPrice: "div.kRYCnD",
      discountDetail: "div.HQe8jr span",
      image: "img.UCc1lI",
      details: "div.U_GKRr",
      link: "a.pIpigb",
    },
  },
  {
    category: "electronics",
    subcategory: "accessories",
    url: "https://www.flipkart.com/search?q=mobile+accessories",
    selectors: {
      item: "div.RGLWAk",
      name: "a.pIpigb",
      quantity: "div.not-available",
      actualPrice: "div.hZ3P6w",
      discountedPrice: "div.kRYCnD",
      discountDetail: "div.HQe8jr span",
      image: "img.UCc1lI",
      details: "div.U_GKRr",
      link: "a.pIpigb",
    },
  },
];

async function scrapeCategory(config, page) {
  let products = [];
  let nextPage = config.url;

  while (nextPage) {
    await page.goto(nextPage, { waitUntil: "networkidle2", timeout: 0 });

    const newProducts = await page.evaluate((config) => {
      const cleanPrice = (text) =>
        text ? parseInt(text.replace(/[₹,]/g, "")) : null;

      return Array.from(document.querySelectorAll(config.selectors.item))
        .map((item) => {
          const actualText =
            item.querySelector(config.selectors.actualPrice)?.innerText || null;
          const discountedText =
            item.querySelector(config.selectors.discountedPrice)?.innerText ||
            null;

          let actual = cleanPrice(actualText);
          let discounted = cleanPrice(discountedText);

          // Calculate discount if not available
          let discount =
            item.querySelector(config.selectors.discountDetail)?.innerText ||
            null;
          if (!discount && actual && discounted && actual > discounted) {
            discount = Math.round(((actual - discounted) / actual) * 100) + "%";
          }

          // IMAGE
          const imgEl = item.querySelector(config.selectors.image);
          const image = imgEl?.src || imgEl?.getAttribute("data-src") || null;

          // DETAILS
          const detailsEl = item.querySelector(config.selectors.details);
          const details = detailsEl ? detailsEl.innerText.trim() : null;

          // LINK
          const linkEl = item.querySelector(config.selectors.link);
          const link = linkEl
            ? "https://www.flipkart.com" + linkEl.getAttribute("href")
            : null;

          return {
            category: config.category,
            subcategory: config.subcategory,
            website: 'flipkart',
            name: item.querySelector(config.selectors.name)?.innerText || null,
            image,
            quantity:
              item.querySelector(config.selectors.quantity)?.innerText ?? "N/A",
            actualPrice: actualText,
            discountedPrice: discountedText,
            discount,
            details,
            link,
            // actualPriceNumber: actual,
            // discountedPriceNumber: discounted,
          };
        })
        .filter((p) => p.name);
    }, config);

    products.push(...newProducts);

    // Check for next page
    const nextBtn = await page.$("a._1LKTO3");
    if (nextBtn) {
      nextPage = await page.evaluate((btn) => btn.href, nextBtn);
    } else {
      nextPage = null;
    }
  }

  return products;
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const config of flipkartCategories) {
    console.log(
      `\n🔹 Scraping ${config.category.toUpperCase()} → ${config.subcategory.toUpperCase()}`
    );

    const products = await scrapeCategory(config, page);

    console.log(`✅ Found ${products.length} products`);
    console.log(JSON.stringify(products, null, 2));
  }

  await browser.close();
}

main();
