const cheerio = require("cheerio");
const { formatDate } = require("./utils/utils");

const obtainDateCurrentLocation = providencesResponse => {
  $ = cheerio.load(providencesResponse);
  // a partir de aca se puede acceder con el selector a los campos relacionados a la cabecera del expediente y a los links correspondientes a providencias

  let dateCurrentLocationNodeList = $(
    `td.td_amarilla > table > tbody > tr:nth-child(5) > td`
  );
  let dateCurrentLocationArray = Array.from(dateCurrentLocationNodeList);

  let [dateCurrentLocationString] = dateCurrentLocationArray
    .map(td => td.children[0].data)
    .filter(data => data !== undefined && data.includes("/"));

  let dateCurrentLocationStringFormatted = formatDate(
    dateCurrentLocationString
  );
  let dateCurrentLocation = new Date(dateCurrentLocationStringFormatted);

  return dateCurrentLocation;
};

module.exports = obtainDateCurrentLocation;
