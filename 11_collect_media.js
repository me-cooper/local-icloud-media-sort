const fs        = require('fs').promises;
const path      = require('path');

const crypto    = require('crypto');


function generateRandomHash(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

async function processFiles(sourceDir, targetDir, deleteStrings) {
    try {
        const files = await fs.readdir(sourceDir, { withFileTypes: true });
        for (const file of files) {
            const sourcePath = path.join(sourceDir, file.name);
            if (file.isDirectory()) {
                await processFiles(sourcePath, targetDir, deleteStrings); // Rekursiver Aufruf für Unterverzeichnisse
            } else {
                // Prüfen, ob der Dateiname einen der Löschstrings enthält
                if (deleteStrings.some(str => file.name.includes(str))) {
                    console.log(`Datei ${file.name} wurde entfernt.`);
                    await fs.unlink(sourcePath); // Löschen der Datei
                } else {

                    let targetPath      = path.join(targetDir, file.name);

                    if (await fileExists(targetPath)) {

                        const randomHash    = generateRandomHash(5);
                        targetPath          = path.join(targetDir, `${randomHash} ${file.name}`);
                        console.log(`Datei existiert bereits und kann nicht mehr für Alben verwendet werden : ${randomHash} ${file.name}`);
                        await fs.rename(sourcePath, targetPath); // Verschieben der Datei

                    } else {

                        await fs.rename(sourcePath, targetPath); // Verschieben der Datei

                    }
                }
            }
        }
    } catch (error) {
        console.error('Fehler beim Durchsuchen, Löschen und Verschieben von Dateien:', error);
        throw error;
    }
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

const sourceDirectory   = './source';             // Das Quellverzeichnis
const targetDirectory   = './collectedMedia';       // Das Zielverzeichnis

const deleteStrings     = ['.filtered-', '.segmented-', '.recorded-', '.reversed-'];               // Liste von Strings, die zum Löschen der Datei führen


console.time("COLLECT MEDIA");

processFiles(sourceDirectory, targetDirectory, deleteStrings)
    .then(() => {
        console.log('Dateiverarbeitung abgeschlossen.');
        console.timeEnd("COLLECT MEDIA");
    })
    .catch(error => console.error(error));
