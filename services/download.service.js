import { chromium, webkit, firefox } from "playwright";
import { get } from "https";
import { createWriteStream } from 'fs';

const pageWithFiles = 'https://file-examples.com/index.php/sample-video-files/sample-avi-files-download/';
const reliablePath = 'my-file.avi';

async function downloadEd() {
    const browser = await chromium.launch();
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    await page.goto(pageWithFiles);
    const hrefs = await page.$$eval('.download-button', els => els.map(el => el.href));
    hrefs.forEach((href, index) => {
        const filePath = `${reliablePath}-${index}`;
        const file = createWriteStream(filePath);
        file.on('pipe', (src) => console.log(`${filePath} started`));
        file.on('finish', (src) => console.log(`${filePath} downloaded`));
       get(href, function (response) {
            response.pipe(file);
        });
    });
    await browser.close();
}

export { downloadEd };