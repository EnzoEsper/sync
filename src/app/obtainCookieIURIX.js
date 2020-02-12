const request = require("request-promise");

const obtainCookieIURIX = async () => {
  let initialRequest = await request({
    uri: "https://iol.juscorrientes.gov.ar:8443/iurix-online/LogOut",
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
      "Sec-Fetch-Site": "none",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "es-AR,es-419;q=0.9,es;q=0.8"
    },
    gzip: true,
    resolveWithFullResponse: true
  });

  // PARSING THE COOKIES -> obtains the first and initial cookie assigned by the web trough the response header
  let cookie = initialRequest.headers["set-cookie"]
    .map(value => value.split(";")[0])
    .join(" ");

  // Login request with the first cookie and the user and pass for obtain the 2nd cookie
  let loginRequest = await request({
    uri: "https://iol.juscorrientes.gov.ar:8443/iurix-online/LoginServlet",
    method: "POST",
    headers: {
      Host: "iol.juscorrientes.gov.ar:8443",
      Connection: "keep-alive",
      //"Content-Length": "51",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
      Origin: "https://iol.juscorrientes.gov.ar:8443",
      "Upgrade-Insecure-Requests": "1",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      "Sec-Fetch-Site": "same-origin",
      Referer: "https://iol.juscorrientes.gov.ar:8443/iurix-online/LogOut",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "es-AR,es-419;q=0.9,es;q=0.8",
      Cookie: cookie
    },
    form: {
      txtUser: "vero86",
      txtPassword: "leonel86",
      anonymous: "false"
    },
    resolveWithFullResponse: true
  });

  // Renew the cookie for the last assigned by the web and with which the remaining queries will be made
  cookie = loginRequest.headers["set-cookie"]
    .map(value => value.split(";")[0])
    .join(" ");

  return cookie;
};

module.exports = obtainCookieIURIX;
