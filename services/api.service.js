import axios from 'axios';
import { getUrlValue, TOKEN_DICTIONARY } from './storage.service.js';


 async function getParser(){
	const url = process.env.URL ?? await getUrlValue(TOKEN_DICTIONARY.url);
	if (!url) {
		throw new Error('Не задан URL, задайте его через команду -u [URL]');
	}
	const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
		params: {
			appid: token,
			lang: 'ru',
			units: 'metric'
		}
	});
	return data;
};

export { getParser};