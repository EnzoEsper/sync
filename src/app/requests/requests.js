const request = require("request-promise");

// Esta funcion tambien deberia recibir como parametro el campo cbocircunscripcion
// caseFileRequest es la primera request que se hace a IURIX por un numero de expediente en particular, y de la respuesta que retorne
// se van a extraer los links de cada una de las caratulas que hacen referencia a un organismo (estado en particular) de dicho expediente.
const caseFileRequest = async (cookie, num, anio, cbo) => {
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
      cbocircunscripcion: cbo, // Se corresponde con el value de cada option del select. RELACION LOCALIDAD-VALUE.
      cmbOrganismo: "",
      txtNumero: num, // numero del expediente
      txtAnio: anio, // anio del expediente
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

// providencesRequest es la request que se hace a IURIX accediendo al link de una caratula (organismo-numero) del expediente en particular
// y de la respuesta que retorne se van a extraer los links que hacen referencia a las providencias de dicha caratula del expediente.
const providencesRequest = async (cookie, coverLink) => {
  const providencesResponse = await request({
    uri: coverLink,
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

// providenceContentRequest es la request que se hace a IURIX accediendo al link de una providencia del expediente en particular
// y de la respuesta que retorne se va a extraer el contenido relacionado a dicha providencia del expediente.
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
  caseFileRequest: caseFileRequest,
  providencesRequest: providencesRequest,
  providenceContentRequest: providenceContentRequest
};
