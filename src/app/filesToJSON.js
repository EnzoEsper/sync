const fs = require("fs");
const xlsx = require("xlsx");
const _ = require("lodash");
const path = require("path");

const filesToJSON = () => {
  let pathToNotifications = path.resolve(__dirname, "../notifications");
  let pathToSaveJSONS = path.resolve(__dirname, "../notificationsJSON");
  // obtaining the names of the files inside the notifications folder
  let fileNames = [];
  fs.readdirSync(pathToNotifications).forEach(file => {
    fileNames.push(file);
  });

  // helper function to remove all white spaces from the casefile number
  normalizeCasefile = exp => {
    if (exp) {
      exp = exp
        .trim()
        .match(/^(\S+)\s(.*)/)
        .slice(1);
      exp[0] = exp[0].replace(/\s/g, "");
      exp[1] = exp[1].replace(/\s/g, "");

      return exp;
    }
  };

  // parse and format each excel within the directory
  for (let i = 0; i < fileNames.length; i++) {
    // array to store all the data related to notifications/casefiles of a locality
    let data = [];

    // using the xlsx package to read the excels and format them to JSON
    let wb = xlsx.readFile(`${pathToNotifications}/${fileNames[i]}`);

    let ws = wb.Sheets["Hoja 1"];

    let datajson = xlsx.utils.sheet_to_json(ws);

    // Returning all the values of each object previously formatted
    let dataValues = datajson.map(record => {
      return Object.values(record);
    });

    // Removing the first three elements of the array parsed from the excel (these first three elements correspond to the headings of excels)
    dataValues = dataValues.slice(3);

    // For each element in the array normalize and return the fields that are neccesary
    dataValues.map(expediente => {
      let [
        orden,
        persona,
        numeroExpediente,
        organismo,
        secretaria
      ] = expediente;

      organismo = String(organismo).trim();
      secretaria = String(secretaria).trim();

      expedienteMultiple = _.split(numeroExpediente, "-");

      // if the string of each element contains more than one casefile numbre, separates them one by one to add them as independent objects to the new data array
      if (expedienteMultiple.length > 1) {
        expedienteMultiple.forEach(num => {
          num = normalizeCasefile(num);

          data.push({
            numeroExpediente: num,
            persona,
            organismo,
            secretaria
          });
        });
      } else {
        numeroExpediente = normalizeCasefile(numeroExpediente);

        data.push({
          numeroExpediente,
          persona,
          organismo,
          secretaria
        });
      }
    });

    // parses the data to json format and persists in the notificationsJSON directory
    let datadataJSON = JSON.stringify(data);
    fs.writeFileSync(
      `${pathToSaveJSONS}/${fileNames[i].split(".")[0]}.json`,
      datadataJSON
    );
  }
};

module.exports = filesToJSON;
