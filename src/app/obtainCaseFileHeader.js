const cheerio = require("cheerio");
const { formatDate } = require("./utils/utils");

const obtainCaseFileHeader = providencesResponse => {
  let caseFileHeader = {};
  // cargo la respuesta asociada al primer link con cheerio
  $ = cheerio.load(providencesResponse);

  // console.log("Actualizando la cabecera del expediente");
  // se obtienen todos los items de la cabecera del expediente de la parte superior
  let caseFileHeaderFieldsNodeList = $(`td.td_amarilla span[class=Item]`);
  let caseFileHeaderFieldsArray = Array.from(caseFileHeaderFieldsNodeList);

  // se obtienen los datos necesarios de cada item, se filtran los innecesarios, y se normaliza el formato.
  caseFileHeaderFieldsArray = caseFileHeaderFieldsArray
    .map(span => {
      try {
        return span.children[0].data;
      } catch (error) {
        return null;
      }
    })
    .filter(span => span !== undefined);

  caseFileHeaderFieldsArray.splice(12, 0, "Extracto Ultima Actuacion");

  console.log("CASEFILE HEADER FIELDS ARRAY:", caseFileHeaderFieldsArray);
  // let itemsHeaderNL5 = caseFileHeaderFields.map(ss => ss.trim());

  // se obtiene el header del expediente
  let caseFileHeaderFieldsObject = caseFileHeaderFieldsArray.reduce(
    (result, value, index, array) => {
      if (index % 2 === 0) {
        let nextValue = array[index + 1];
        if (nextValue !== null) {
          result[value] = nextValue.trim();
        } else {
          result[value] = nextValue;
        }
      }
      return result;
    },
    {}
  );
  console.log("CASEFILE HEADER FIELDS OBJECT", caseFileHeaderFieldsObject);

  let {
    "Organismo :": organismo,
    "Número :": numero,
    "Estado:": estado,
    "Carátula:": caratula,
    "Fecha ingreso:": fechaIngreso,
    "Ultima Actuación:": fechaUltimaActuacion,
    "Extracto Ultima Actuacion": extractoUltimaActuacion,
    "Ubicación Actual:": ubicacionActual
  } = caseFileHeaderFieldsObject;

  // estos dos podrian ser null en el caso de que el link del organismo no posea providencias
  if (fechaUltimaActuacion !== null) {
    fechaUltimaActuacion = formatDate(fechaUltimaActuacion);
  }

  if (extractoUltimaActuacion !== null) {
    extractoUltimaActuacion = extractoUltimaActuacion.replace(/"/g, "");
  }

  caseFileHeader["organismo"] = organismo;
  caseFileHeader["numero"] = numero; // este numero contiene el numero del expediente en si y el anio
  caseFileHeader["estado"] = estado;
  caseFileHeader["caratula"] = caratula.replace(/"/g, "");
  caseFileHeader["fechaIngreso"] = formatDate(fechaIngreso);
  caseFileHeader["fechaUltimaActuacion"] = fechaUltimaActuacion;
  caseFileHeader["extractoUltimaActuacion"] = extractoUltimaActuacion;
  caseFileHeader["ubicacionActual"] = ubicacionActual;

  return caseFileHeader;
  /* console.log("THIS IS THE HEADER:", caseFileHeader);
  console.log("AND THIS ARE THE ITEMS:", itemsHeaderNL5); */

  // se asocia la cabecera con el expediente
  //caseFile.header = caseFileHeader;
};

module.exports = obtainCaseFileHeader;
