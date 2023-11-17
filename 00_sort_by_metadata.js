/* ############################################################################################## */
/*      Diese Script führt einmal Recursiv eine Suche durch und alle matches werden in den        */
/*      entsprechenden Ordnern gespeichert.                                                       */
/*      Alle CSV Dateien werden gesondert gespeichert. Diese werden dann für eine weitere         */
/*      Match Routine verwendet. Dort werden die Dateinamen verglichen und das Datum aus der      */
/*      CSV Datei ausgelesen.                                                                     */
/* ############################################################################################## */


const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mime = require('mime-types');

const crypto    = require('crypto');

// Needed for Image-Metadata    - JPG, PNG, HEIC
// For full reference visit:    https://www.npmjs.com/package/exifr
const exifr = require('exifr');



// Needed for Video-Metadata    - MOV, MP4, AVI
// For full reference visit:    https://www.npmjs.com/package/fluent-ffmpeg
const ffmpeg = require('fluent-ffmpeg');
const ffprobeAsync = promisify(ffmpeg.ffprobe);

// Binaries compiled in a Node-Module
const ffmpegBin = require('ffmpeg-static');
const ffprobeBin = require('ffprobe-static');
const { trimEnd } = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegBin.path);
ffmpeg.setFfprobePath(ffprobeBin.path);



// Where should the sorted Media be stored?
// It's the root Folder - Sorts media in subfolders like:
//
//          - 2022
//              - 01
//              - 02
//              - ..
//              - 12
//          - 2023
//              - 01
//              - 02
//              - ..
//              - 12



/* ################################################################################################################## */
/*                                                      Settings                                                      */
/* ################################################################################################################## */


const outputFolder = './output';




/* ################################################################################################################## */
/*                                                      Program                                                       */
/* ################################################################################################################## */

var successFiles = 0;
var errorFiles = 0;

(async () => {
    try {

        console.time("SORT BY META");

        await startBrowsingTree('./collectedMedia');

        console.timeEnd("SORT BY META");

        console.log("ERROR FILES", errorFiles);
        console.log("SUCCESS FILES", successFiles);

    } catch (error) {

        console.log("FEHLER!", error);

    }


})();




async function startBrowsingTree(rootPath) {
    try {
        const files = await fs.promises.readdir(rootPath);
        const promises = files.map(async (file) => {
            const filePath = path.join(rootPath, file);
            const stats = await fs.promises.stat(filePath);

            if (stats.isDirectory()) {
                console.log(`Durchsuche Verzeichnis: ${filePath}`);
                await startBrowsingTree(filePath); // Rekursiver Aufruf
            } else {




                // It's a file

                const filename = path.basename(file, path.extname(file));
                const extension = file.split('.').pop();

                if(file.includes('.filtered-') || file.includes('.segmented-') || file.includes('.recorded-') | file.includes('.reversed-')){
                    return;
                }
                

                //console.log(file);

                const fileData = {
                    filename,
                    extension,
                    filePath
                }

                // Get the mime-type of the file
                let fileType = null;
                try {
                    fileType = mime.lookup(extension).split("/")[0];
                } catch {
                    const errorFileMoved = await moveFile(filePath, path.join(outputFolder, 'failed', file));
                    return console.log("Unkown mimetype: ", file);
                }


                if(fileType === "text"){
                    const errorFileMoved = await moveFile(filePath, path.join(outputFolder, 'csv_data', file + '_' + Math.random() * 99999999999999999999));
                    return console.log("CSV TXT FILE");
                }


                if (fileType !== "image" && fileType !== "video") return console.log(`Filetype >${fileType}< is not supported.`, filePath);


                // Get metadata of current file

                let creationDateString = null;

                if (fileType === "image") {
                    try {
                        creationDateString = await getImageCreateDateString(filePath);
                        if (!creationDateString) {
                            console.log("ERROR FILE:", file);
                            const errorFileMoved = await moveFile(filePath, path.join(outputFolder, 'failed', file));
                            errorFiles += 1;
                            return console.log(`Creation date for ${fileType} >${file}< is not available.`, filePath);

                        }
                    } catch (err) {
                        console.log("ERROR FILE:", file);
                        errorFiles += 1;
                        return //console.log(`Creation date for ${fileType} >${file}< is not available.`, filePath);
                    }

                }


                if (fileType === "video") {


                    try {
                        creationDateString = await getVideoCreateDateString(filePath);
                        if (!creationDateString) {
                            console.log("ERROR FILE:", file);
                            const errorFileMoved = await moveFile(filePath, path.join(outputFolder, 'failed', file));
                            errorFiles += 1;
                            
                            return console.log(`Creation date for ${fileType} >${file}< is not available.`, filePath);
                        }
                    } catch (err) {
                        console.log("ERROR FILE:", file);
                        errorFiles += 1;
                        return //console.log(`Creation date for ${fileType} >${file}< is not available.`, filePath);
                    }

                }


                // Form date and new filename

                const creationDate = new Date(creationDateString);
                const dateSegments = getDateSegments(creationDate);

                const newFilename = formNewFilename(creationDate, fileData);

                //console.log("NEW FILE:", newFilename);

                try {
                    const fileDestination = await initNewDestination(dateSegments, newFilename);
                    successFiles += 1;
                    const fileMoved = await moveFile(filePath, fileDestination);
                    if (!fileMoved) return console.log("Error moving file.")
                } catch (error){
                    console.log(error);
                    return console.log("Error init new destination: ", file);
                }


                //


                // console.log(fileType, dateSegments, newFilename, fileDestination);





            }


        });

        await Promise.all(promises); // Warten auf die Fertigstellung aller rekursiven Aufrufe
    } catch (error) {
        console.error(`Fehler in startBrowsingTree bei ${rootPath}:`, error);
    }
}










async function getImageCreateDateString(filePath) {

    try {
        const allImageMetaData = await exifr.parse(filePath);
        if (!allImageMetaData.CreateDate && !allImageMetaData.DateTimeOriginal) {
            return false
        }
        
        return allImageMetaData.CreateDate || allImageMetaData.DateTimeOriginal;
    } catch (err) {
        
        return false;
    }

}



async function getVideoCreateDateString(filePath) {

    try {
        const metadata = await ffprobeAsync(filePath);
        if (!metadata.format?.tags?.creation_time) {
            throw new Error("Keine Erstellungszeit gefunden");
        }
        return metadata.format.tags.creation_time;
    } catch (error) {
        throw error; // Weitergeben des Fehlers
    }

}



function getDateSegments(inputDate) {

    const pad = (num) => (num < 10 ? '0' + num : num);

    const dateSegments = {
        day: pad(inputDate.getDate()).toString(),
        month: pad(inputDate.getMonth() + 1).toString(),
        year: inputDate.getFullYear().toString()
    }

    return dateSegments;
}


function formatDate(date) {
    const pad = (num) => (num < 10 ? '0' + num : num);

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}-${month}-${year} ${hours}-${minutes}-${seconds}`;
}


function generateRandomHash(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function formNewFilename(inputDate, fileData) {
    const randomHash = generateRandomHash(5);
    const formattedDate = formatDate(inputDate);
    const newFilename = `${formattedDate} ${randomHash}.${fileData.extension}`;
    return newFilename;

}



async function initNewDestination(dateSegments, newFilename) {

    const destinationPath = path.join(outputFolder, dateSegments.year, dateSegments.month);
    const fileDestination = path.join(destinationPath, newFilename);

    return fileDestination;

}


async function moveFile(currentPath, newPath) {
    try {
        let destinationFolderExists;

        try {
            // Überprüfen Sie, ob das Verzeichnis existiert
            await fs.promises.access(path.dirname(newPath));
            destinationFolderExists = true;
        } catch {
            // Verzeichnis existiert nicht
            destinationFolderExists = false;
        }
        
        if (!destinationFolderExists) {
            // Erstellen Sie das Verzeichnis, falls es nicht existiert
            await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
            console.log("Created Folder:", path.dirname(newPath));
        }

        // Verschieben Sie die Datei
        await fs.promises.rename(currentPath, newPath);
        
        return true;
    } catch (error) {
        console.error("Fehler beim Verschieben der Datei:", error);
        throw error;
    }
}
