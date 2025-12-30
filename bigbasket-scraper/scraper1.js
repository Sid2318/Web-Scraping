import puppeteer from "puppeteer";

const categories = [
  { name: "MILK", url: "https://www.bigbasket.com/ps/?q=milk" },
  { name: "FRUITS", url: "https://www.bigbasket.com/ps/?q=fruits" },
  { name: "VEGETABLES", url: "https://www.bigbasket.com/ps/?q=vegetables" },
];

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const cat of categories) {
    console.log(`\n🔹 Scraping GROCERIES → ${cat.name}`);

    await page.goto(cat.url, { waitUntil: "networkidle2" });

    // wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 3000));


    const products = await page.$$eval('a[href^="/pd/"]', items =>
  items.map(item => {
    const name = item.querySelector('h3')?.innerText || null;
    const quantity = item.querySelector('span')?.innerText || null;
    const price = item.querySelector('span.knDrlZ')?.innerText || null;
    const image = item.querySelector('img')?.src || null;
    const link = item.href || null;

    return { name, quantity, price, image, link };
  })
);


    console.log(`✅ Found ${products.length} products`);
    console.log(products);
  }

  await browser.close();
}

main();
