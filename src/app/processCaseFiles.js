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
  fs.readdirSync(pathToCaseFilesWithNotifications).forEach(file => {
    fileNames.push(file);
  });

  for (let h = 0; h < fileNames.length; h++) {
    let localityCaseFilesBuffer = fs.readFileSync(
      `${pathToCaseFilesWithNotifications}/${fileNames[h]}`
    );
    let localityCaseFilesJSON = localityCaseFilesBuffer.toString();
    let localityCaseFilesData = JSON.parse(localityCaseFilesJSON);

    await obtainProvidences(cookie, localityCaseFilesData);
  }

  //console.log("Filenames: ", fileNames);
  /* fileNames.forEach(async (localityName) => {
    let localityCaseFilesBuffer = fs.readFileSync(`${pathToCaseFilesWithNotifications}/${localityName}`);
    let localityCaseFilesJSON = localityCaseFilesBuffer.toString();
    let localityCaseFilesData = JSON.parse(localityCaseFilesJSON);

    await obtainProvidences(cookie, localityCaseFilesData); 
  }); */
};

module.exports = processCaseFiles;

/* for (let i = 0; i < caseFilesPerLocality.length; i++) {
  let caseFilesLocal = caseFilesPerLocality[i];

  let localityID = caseFilesLocal.id;
  let cbo;
  let theCaseFiles = caseFilesLocal.caseFiles;

  switch (caseFilesLocal.name) {
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
  };

  for (let j = 0; j < theCaseFiles.length; j++) {
    await obtainProvidences(cookie, theCaseFiles[i], localityID, cbo);
  }
} */
