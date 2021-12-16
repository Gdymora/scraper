const playwright = require('playwright');
    async function mostActive() {
        const browser = await playwright.chromium.launch({
            headless: true // set this to true
        });
        
        const page = await browser.newPage();
        await page.goto('https://finance.yahoo.com/most-active?count=100');
        const mostActive = await page.$eval('#fin-scr-res-table tbody', tableBody => {
            let all = []
            for (let i = 0, row; row = tableBody.rows[i]; i++) {
                let stock = [];
                for (let j = 0, col; col = row.cells[j]; j++) {
                    stock.push(row.cells[j].innerText)
                }
                all.push(stock)
            }
            return all;
        });
        
        console.log('Most Active', mostActive);
        await page.waitForTimeout(30000); // wait
        await browser.close();
    }
    
    mostActive();
    const options = {
        path: 'clipped_screenshot.png',
        fullPage: false,
        clip: {
          x: 5,
          y: 60,
          width: 240,
          height: 40
        }
    }
    
    async function takeScreenShots() {
        const browser = await playwright.chromium.launch({
            headless: true // set this to true
        });
        const page = await browser.newPage()
        await page.setViewportSize({ width: 1280, height: 800 }); // set screen shot dimention
        await page.goto('https://finance.yahoo.com/')
        await page.screenshot(options)
        await browser.close()
    }
    takeScreenShots()