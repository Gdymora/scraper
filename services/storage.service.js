import { homedir } from 'os';
import {
    join, basename, dirname, extname, relative,
    isAbsolute, resolve, sep
} from 'path';
import { promises } from 'fs';

const filePath = join(homedir(), 'parser-url.json');

const TOKEN_DICTIONARY = {
    url: 'url'
}

async function saveUrlValue(key, value) {
    /*    console.log(basename(filePath));
       console.log(dirname(filePath));
       console.log(extname(filePath));
       console.log(relative(filePath, dirname(filePath)));
       console.log(isAbsolute(filePath));
       console.log(resolve('..'));
       console.log(sep); */

    let data = {};
    if (await isExist(filePath)) {
        const file = await promises.readFile(filePath);
        data = JSON.parse(file);
    }

    data[key] = value;
    await promises.writeFile(filePath, JSON.stringify(data));
}

async function getUrlValue(key) {
    if (await isExist(filePath)) {
        const file = await promises.readFile(filePath);
        const data = JSON.parse(file);
        return data[key];
    }
    return undefined
}
async function isExist(path) {
    try {
        await promises.stat(path); 
        return true;
    } catch (e) {
        return false;
    }

}

export { saveUrlValue, getUrlValue, TOKEN_DICTIONARY };