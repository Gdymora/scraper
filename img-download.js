import { chromium} from 'playwright';
import { writeFileSync} from 'fs'; 
import axios from 'axios';

class Download {
    async  getImg() {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto("https://danube-webshop.herokuapp.com");
        const url = await page.$eval("img", (el) => el.src);

        const response = await  axios.get(url);
       writeFileSync("scraped-image.svg", response.data);

        await browser.close();
    }

    async getGson(){
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
}

const down = new Download();
down.getImg();
down.getGson();


