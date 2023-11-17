const fs        = require('fs').promises;
const path      = require('path');
const crypto    = require('crypto');

async function findAndMoveCSVFiles(sourceDir, targetDir) {
    try {
        const files = await fs.readdir(sourceDir, { withFileTypes: true });
        for (const file of files) {
            const sourcePath = path.join(sourceDir, file.name);
            if (file.isDirectory()) {
                await findAndMoveCSVFiles(sourcePath, targetDir); // Rekursiver Aufruf für Unterverzeichnisse
            } else if (file.name.endsWith('.csv')) {
                const randomString = crypto.randomBytes(4).toString('hex');
                const targetPath = path.join(targetDir, path.parse(file.name).name + '-' + randomString + '.csv');
                await fs.rename(sourcePath, targetPath); // Verschieben der Datei // SO WAR ES VORHER
                //await fs.copyFile(sourcePath, targetPath);  // Kopieren der Datei
            }
        }
    } catch (error) {
        console.error('Fehler beim Durchsuchen und Verschieben von Dateien:', error);
        throw error;
    }
}

const sourceDirectory = './source';             // Das Quellverzeichnis
const targetDirectory = './csv_data';           // Das Zielverzeichnis


console.time("COLLECT CSV");

findAndMoveCSVFiles(sourceDirectory, targetDirectory)
    .then(() => {
        console.log('Alle CSV-Dateien wurden erfolgreich verschoben.')
        console.timeEnd("COLLECT CSV");
    })
    .catch(error => console.error(error));
