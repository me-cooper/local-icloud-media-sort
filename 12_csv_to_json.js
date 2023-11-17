const fs                    = require('fs');
const { promises: fsp }     = fs;
const csvtojson             = require('csvtojson');
const path                  = require('path');
const { parse }             = require('csv-parse');
const util                  = require('util');


const parseAsync            = util.promisify(parse);


function toSafeFolderName(name) {
    return name
        .replace(/[/\\?%*:|"<>]/g, '-') 
        .replace(/\s+/g, '_')          
        .normalize('NFD')              
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^a-z0-9_\-]/gi, '') 
        .substring(0, 255);            
}



async function processCSVFile(filePath, albumData, counters) {

    const fileContent   = await fsp.readFile(filePath, 'utf8');
    const records       = await parseAsync(fileContent, {
        delimiter: ',',
        columns: true,
        skip_empty_lines: true
    });

    const isAlbum           = Object.keys(records[0]).length === 1;
    const albumName         = path.parse(filePath).name;
    const safeFolderName    = toSafeFolderName(albumName);

    if (isAlbum) {
        counters.albumCount++;
    }

    records.forEach(record => {
        const imgName = isAlbum ? record.imageName : record.imgName;
        if (isAlbum) {
            if (!albumData[imgName]) {
                albumData[imgName] = [];
            }
            albumData[imgName].push(safeFolderName);
        } else {
            counters.imageCount++;
        }
    });

    return isAlbum ? null : records;
}

async function loadCSVFiles(directoryPath) {
    try {

        const files         = await fsp.readdir(directoryPath);

        let jsonObjects     = [];
        let albumData       = {};

        let counters        = { imageCount: 0, albumCount: 0 };


        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const records = await processCSVFile(filePath, albumData, counters);
            if (records) {
                jsonObjects = jsonObjects.concat(records);
            }
        }

        console.log(`Gefundene Bilder: ${counters.imageCount}`);
        console.log(`Gefundene Alben: ${counters.albumCount}`);

        return { jsonObjects, albumData };

    } catch (error) {
        console.error("Fehler beim Lesen der CSV-Dateien:", error);
        throw error;
    }
}

function transformJson(data) {
    const { jsonObjects, albumData } = data;

    const duplicates = new Set();

    const result = jsonObjects.reduce((acc, item) => {
        if (item.imgName && item.importDate) {
            if (acc[item.imgName]) {
                duplicates.add(item.imgName); // Füge hinzu zur Liste der Duplikate
                console.log(`Warnung: Bild ${item.imgName} existiert bereits in den JSON-Daten.`);
            }
            acc[item.imgName] = {
                creationDate: item.importDate,
                albums: albumData[item.imgName] || []
            };
        }
        return acc;
    }, {});

    // Entferne Duplikate aus dem Ergebnis
    duplicates.forEach(duplicate => {
        delete result[duplicate];
    });

    return result;

}

async function saveJSONToFile(jsonData, outputFilePath) {
    try {
        const jsonString = JSON.stringify(jsonData, null, 4);
        await fsp.writeFile(outputFilePath, jsonString, 'utf8');
        console.log(`JSON-Daten wurden in ${outputFilePath} gespeichert.`);
    } catch (error) {
        console.error("Fehler beim Speichern der JSON-Datei:", error);
        throw error;
    }
}

const directoryPath     = './csv_data';
const outputFilePath    = './imageData.json';


console.time("CSV TO JSON");

loadCSVFiles(directoryPath)
    .then(transformJson)
    .then(transformedJson => {
        return saveJSONToFile(transformedJson, outputFilePath);
    })
    .then(() => {
        console.log('CSV erfolgreich zu JSON konvertiert und gespeichert.');
        console.timeEnd("CSV TO JSON");
    })
    .catch(error => {
        console.error(error);
    });