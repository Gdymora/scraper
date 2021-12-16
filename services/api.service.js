import axios from 'axios';
import { getUrlValue, TOKEN_DICTIONARY } from './storage.service.js';

import {chromium, webkit, firefox} from "playwright";

async function mostActive(url) {
	const browser = await chromium.launch({
		headless: true // set this to true
	});

	const page = await browser.newPage();
	await page.goto(url);
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

async function getParser() {
	const url = process.env.URL ?? await getUrlValue(TOKEN_DICTIONARY.url);
	if (!url) {
		throw new Error('Не задан URL, задайте его через команду -u [URL]');
	}
	const data = await mostActive(url);
	return data;
};

export { getParser };