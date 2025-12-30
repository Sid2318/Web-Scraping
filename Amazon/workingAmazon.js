import puppeteer from 'puppeteer';

// URL of the Amazon search page for mobiles
const URL = 'https://www.amazon.in/s?k=mobiles';

async function scrapeAmazon() {
  // Launch a headless browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set realistic HTTP headers to mimic a real user
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-IN,en;q=0.9' });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
  );

  // Navigate to the Amazon search page
  await page.goto(URL, { waitUntil: 'networkidle2' });

  // Evaluate the page content and scrape product data
  const products = await page.evaluate(() => {
    // Select all product elements on the page (top 10 only)
    const productElements = Array.from(
      document.querySelectorAll('div[data-component-type="s-search-result"]')
    ).slice(0, 10);

    // Extract required details for each product
    return productElements.map(el => {
      const title = el.querySelector('h2 span')?.innerText || ''; // Product title

      // Try to get the direct link to the product page
      let link = el.querySelector('h2 a')?.href || '';

      // Fallback: if link is empty, create a search-based Amazon link using the product title
      if (!link && title) {
        link = 'https://www.amazon.in/s?k=' + encodeURIComponent(title);
      }

      const image = el.querySelector('img.s-image')?.src || ''; // Product image URL

      // Get the discounted price (if any)
      const discountedPrice = el.querySelector('.a-price .a-offscreen')?.innerText || '';

      // Get the original price if discounted, otherwise use discountedPrice
      const originalPrice =
        el.querySelector('.a-price.a-text-price .a-offscreen')?.innerText || discountedPrice;

      // Return an object containing all the scraped information
      return { title, link, image, discountedPrice, originalPrice };
    });
  });

  // Log the scraped products
  console.log('SCRAPED PRODUCTS 👇');
  console.log(products);

  // Close the browser
  await browser.close();
}

// Call the function to run the scraper
scrapeAmazon();
