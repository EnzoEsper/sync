const cheerio = require("cheerio");

const { formatDate } = require("./utils/utils");
const { providenceContentRequest } = require("./requests/requests");

const obtainProvidence = async (cookie, linkToProvidence) => {
  let providenceContentResponse = await providenceContentRequest(
    cookie,
    linkToProvidence
  );

  // carga la respuesta asociada a un link de providenceencia con cheerio
  $ = cheerio.load(providenceContentResponse);

  // se obtienen los items de la cabecera de la providencia de la parte superior
  let providenceHeaderNL = $(
    `#tblFechaExtracto > tbody > tr[class=td_amarilla] td.Item`
  );
  let providenceHeaderArray = Array.from(providenceHeaderNL);
  let providenceHeaderDataArray = providenceHeaderArray.map(tr => {
    try {
      return tr.children[0].data;
    } catch (error) {
      return null;
    }
  });

  // console.log("providence data array: ", providenceHeaderDataArray);
  // se filtran/quitan los datos del arreglo de items que solo contienen espacios en blanco y son innecesarios
  providenceHeaderDataArray = providenceHeaderDataArray.filter(data =>
    /[a-zA-Z0-9]/i.test(data)
  );

  // se obtienen de a pares (segun su estructura) los valores del arreglo de datos correspondientes a la cabecera de la providencia
  let providenceHeader = providenceHeaderDataArray.reduce(
    (result, value, index, array) => {
      if (index % 2 === 0) {
        result[value] = array[index + 1];
      }
      return result;
    },
    {}
  );

  console.log("This is the header:", providenceHeader);

  // se obtienen, renombran y normalizan los datos necesarios de la cabecera
  let {
    "Fecha de Actuaci�n:": fechaDeActuacion,
    "Firmada Por :": firmadaPor,
    "Extracto:": extracto
  } = providenceHeader;

  if (fechaDeActuacion === null) {
    fechaDeActuacion = "12/12/1212";
  }

  if (firmadaPor === null) {
    firmadaPor = "Default";
  }

  if (extracto === null) {
    extracto = "Default";
  }

  fechaDeActuacion = formatDate(fechaDeActuacion);
  extracto = extracto.trim().replace(/"/g, "");
  firmadaPor = firmadaPor.trim();

  // se obtiene el texto asociado a una providencia (en caso de no tenerlo resulta en un arreglo de tamaño 0)
  var providenceTextareaNodelist = $(`textarea`);
  var providenceTextareaArray = Array.from(providenceTextareaNodelist);

  let content;
  if (providenceTextareaArray.length === 0) {
    // si una prvidencia no tiene contenido en formato de texto, quiere decir que tiene algun documento word o pdf embebido
    console.log("Esta providencia puede tener un pdf o word...");

    // se obtiene el elemento html que contiene el string correspondiente al link del documento
    let embedPdfElement = $(`form[name=ActuacionDetails2] script`);
    let embedPdfString = embedPdfElement.html();

    // se obtiene la parte del elemento correspondiente al link del documento
    let sublinkToPdf = embedPdfString.match(/\biurix-online\b.*\.pdf/);

    // se le da formato completo al link para que se pueda acceder al mismo
    let linkToPdf = `https://iol.juscorrientes.gov.ar:8443/${sublinkToPdf}#toolbar=1&zoom=75`;
    content = linkToPdf;
  } else {
    // si la providencia tiene contenido en formato de texto, se lo agrega como contenido de la providencia y se lo normaliza
    content = providenceTextareaArray[0].firstChild.data;
    content = content.replace(/"/g, "");
  }

  return {
    header: {
      fechaDeActuacion,
      firmadaPor,
      extracto
    },
    content
  };
};

module.exports = obtainProvidence;
