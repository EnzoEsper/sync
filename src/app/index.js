const requestIURIX = require("./requestIURIX");
const obtainCookieIURIX = require("./obtainCookieIURIX");
const downloadFiles = require("./downloadFiles");
const filesToJSON = require("./filesToJSON");
const obtainCaseFilesPerLocality = require("./obtainCaseFilesPerLocality");
const obtainMatches = require("./obtainMatches");
const processCaseFiles = require("./processCaseFiles");
const fs = require("fs");
const path = require("path");

(async () => {
  /* obtainMatches();

    return; */
  let pathToRegister = path.resolve(__dirname, "../register");
  // Read the register.json file and parse it to an object
  let registerBuffer = fs.readFileSync(`${pathToRegister}/register.json`);
  let registerJSON = registerBuffer.toString();
  let registerData = JSON.parse(registerJSON);

  // obtaining the cookie
  const cookie = await obtainCookieIURIX();

  // Call to the function and returns the date of last update of the notifications from IURIX and the date of the request to the page
  let dateRequestAndLastUpdate = await requestIURIX(cookie);

  // If the last update from the register.json is the same than the last update fetched from IURIX then the files are up to date an only the date of the request is registered
  if (
    registerData.dateLastUpdateIURIX ===
    dateRequestAndLastUpdate.dateLastUpdateIURIX
  ) {
    console.log("Files are up to date... Nothing to download!");
  } else {
    try {
      // If the last update from the register.json is distinct than the last update fetched from IURIX then the files are downloaded and both dates (last update and last request) are registered
      console.log("Files are not updated!");
      console.log("Downloading new files!");
      // The files are downloaded with the nigthmarejs library
      // // await downloadFiles();

      console.log(
        "files downloaded succesfully!. Updating last update from IURIX"
      );
      registerData.dateLastUpdateIURIX =
        dateRequestAndLastUpdate.dateLastUpdateIURIX;

      // Once downloaded the files (in xlsx format) are parsed and normalized to JSON
      console.log("Parsing files to json format");
      filesToJSON();

      // Once parsed the files proceed to request all the casefiles from all localities from the API for obtain the matches
      console.log("obtaining all the case files from the API");
      await obtainCaseFilesPerLocality();

      // Matching the casefiles requested from the API with the casefiles asociated with a notification
      console.log("obtaining matches between casefiles");
      obtainMatches();

      // Obtaining the providences for a caseFile in particular
      await processCaseFiles(cookie);
      console.log("Providences obtained!");
    } catch (error) {
      console.log(error);
    }

    /* await downloadFiles()
        .then((title) => {
          console.log(title);
          registerData.dateLastUpdateIURIX = dateRequestAndLastUpdate.dateLastUpdateIURIX;
      
          // Once downloaded the files (in xlsx format) are parsed and normalized to JSON
          console.log("Parsing files to json format");
          filesToJSON();

          // Once parsed the files proceed to request all the casefiles from all localities from the API
          console.log("obtaining all the case files from the API");
          obtainCaseFilesAPI();
        })
        .catch(console.error); */
  }

  // Regardless of whether the files are updated or not, the date of the last request to IURIX is registered
  console.log("Updating date of last request to IURIX...");
  registerData.dateLastRequestIURIX =
    dateRequestAndLastUpdate.dateLastRequestIURIX;
  let newRegisterJSON = JSON.stringify(registerData);
  fs.writeFileSync(`${pathToRegister}/register.json`, newRegisterJSON);

  console.log("Done!");
})();
