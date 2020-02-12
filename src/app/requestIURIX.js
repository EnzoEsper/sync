const request = require("request-promise");
const cheerio = require("cheerio");

const requestIURIX = async cookie => {
  // request to enter to the IURIX main page using the cookie obtained
  let loggedInResponse = await request({
    uri:
      "https://iol.juscorrientes.gov.ar:8443/iurix-online/jsp/QueryNotific.jsp",
    method: "GET",
    headers: {
      Host: "iol.juscorrientes.gov.ar:8443",
      Connection: "keep-alive",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "Sec-Fetch-Site": "same-origin",
      Referer:
        "https://iol.juscorrientes.gov.ar:8443/iurix-online/jsp/QueryNotific.jsp",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "es-AR,es-419;q=0.9,es;q=0.8",
      Cookie: cookie
    },
    resolveWithFullResponse: true
  });

  // using cheerio for load the body of the response and get the corresponding data of the select button from the notifications tab
  let $ = cheerio.load(loggedInResponse.body);
  let year = $(`input[name="txtAnioFecha"]`).val();
  let month = $(`select[name="cmbMes"] option[selected]`).val();
  let day = $(`select[name="cmbDia"] option[selected]`).text();

  if (!year && !month && !day) {
    throw new Error("Iurix must be updating... Sorry, try it later.");
  }

  year = year.trim();
  month = month.trim();
  day = day.trim();

  return {
    dateLastUpdateIURIX: year + "/" + month + "/" + day,
    dateLastRequestIURIX: new Date()
  };
};

module.exports = requestIURIX;
