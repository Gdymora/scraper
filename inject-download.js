// ця програма відкриває браузер і переходить на веб-сайт
// він активує три ярлики:
// * ctrl + y - зробити знімок поточного вікна перегляду браузера (зберегти як PNG)
// * ctrl + b - завантажити всі зображення на поточній сторінці - зберегти локально як файли зображень
// * ctrl + m - зберегти зображення в даний момент під вказівником миші - зберегти локально як файл зображення (примітка: наразі це працює лише тоді, коли зображення 
// під мишею є елементом IMG; не коли зображення завантажується через CSS або коли зображення загорнуто в DIV або SPAN)
import { chromium } from 'playwright';
import { createWriteStream } from 'fs';

const URL = "https://edition.cnn.com/"
let __dirname = process.env.PWD
const IMAGE_PATH = `${__dirname}/images/`
console.log(IMAGE_PATH )
const SNAPSHOT_PATH = `${__dirname}/snapshots/`


const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

var streamImageFromURL = function (imageURL, imageFilename) {
  request(imageURL).pipe(createWriteStream(`${IMAGE_PATH}${imageFilename}`));
}

const singleImageDownloader = async (source, imageSource) => {
      const startIndex = imageSource.lastIndexOf("/") + 1 // do not include /
      const endIndex = imageSource.indexOf("?") > -1 ? imageSource.indexOf("?") : 500
      const imageFilename = imageSource.substring(startIndex, endIndex)
      let src = imageSource
      if (!(src.startsWith('http')))
         src = `https:${src}`
      console.log(`download ${src} as ${imageFilename}`)
      streamImageFromURL(src, imageFilename);
}

const allImageDownloader = async (source) => {
  console.log(`go download all images in the page`)
  // using the page object in source.page, get all img elements and return a collection of image objects to be processed in the Node context
  const images = await source.page.$$eval("img", (images) =>
    images.map((image) => { return { src: image.src, alt: image.alt, width: image.clientWidth, height: image.clientHeight } })
  )
  let i=0
  // for each image of substantial size - determine the name of the image file and invoke the function streamImageFromURL to download the image and save it locally  
  images.forEach(image => {
    if (image.width * image.height > 2500 && !(image.src.startsWith('data'))) {
      const startIndex = image.src.lastIndexOf("/") + 1 // do not include /
      const endIndex = image.src.indexOf("?") > -1 ? image.src.indexOf("?") : 500
      const imageFilename = (i++).toString() + image.src.substring(startIndex, endIndex)
      console.log(`download ${image.src} as ${imageFilename}`)
      streamImageFromURL(image.src, imageFilename);
    }
  });
  return images.length
}

let snapshotCount = 0

const snapshotter = async (source, text) => {
  console.log(`go take screenshot ${snapshotCount} of page`)
  // using the page object in source.page
  await source.page.screenshot({ path: `${SNAPSHOT_PATH}pageSnapshot${snapshotCount++}.png` });
  return ""
}

(async () => {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  // expose a Node function as binding to the page (to be invoked from the function)
  await context.exposeBinding('allImageDownloadFunction', allImageDownloader)
  await context.exposeBinding('snapshotFunction', snapshotter)
  await context.exposeBinding('imageDownloadFunction', singleImageDownloader)
  // create a shortcut key (ctrl + b) that triggers the JS function to download all images
  // create a shortcut key (ctrl + y) that triggers the JS function to take a snapshot of the page
  const shortCutJS = `async function handleShortCutKey(e) { 
      if ('KeyB'==e.code && e.ctrlKey) { // ctrl + b
         const result = window.allImageDownloadFunction() ;  // invoke the Node function that was exposed to the browser context
         console.log(result+" images were downloaded")
      }
      if ('KeyY'==e.code && e.ctrlKey) { // ctrl + y
         window.snapshotFunction() ;  // invoke the Node function that was exposed to the browser context 
      }
      if ('KeyM'==e.code && e.ctrlKey)  {// ctrl + m
         console.log("save image under mouse, find first image ancestor / closest related node of type IMAGE from elementUnderMouse upwards")
         if (elementUnderMouse.tagName=="IMG") {
           const imageSource = elementUnderMouse.getAttribute('src')
           console.log("image source "+imageSource+ "document location"+document.location)
           imageDownloadFunction(imageSource)
         }  
      }
    }
  let elementUnderMouse = null
const handleMouseOver = function (event) {
  const x = event.clientX 
  const y = event.clientY 
  // console.log("handle mouse over at "+x+", "+y )
  elementUnderMouse = document.elementFromPoint(x, y)
  console.log("element = "+elementUnderMouse+ elementUnderMouse.nodeName+ elementUnderMouse.tagName)
}
    document.addEventListener('keyup', handleShortCutKey); 
    document.addEventListener('mouseover', handleMouseOver); 
    console.log("shortcut keys activated")
   
  `


  // this script invokes the function that creates the toolbar in the page 
  // it is executed when a page or frame is created or navigated (https://microsoft.github.io/playwright/docs/1.6.1/api/class-browsercontext#browsercontextaddinitscriptscript-arg)
  await context.addInitScript({
    content: `console.log('initializing script after page or frame DOM recreate');
              ${shortCutJS}
             `
  });

  const page = await context.newPage();

  await page.goto(URL);


  await sleep(50000000) // 1000* 50 seconds
  await browser.close()
})()