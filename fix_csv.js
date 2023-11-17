const fs = require('fs').promises;
const path = require('path');

async function addSuffixToFiles(directoryPath, suffix) {
    try {
        const files = await fs.readdir(directoryPath);

        for (const file of files) {
            const oldPath = path.join(directoryPath, file);
            const newPath = path.join(directoryPath, `${file}${suffix}`);
            await fs.rename(oldPath, newPath);
        }

        console.log('Alle Dateien wurden erfolgreich umbenannt.');
    } catch (error) {
        console.error('Fehler beim Umbenennen der Dateien:', error);
    }
}

const directoryPath = './csv_data';     // Pfad zum Ordner X
const suffix = '.csv';                  // Die hinzuzufügende Endung

addSuffixToFiles(directoryPath, suffix);
