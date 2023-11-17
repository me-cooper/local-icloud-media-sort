const fs        = require('fs').promises;
const path      = require('path');

const crypto    = require('crypto');


function generateRandomHash(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

async function loadJson(filePath) {
    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Fehler beim Laden der JSON-Datei:", error);
        throw error;
    }
}


function formatDateString(dateString) {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('de-DE', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    });
    return formatter.format(date).replace(/\//g, '-').replace(',', '').replace(/\s/g, ' ').replace(/:/g, '-').replaceAll('.', '-');
}


// Funktion zum Extrahieren von Jahr und Monat und zum Formatieren des Datums
function getYearMonthAndFormattedDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Monate sind 0-basiert
    const formattedDate = formatDateString(dateString);

    return { year, month, formattedDate };
}


async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}


async function processImages(jsonFilePath, directoryPath, targetPath, albumsPath) {
    try {
        // Laden der JSON-Daten
        const jsonData = await loadJson(jsonFilePath);

        // Verarbeiten der Bilder
        const files = await fs.readdir(directoryPath);

        for (const file of files) {
            if (jsonData[file] && jsonData[file].creationDate) {
                const { year, month, formattedDate } = getYearMonthAndFormattedDate(jsonData[file].creationDate);
                
                // Pfad für das Verschieben in den Jahres-/Monatsordner
                const randomHash = generateRandomHash(5);
                const newName = `${formattedDate} ${randomHash}${path.extname(file)}`;
                const monthDir = path.join(targetPath, year.toString(), month);
                await fs.mkdir(monthDir, { recursive: true });
                const monthPath = path.join(monthDir, newName);

                // Pfad der Quelldatei
                const sourcePath = path.join(directoryPath, file);

                // Kopieren in Alben, falls zutreffend
                if (jsonData[file].albums && jsonData[file].albums.length > 0) {
                    for (const album of jsonData[file].albums) {
                        const albumDir = path.join(albumsPath, album);
                        await fs.mkdir(albumDir, { recursive: true });
                        const albumPath = path.join(albumDir, newName);
                        await fs.copyFile(sourcePath, albumPath);
                    }
                }

                // Verschieben der Datei in den Jahres-/Monatsordner
                await fs.rename(sourcePath, monthPath);
                
            }else{
                console.log("Keine Daten in der JSON-Datei für " + file + " vorhanden. Datei wurde nicht verschoben.")
            }
        }
    } catch (error) {
        console.error("Fehler beim Verarbeiten der Bilder:", error);
        throw error;
    }
}



// Verwenden Sie diese Funktionen
const jsonFilePath          = './imageData.json';       // JSON Data File
const imagesDirectoryPath   = './collectedMedia';               // Image directory where raw images are located
const targetPath            = './output';               // Sorted images destination
const albumsPath            = './output/albums';               // Pfad für Album-Verzeichnisse


async function runProcessImages() {
    console.time("SORT BY JSON");
    try {
        await processImages(jsonFilePath, imagesDirectoryPath, targetPath, albumsPath);
        console.log('Bildverarbeitung abgeschlossen.');
        console.timeEnd("SORT BY JSON");
    } catch (error) {
        console.error(error);
    }
}

runProcessImages();