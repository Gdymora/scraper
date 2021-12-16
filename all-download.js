import { chromium, webkit} from 'playwright';
async function downloadSite() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://books.toscrape.com/');
    const books = await page.$$eval('.product_pod', all_items => {
        const data = [];       
        all_items.forEach(book => {
            const name = book.querySelector('h3').innerText;
            const price = book.querySelector('.price_color').innerText;
            const stock = book.querySelector('.availability').innerText;
            data.push({ name, price, stock });
        });
        return data;
    });
    console.log(books);
}

async function contentSite(){
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', console.log);
  
    await page.goto('http://whatsmyuseragent.org/', {
      waitUntil: 'networkidle',
    });
  
    const html = await page.content();
    console.log(html);
  
    await browser.close();
  }

  async function domSite(){
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', console.log);
    try {
      await page.goto('https://github.com/gdymora?tab=repositories', {
        waitUntil: 'networkidle',
      });
      await page.waitForSelector('#user-repositories-list li');
  
      const repos = await page.evaluate(() => {
        let links = document.querySelectorAll('#user-repositories-list li h3 a');
        return Array.from(links).map((link) => ({
          name: link.innerHTML.trim(),
          href: link.href,
        }));
      });
  
      console.table(repos);
    } catch (error) {
      console.log(error);
    }
  
    await browser.close();
  }

  async function imagesSite(){
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', console.log);
    try {
      await page.goto('https://github.com/gdymora?tab=repositories', {
        waitUntil: 'networkidle',
      });
      await page.waitForSelector('#user-repositories-list li');
  
      const repos = await page.evaluate(() => {
        let links = document.querySelectorAll('#user-repositories-list li h3 a');
        return Array.from(links).map((link) => ({
          name: link.innerHTML.trim(),
          href: link.href,
        }));
      });
  
      console.table(repos);
    } catch (error) {
      console.log(error);
    }
  
    await browser.close();
  }

//await downloadSite();
//await contentSite();
await domSite();