import puppeteer from "puppeteer";

const flipkartCategories = [
  /* ===================== ELECTRONICS ===================== */
  {
    category: "electronics",
    subcategory: "mobiles",
    url: "https://www.flipkart.com/search?q=mobile",
    selectors: {
      item: "div.jIjQ8S",
      name: "div.RG5Slk",
      quantity: "div.let_it_be-1",
      actualPrice: "div.kRYCnD",
      discountedPrice: "div.hZ3P6w",
      discountDetail: "div.HQe8jr span",
      image: "img",
      details: "ul.HwRTzP li",
      link: "a.k7wcnx",
    },
  },
  {
    category: "electronics",
    subcategory: "laptops",
    url: "https://www.flipkart.com/search?q=laptop",
    selectors: {
      item: "div.jIjQ8S",
      name: "div.RG5Slk",
      quantity: "div.let_it_be-1",
      actualPrice: "div.kRYCnD",
      discountedPrice: "div.hZ3P6w",
      discountDetail: "div.HQe8jr span",
      image: "img",
      details: "ul.HwRTzP li",
      link: "a.k7wcnx",
    },
  },
  {
    category: "electronics",
    subcategory: "tablets",
    url: "https://www.flipkart.com/search?q=tablet",
    selectors: {
      item: "div.jIjQ8S",
      name: "div.RG5Slk",
      quantity: "div.let_it_be-1",
      actualPrice: "div.kRYCnD",
      discountedPrice: "div.hZ3P6w",
      discountDetail: "div.HQe8jr span",
      image: "img",
      details: "ul.HwRTzP li",
      link: "a.k7wcnx",
    },
  },
];

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const config of flipkartCategories) {
    console.log(
      `\n🔹 Scraping ${config.category.toUpperCase()} → ${config.subcategory.toUpperCase()}`
    );

    await page.goto(config.url, {
      timeout: 0,
      waitUntil: "networkidle0",
    });

    const products = await page.evaluate((config) => {
      const cleanPrice = (text) =>
        text ? parseInt(text.replace(/[₹,]/g, "")) : null;

      return Array.from(document.querySelectorAll(config.selectors.item))
        .map((item) => {
          const actualText =
            item.querySelector(config.selectors.actualPrice)?.innerText || null;
          const discountedText =
            item.querySelector(config.selectors.discountedPrice)?.innerText ||
            null;

          const actual = cleanPrice(actualText);
          const discounted = cleanPrice(discountedText);

          let discount = null;
          if (actual && discounted && actual > discounted) {
            discount = Math.round(((actual - discounted) / actual) * 100) + "%";
          }

          const linkEl = item.querySelector(config.selectors.link);
          const link = linkEl
            ? "https://www.flipkart.com" + linkEl.getAttribute("href")
            : null;

          // 🖼 IMAGE LOGIC
          const imgEl = item.querySelector(config.selectors.image);
          const image =
            imgEl?.getAttribute("src") ||
            imgEl?.getAttribute("data-src") ||
            null;

          // 📝 ADDITIONAL DETAILS (li inside a class)
          // Replace 'detailsClass' with the actual class containing <li> items
          const detailItems = config.selectors.details
            ? Array.from(item.querySelectorAll(config.selectors.details)).map(
                (li) => li.innerText.trim()
              )
            : [];

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
            details: detailItems.length > 0 ? detailItems : null,
            link,
          };
        })
        .filter((p) => p.name);
    }, config);

    console.log(`✅ Found ${products.length} products`);
    console.log(JSON.stringify(products, null, 2));
  }

  await browser.close();
}

main();
