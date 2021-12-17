import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import axios from 'axios';

class Download {

  async domSite() {
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

  async getImgParser(urlGet) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', console.log);

    try {
      await page.goto(urlGet);
      const content = await page.evaluate(() => {
        let data = [];
        let books = document.querySelectorAll(".isv-r");
        books.forEach((book) => {
          let title = book.innerHTML.trim();
          //  let href = book.querySelector("a");
          let href = book.querySelector(".islir").innerHTML;
          src = href.replace(/.*?:\/\//g, "");

          data.push({
            title,
            href,
            src
          });
        });
        return data;
      });
      const jsonData = JSON.stringify(content);
      writeFileSync("./storage/books.json", jsonData);
    } catch (error) {
      console.log(error);
    }
    await browser.close();
  }

  async scanerImg(urlGet) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(urlGet);

    // Get all the entries on the page with a CSS selector in this case identified
    // by the class name.
    const entries = await page.$$('.isv-r');

    for (let i = 0; i < entries.length; i++) {
      // Query for the next title element on the page
      const title = await entries[i].$('a');
      // Write the entry to the console
      console.log(`${i + 1}: ${await title.innerHTML()}`);
    }

    await page.screenshot({ path: './storage/Y-Combinator.png' });
    await browser.close();
  }

  async getImg() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto("https://danube-webshop.herokuapp.com");
    const url = await page.$eval("img", (el) => el.src);

    const response = await axios.get(url);
    writeFileSync("scraped-image.svg", response.data);

    await browser.close();
  }

  async getGson() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto("https://danube-webshop.herokuapp.com");
    const content = await page.evaluate(() => {
      let data = [];

      let books = document.querySelectorAll(".preview");
      books.forEach((book) => {
        let title = book.querySelector(".preview-title").innerText;
        let author = book.querySelector(".preview-author").innerText;
        let price = book.querySelector(".preview-price").innerText;
        data.push({
          title,
          author,
          price,
        });
      });
      return data;
    });

    const jsonData = JSON.stringify(content);
    writeFileSync("books.json", jsonData);
    await browser.close();
  }
  async scaner() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://news.ycombinator.com');

    // Get all the entries on the page with a CSS selector in this case identified
    // by the class name.
    const entries = await page.$$('.athing');

    for (let i = 0; i < entries.length; i++) {
      // Query for the next title element on the page
      const title = await entries[i].$('td.title > a');
      // Write the entry to the console
      console.log(`${i + 1}: ${await title.innerText()}`);
    }

    await page.screenshot({ path: 'Y-Combinator.png' });
    await browser.close();
  }

  async xpath() {
    const browser = await chromium.launch({
      headless: false
    });

    const page = await browser.newPage();
    await page.goto('https://stackoverflow.blog/');
    const xpathData = await page.$eval('xpath=//html/body/div/header/nav',
      navElm => {
        let refs = []
        let atags = navElm.getElementsByTagName("a");
        for (let item of atags) {
          refs.push(item.href);
        }
        return refs;
      });

    console.log('StackOverflow Links', xpathData);
    await page.waitForTimeout(5000); // wait
    await browser.close();
  }

  async formExample() {
    const browser = await chromium.launch({
      headless: false
    });

    const page = await browser.newPage();
    await page.goto('https://github.com/login');
    // Interact with login form
    await page.fill('input[name="login"]', "MyUsername");
    await page.fill('input[name="password"]', "Secrectpass");
    await page.click('input[type="submit"]');
  }

}

const down = new Download();
//down.scanerImg('https://www.google.com/search?q=');
down.getImgParser('https://www.google.com/search?q=');
//down.formExample();
//down.getGson();


