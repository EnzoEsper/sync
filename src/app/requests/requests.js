const request = require("request-promise");

// Esta funcion tambien deberia recibir como parametro el campo cbocircunscripcion
// initialRequest es la primera request que se hace a IURIX por un numero de expediente en particular, y de la respuesta que retorne
// se van a extraer los links que hacen referencia a un organismo (estado) de dicho expediente.
const initialRequest = async (cookie, num1, num2, cbo) => {
  const caseFileResponse = await request({
    uri: "https://iol.juscorrientes.gov.ar:8443/iurix-online/QueryExped",
    method: "POST",
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
      Origin: "https://iol.juscorrientes.gov.ar:8443",
      "Content-Type": "application/x-www-form-urlencoded",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "Sec-Fetch-Site": "same-origin",
      Referer: "https://iol.juscorrientes.gov.ar:8443/iurix-online/QueryExped",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "es-AR,es-419;q=0.9,es;q=0.8,en;q=0.7",
      Cookie: cookie
    },
    form: {
      cbocircunscripcion: cbo, // 11- Alvear, 10- Capital, 111- Paso de la Patria Este numero es fijo, y se corresponde con el value del option del select(? RELACION LOCALIDAD-VALUE (HAY QUE ARMAR UNA ESTRUCTURA DE DEATOS QUE RELACIONE CADA LOCALIDAD CON EL NUMERO CORRESPONDIENTE)
      cmbOrganismo: "",
      txtNumero: num1, // Primer numero del expediente
      txtAnio: num2, // Segundo numero del expediente
      txtCaratula: "",
      organismo: false,
      idinicial: null,
      organismoInicial: null,
      numeroInicial: null,
      caratulaInicial: null,
      estadoInicial: null,
      fechaingresoInicial: null,
      idfinal: null,
      organismoFinal: null,
      numeroFinal: null,
      caratulaFinal: null,
      estadoFinal: null,
      fechaingresoFinal: null,
      direccion: "",
      consultar: true
    },
    gzip: true,
    resolveWithFullResponse: true
  });

  return caseFileResponse;
};

const providencesRequest = async (cookie, urlLink) => {
  const providencesResponse = await request({
    uri: urlLink,
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
    }
  });

  return providencesResponse;
};

const providenceContentRequest = async (cookie, providenceLink) => {
  const providenceContentResponse = await request({
    uri: providenceLink,
    method: "GET",
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "es-AR,es-419;q=0.9,es;q=0.8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      Cookie: cookie,
      Host: "iol.juscorrientes.gov.ar:8443",
      Pragma: "no-cache",
      Referer: "https://iol.juscorrientes.gov.ar:8443/iurix-online/QueryExped",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36"
    }
  });

  return providenceContentResponse;
};

module.exports = {
  initialRequest: initialRequest,
  providencesRequest: providencesRequest,
  providenceContentRequest: providenceContentRequest
};
