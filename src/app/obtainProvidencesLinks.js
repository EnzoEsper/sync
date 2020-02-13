const cheerio = require("cheerio");

const obtainProvidencesLinks = providencesResponse => {
  $ = cheerio.load(providencesResponse);
  // a partir de aca se puede acceder con el selector a los campos relacionados a la cabecera del expediente y a los links correspondientes a providencias

  // devuelve una nodelist con todos los anchors que aparecen en la tabla de IURIX (correspondientes a providencias, filtros, botones...).
  let providencesAnchorsNodeList = $("body > table:nth-child(7) > tbody tr a");
  // transforma la nodelist a un arreglo y remueve los primeros 4 anchors/links y el ultimo correspondientes a botones de filtros y navegacion de la tabla de IURIX
  let providencesAnchorsArray = Array.from(providencesAnchorsNodeList).slice(
    4,
    -1
  );
  // devuelve un arreglo con los hrefs de cada anchor (cada uno correspondiente a una providencia del expediente)
  let providencesLinks = providencesAnchorsArray.map(a => a.attribs.href);

  return providencesLinks;
};

module.exports = obtainProvidencesLinks;
