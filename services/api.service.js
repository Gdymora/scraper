import axios from 'axios';
import { getUrlValue, TOKEN_DICTIONARY } from './storage.service.js';

import { chromium, webkit, firefox } from "playwright";

async function mostActive(url) {
	const browser = await chromium.launch({
		headless: true // set this to true
	});

	const page = await browser.newPage();

	await page.goto(url);
	console.log('Most Active', page);
	/* let imgs = await page.$$eval('.J_ItemPic img[src]', imgs => imgs.map(img => img.src));
	console.log('Most Active', imgs); */
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

	//console.log('Most Active', mostActive);
	await page.waitForTimeout(30000); // wait
	await browser.close();
}


async function parsAmazon() {
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.on('request', (request) => {
   console.log(`Request: ${request.url()} to resource type: ${request.resourceType()}`);
});
await page.goto('https://amazon.com');

await browser.close();
}


async function parsGithub() {
	const browser = await chromium.launch({
		headless: false,
		devtools: true,
	});
	// Open a new page / tab in the browser.
	const page = await browser.newPage({
		bypassCSP: true, // This is needed to enable JavaScript execution on GitHub.
	});
	// Tell the tab to navigate to the GitHub Topics page.
	await page.goto('https://github.com/topics/javascript');
	// Click and tell Playwright to keep watching for more than
	// 30 repository cards to appear in the page.
	await page.click('text=Load more');
	await page.waitForFunction(() => {
		const repoCards = document.querySelectorAll('article.border');
		return repoCards.length > 30;
	});
	// Extract data from the page. Selecting all 'article' elements
	// will return all the repository cards we're looking for.
	const repos = await page.$$eval('article.border', (repoCards) => {
		return repoCards.map(card => {
			const [user, repo] = card.querySelectorAll('h3 a');
			const stars = card.querySelector('a.social-count');
			const description = card.querySelector('div.px-3 > p + div');
			const topics = card.querySelectorAll('a.topic-tag');

			const toText = (element) => element && element.innerText.trim();

			return {
				user: toText(user),
				repo: toText(repo),
				url: repo.href,
				stars: toText(stars),
				description: toText(description),
				topics: Array.from(topics).map((t) => toText(t)),
			};
		});
	});
	// Print the results. Nice!
	console.log(`We extracted ${repos.length} repositories.`);
	console.dir(repos);
	// Turn off the browser to clean up after ourselves.
	await browser.close();
}



async function getParser() {
	const url = process.env.URL ?? await getUrlValue(TOKEN_DICTIONARY.url);
	if (!url) {
		throw new Error('Не задан URL, задайте его через команду -u [URL]');
	}
	//const data = await mostActive(url);
	//const data = await parsGithub();
	const data = await parsAmazon();
	return data;
};

export { getParser };