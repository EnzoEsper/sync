const fs = require("fs");
const path = require("path");
const obtainProvidences = require("./obtainProvidences");

const processCaseFiles = async cookie => {
  // se obtienen todos los nombres de los archivos JSON dentro de la carpeta caseFilesWithNotifications y los almaceno dentro de un arreglo
  let pathToCaseFilesWithNotifications = path.resolve(
    __dirname,
    "../caseFilesWithNotifications"
  );
  let fileNames = [];
  let data = [];
  fs.readdirSync(pathToCaseFilesWithNotifications).forEach(file => {
    fileNames.push(file);
  });

  //console.log("Filenames: ", fileNames);
  fileNames.forEach(async localityName => {
    let localityCaseFilesBuffer = fs.readFileSync(
      `${pathToCaseFilesWithNotifications}/${localityName}`
    );
    let localityCaseFilesJSON = localityCaseFilesBuffer.toString();
    let localityCaseFilesData = JSON.parse(localityCaseFilesJSON);

    data.push(localityCaseFilesData);
    /* let localityID = localityCaseFilesData.id;
    let cbo;
    let localityCaseFiles = localityCaseFilesData.caseFiles;
    
    switch (localityCaseFilesData.name) {
      case "Capital":
        cbo = 10;
        break;
      case "Alvear":
        cbo = 11;
        break;
      case "Bella Vista":
        cbo = 54;
        break;
      default:
        cbo = 00;
        break;
    }

    for (let i = 0; i < localityCaseFiles.length; i++) {
      console.log("PROCESANDO CIUDAD:", localityCaseFilesData.name);
      await obtainProvidences(cookie, localityCaseFiles[i], localityID, cbo);
    } */
    /* localityCaseFiles.forEach(async (cFile) => {
      await obtainProvidences(cookie, cFile, localityID, cbo);
    }) */
  });
  console.log("this is the data: ", data);
};

module.exports = processCaseFiles;
