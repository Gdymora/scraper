#!/usr/bin/env node
import { getArgs } from './helpers/args.js';
import { getParser } from './services/api.service.js';
import { printHelp, printSuccess, printError, printParser } from './services/log.service.js';
import { saveUrlValue, TOKEN_DICTIONARY, getUrlValue } from './services/storage.service.js';

/* https://openweathermap.org/api */
const saveURL = async (url) => {
    if (!url.length) {
        printError('Не передан url');
        return;
    }
    try {
        await saveUrlValue(TOKEN_DICTIONARY.url, url);
        printSuccess('Url сохранён');
    } catch (e) {
        printError(e.message);
    }
}


const getForcast = async () => {
    try {
        console.log('start');
        const url = process.env.URL ?? await getUrlValue(TOKEN_DICTIONARY.url);
        const parser = await getParser(url);
        printParser(parser);
    } catch (e) {
        if (e?.response?.status == 404) {
            printError('Неверно указан город');
        } else if (e?.response?.status == 401) {
            printError('Неверно указан токен');
        } else {
            printError(e.message);
        }
    }
}

const initCLI = () => {
    const args = getArgs(process.argv);
    if (args.h) {
        return printHelp();
    }
    if (args.u) {
        return saveURL(args.u);
    }
    return getForcast();
};

initCLI();