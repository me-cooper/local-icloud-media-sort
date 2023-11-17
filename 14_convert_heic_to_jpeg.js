const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const convert = require("heic-convert");

async function readDirRecursively(folderPath) {
  let files = [];
  const entries = await promisify(fs.readdir)(folderPath, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await readDirRecursively(fullPath));
    } else if (path.extname(fullPath) === ".HEIC") {
      files.push(fullPath);
    }
  }

  return files;
}

async function connectionValid() {
  return new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

(async () => {

  const files = await readDirRecursively("./output");

  let convertedImages = 0;

  console.log(`Found ${files.length} photos to convert.`);

  console.time("CONVERT");
  
    for (const file of files) {

        const start = performance.now();

        const outputFilePath    = file.replace('.HEIC', '.jpg');

        const inputBuffer       = await promisify(fs.readFile)(file);

        const outputBuffer = await convert({
            buffer: inputBuffer,
            format: 'JPEG',
            quality: .9
        });

        await promisify(fs.writeFile)(outputFilePath, outputBuffer);
        await promisify(fs.unlink)(file); // Löschen der Original-HEIC-Datei

        convertedImages++;

        const end           = performance.now();
        const elapsedTime   = Math.abs(end - start).toFixed(0);

        console.log(`Converted ${convertedImages} / ${files.length} > took: ${elapsedTime}ms > Replaced ${file} with ${outputFilePath}`);
        

    }

    

  console.timeEnd("CONVERT");



})();
