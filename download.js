import { chromium, firefox } from 'playwright';
import {  createWriteStream } from 'fs';
import axios from 'axios';

class Download {
  async domSite(urlGet) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    // метод newPage(), создает новый экземпляр страницы в браузере,
    console.log(`Navigating to ${urlGet}...`);
    //создали экземпляр страницы, /
    await page.goto(urlGet);
    // использовали метод page.goto() для перехода на домашнюю страницу 
    //waitForSelector ожидает, когда блок, содержащийся в переданом теги или классе,    
    await page.waitForSelector('.page_inner');
    // будет преобразован в DOM, после чего вы вызываете метод page.$$eval()
    let urls = await page.$$eval('section ol > li', links => {
      // Make sure the book to be scraped is in stock
      links = links.filter(link => link.querySelector('.instock.availability > i')
      .textContent !== "In stock")
      // Extract the links from the data
      links = links.map(el => el.querySelector('h3 > a').href)
      return links;
    });

    // Loop through each of those links, open a new page instance and get the relevant data from them
    let pagePromise = (link) => new Promise(async (resolve, reject) => {
      let dataObj = {};
      let newPage = await context.newPage();
      await newPage.goto(link);
      dataObj['bookTitle'] = await newPage.$eval('.product_main > h1', text => text.textContent);
      dataObj['bookPrice'] = await newPage.$eval('.price_color', text => text.textContent);
      dataObj['noAvailable'] = await newPage.$eval('.instock.availability', text => {
        // Strip new line and tab spaces
        text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
        // Get the number of stock available
        let regexp = /^.*\((.*)\).*$/i;
        let stockAvailable = regexp.exec(text)[1].split(' ')[0];
        return stockAvailable;
      });
      dataObj['imageUrl'] = await newPage.$eval('#product_gallery img', img => img.src);
      dataObj['bookDescription'] = await newPage.$eval('#product_description', div => div.nextSibling.nextSibling.textContent);
      dataObj['upc'] = await newPage.$eval('.table.table-striped > tbody > tr > td', table => table.textContent);
      resolve(dataObj);
      await newPage.close();
    });
    let currentPageData=[];

    for (let link in urls) {
      currentPageData.push(await pagePromise(urls[link]));
      console.log(currentPageData);
    }

    currentPageData.forEach((element, index) => {
      axios({
        method: 'get',
        url: element.imageUrl,
        responseType: 'stream'
      })
        .then(function (response) {
          response.data.pipe(createWriteStream('images/'+index+'something.jpg'));
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });
    });

    console.log(urls);
    await page.waitForTimeout(5000); // wait
    await browser.close();
  }

}
const down = new Download();
down.domSite('http://books.toscrape.com');
