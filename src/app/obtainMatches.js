const fs = require("fs");
const path = require("path");

const obtainMatches = () => {
  // se obtienen todos los nombres de los archivos JSON dentro de la carpeta caseFilesPerLocalityAPI y los almaceno dentro de un arreglo
  let pathToCaseFilesAPI = path.resolve(
    __dirname,
    "../caseFilesPerLocalityAPI"
  );
  let fileNamesAPI = [];
  fs.readdirSync(pathToCaseFilesAPI).forEach(file => {
    fileNamesAPI.push(file);
  });

  console.log(fileNamesAPI);

  // recorre el arreglo de nombres y por cada uno lee el archivo JSON correspondiente a cada localidad tanto para las notificaciones como para los expedientes consultados a la API
  fileNamesAPI.forEach(locality => {
    let localityCaseFilesWithNotifications = {};
    let caseFilesMatches = [];

    // lee los expedientes consultados previamente a la API y los parsea a un objeto
    const localityBuffer = fs.readFileSync(
      `../caseFilesPerLocalityAPI/${locality}`
    );
    const localityJSON = localityBuffer.toString();
    const localityData = JSON.parse(localityJSON);

    // lee el archivo de notificaciones parseado a JSON
    let notificationsBuffer = fs.readFileSync(
      `../notificationsJSON/${locality}`
    );
    let notificationsJSON = notificationsBuffer.toString();
    let notificationsData = JSON.parse(notificationsJSON);

    localityData.caseFiles.forEach(casefile => {
      let filterResult = notificationsData.find(
        cf => cf.numeroExpediente[1] === casefile.number
      );

      if (filterResult) {
        caseFilesMatches.push(casefile);
      }

      // para retornar el otro formato de casefile (el que fue formateado a JSON desde el excel)
      /* let filterResult = notificationsData.find(cf => cf.numeroExpediente[1] === casefile.number);
      
      if (filterResult) {
        caseFilesMatches.push(filterResult);
      } */
    });

    localityCaseFilesWithNotifications = { ...localityData };
    localityCaseFilesWithNotifications.caseFiles = caseFilesMatches;

    let localityCaseFilesWithNotificationsJSON = JSON.stringify(
      localityCaseFilesWithNotifications
    );
    fs.writeFileSync(
      `../caseFilesWithNotifications/${locality.split(".")[0]}.json`,
      localityCaseFilesWithNotificationsJSON
    );
  });
};

module.exports = obtainMatches;
