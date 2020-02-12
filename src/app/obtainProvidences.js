const fs = require("fs");
const cheerio = require("cheerio");
const request = require("request-promise");
const _ = require("lodash");
const { GraphQLClient } = require("graphql-request");
const fetch = require("node-fetch");

const { formatDate } = require("./utils/utils");
const {
  initialRequest,
  providencesRequest,
  providenceContentRequest
} = require("./requests/requests");
const obtainProvidence = require("./obtainProvidence");
const obtainCaseFileHeader = require("./obtainCaseFileHeader");
const obtainProvidencesLinks = require("./obtainProvidencesLinks");
const obtainDateCurrentLocation = require("./obtainDateCurrentLocation");

const obtainProvidences = async cookie => {
  const client = new GraphQLClient("http://localhost:4466");

  const localityCaseFilesBuffer = fs.readFileSync(
    `../caseFilesWithNotifications/Capital.json`
  );
  const localityCaseFilesJSON = localityCaseFilesBuffer.toString();
  const localityCaseFilesData = JSON.parse(localityCaseFilesJSON);

  let localityID = localityCaseFilesData.id;
  let caseFileNumber = localityCaseFilesData.caseFiles[0].number;
  let caseFileID = localityCaseFilesData.caseFiles[0].id;
  let caseFileNumberOfProvidences =
    localityCaseFilesData.caseFiles[0].numberOfProvidences;
  let caseFileCourt = localityCaseFilesData.caseFiles[0].court;
  let caseFileLinkCurrentCoverDB =
    localityCaseFilesData.caseFiles[0].linkCurrentCover;
  let caseFileLinksCoversDB = localityCaseFilesData.caseFiles[0].linksCovers;

  let caseFileNumberSplitted = caseFileNumber.split("/");
  // divido el numero de expediente para pasar los datos necesarios al form para hacer la request
  let num1 = caseFileNumberSplitted[0];
  let num2 = caseFileNumberSplitted[1];

  let caseFile = {};
  caseFile.providences = [];
  caseFile.header = {};
  let caseFileLinkCurrentCover;
  let linkLastCourt;

  // request por el numero de expediente
  let caseFileResponse = await initialRequest(cookie, num1, num2);

  // se carga el body de la respuesta a la request con cheerio
  let $ = cheerio.load(caseFileResponse.body);

  // se seleccionan todos los anchors dentro de cada td en el tbody (bloque de filas dentro de la tabla de IURIX)
  let linksTbody = $(
    `body > form > table:nth-child(1) > tbody > tr:nth-child(4) > td:nth-child(2) > table > tbody > tr > td > a`
  );
  // se pasa la estructura de linksTbody a un array
  let arrayLinksTbody = Array.from(linksTbody);

  // se filtran solo los anchors correspondientes a un estado/organismo del expediente en particular, se extraen sus hrefs (links)
  // y se arma un array para luego mantener el registro del ultimo estado/organismo al que pertenece dicho expediente
  let linksTbodyCourts = arrayLinksTbody
    .filter(a => a.attribs.href.includes("/iurix-online/ExpedDetails?"))
    .map(a => {
      let link = a.attribs.href;

      return link;
    });

  // console.log(linksTbodyCourts);

  // ******************************
  // EL EXPEDIENTE YA FUE PROCESADO y ya contiene providencias asociadas
  // ******************************
  if (caseFileNumberOfProvidences > 0) {
    // si el expediente ya fue procesado y tiene actualizaciones solo debo agregar las providencias/organismo restantes y actualizar la cabecera
    console.log("ACTUALIZANDO PROVIDENCIAS DEL EXPEDIENTE");

    // se obtiene la cantitad total actual de providencias del expediente (cantidad de links que hacen referencia a c/u) para poder
    // verificar que el expediente tenga nuevas providencias y actualizar solo las restantes
    let actualNumberOfProvidences = 0;
    for (let i = 0; i < linksTbodyCourts.length; i++) {
      // se accede a cada link correspondiente a un estado/organismo del expediente en particular para luego extraer sus providencias
      let linkCourt = `https://iol.juscorrientes.gov.ar:8443${
        linksTbodyCourts[i]
      }`;
      // request por un link a un organismo en particular
      let providencesResponse = await providencesRequest(cookie, linkCourt);
      // se carga la respuesta asociada a la request con cheerio
      $ = cheerio.load(providencesResponse);
      // devuelve una nodelist con todos los anchors que aparecen en la tabla de IURIX
      let providencesAnchorsNodeList = $(
        "body > table:nth-child(7) > tbody tr a"
      );
      // se transforma la nodelist a un arreglo y remueve los primeros 4 anchors/links y el ultimo correspondientes a botones de filtros y navegacion de la tabla de IURIX
      let providencesAnchorsArray = Array.from(
        providencesAnchorsNodeList
      ).slice(4, -1);
      // devuelve un arreglo con los hrefs de cada anchor (links), cada uno correspondiente a una providencia del expediente en particular
      let providencesLinks = providencesAnchorsArray.map(a => a.attribs.href);

      // se almacena el total de providencias
      actualNumberOfProvidences += providencesLinks.length;
      // se modifica cada link del tbodyCourts con la cantidad de providencias correspondiente a cada link
      linksTbodyCourts[i] = linksTbodyCourts[i] + " " + providencesLinks.length;
    }

    console.log(linksTbodyCourts);
    let lastLink;

    // existen providencias nuevas para el expediente
    if (actualNumberOfProvidences > caseFileNumberOfProvidences) {
      // el expediente tiene providencias nuevas y ademas cambio a un organismo nuevo al que nunca habia pertenecido anteriormente
      if (linksTbodyCourts.length > caseFileLinksCoversDB.length) {
        // se filtra el nuevo link que hace referencia al ultimo organismo
        lastLink = linksTbodyCourts.filter(
          link => !caseFileLinksCoversDB.includes(link)
        )[0];
        lastLink = lastLink.split(" ")[0];
        // se almacena el link filtrado para registrarlo como el organismo actual al que pertenece el expediente
        caseFileLinkCurrentCover = lastLink;

        // se da formato completo al nuevo link
        linkLastCourt = `https://iol.juscorrientes.gov.ar:8443${caseFileLinkCurrentCover}`;
      } else {
        // el expediente tiene providencias nuevas y, o bien, no cambio de organismo o cambio de organismo a uno al que ya habia pertenecido anteriormente

        // se filtra el link que tiene asociada nuevas providencias
        lastLink = linksTbodyCourts.filter(
          (link, index) => link !== caseFileLinksCoversDB[index]
        )[0];
        lastLink = lastLink.split(" ")[0];

        // se almacena el link filtrado para registrarlo como el organismo actual al que pertenece el expediente
        caseFileLinkCurrentCover = lastLink;
        // se da formato completo al nuevo link
        linkLastCourt = `https://iol.juscorrientes.gov.ar:8443${caseFileLinkCurrentCover}`;
      }

      console.log("Accediendo al link:  ", linkLastCourt);
      // se accede al nuevo link para actualizar la cabecera del expediente y obtener las nuevas providencias
      let providencesResponse = await providencesRequest(cookie, linkLastCourt);

      caseFile.header = await obtainCaseFileHeader(providencesResponse);

      let providencesLinks = obtainProvidencesLinks(providencesResponse);

      console.log("PROVIDENCIAS CORRESP AL LINK:", linkLastCourt);
      console.log(
        "***************************************************************"
      );
      // este ciclo recorre cada uno de los links, cada uno correspondiente a cada providencia QUE FALTA del expediente para extraer la informacion necesaria (cabecera y contenido)
      for (
        let i = 0;
        i < actualNumberOfProvidences - caseFileNumberOfProvidences;
        i++
      ) {
        let providenceLink = `https://iol.juscorrientes.gov.ar:8443${
          providencesLinks[i]
        }`;

        let providence = await obtainProvidence(cookie, providenceLink);

        // se agrega la providencia al arreglo de providencias del expediente
        caseFile.providences.push(providence);

        // se crea el formato de la request para hacer la mutation:creacion de la providencia del expediente.
        let createProvidence = `mutation {
          createProvidencia(
            data:{
              fechaDeActuacion: "${providence.header.fechaDeActuacion}",
              contenido: """${providence.content}""",
              extracto: "${providence.header.extracto}",
              firmadaPor: "${providence.header.firmadaPor}",
              expediente: {
                connect: { id: "${caseFileID}" }
              }
            }
          ){
            id
          }
        }`;

        try {
          // se realiza la mutation:creacion de la providencia
          const response = await client.request(createProvidence);
          console.log(response);
          fetch("http://localhost:3035/api/webhook/trigger/addProvidence", {
            method: "post",
            body: JSON.stringify(providence),
            headers: { "Content-Type": "application/json" }
          })
            .then(res => res.json())
            .then(json => console.log(json));
        } catch (error) {
          console.log(error);
        }

        console.log(
          "--------------------------------------------------------------------------------------------"
        );
      }
    } else {
      // el expediente no tiene providencias nuevas PERO cambio de organismo
      console.log(
        "El expediente no tiene nuevas providencias pero cambio de organismo"
      );

      if (linksTbodyCourts.length > caseFileLinksCoversDB.length) {
        // se filtra el nuevo link correspondiente al ultimo organismo
        lastLink = linksTbodyCourts.filter(
          link => !caseFileLinksCoversDB.includes(link)
        )[0];
        // se almacena el link filtrado para registrarlo como el ultimo
        lastLink = lastLink.split(" ")[0];
        caseFileLinkCurrentCover = lastLink;

        // se accede al nuevo link para luego extraer sus providencias
        linkLastCourt = `https://iol.juscorrientes.gov.ar:8443${lastLink}`;

        let providencesResponse = await providencesRequest(
          cookie,
          linkLastCourt
        );

        // console.log("el expediente no tiene providencias nuevas, pero cambio de organismo. Actualizando parte de la cabecera...");
        console.log("Este link", linkLastCourt, "no tiene providencias :(");
        caseFile.header = await obtainCaseFileHeader(providencesResponse);
      }
    }
    // no se si se pueda mover aca el obtainCaseFileHeader, por el hecho de que en el else de arriba hay un condicional
  } else {
    // *********************************
    // EL EXPEDIENTE NUNCA FUE PROCESADO y no contiene providencias asociadas
    // *********************************

    // Si el tamano del arreglo linksTbodyCourts es > 0 quiere decir que la primer request por el numero de expediente
    // devolvio al menos un link y se lo puede procesar
    if (linksTbodyCourts.length > 0) {
      // Se establece una fecha minima para la fecha de ubicacion del expediente para luego compararla con las demas
      caseFile.dateOfAdmission = new Date("1500-01-01");

      // Recorro el o los links relacionado/s a un organismo/estado del expediente en particular para poder extraer las providencias y armar la cabecera
      for (let j = 0; j < linksTbodyCourts.length; j++) {
        // Se da formato y accede a un link en particular
        let urlLink = `https://iol.juscorrientes.gov.ar:8443${
          linksTbodyCourts[j]
        }`;
        let providencesResponse = await providencesRequest(cookie, urlLink);

        let dateCurrentLocation = obtainDateCurrentLocation(
          providencesResponse
        );

        console.log(
          "Esta es la fecha de ingreso del link:",
          dateCurrentLocation
        );
        console.log(
          "Esta es la ultima fecha de ingreso de la cabecera del expediente:",
          caseFile.dateOfAdmission
        );
        console.log(
          "Fecha ingreso link es mayor a ult fecha de ingreso de cabecera?",
          dateCurrentLocation > caseFile.dateOfAdmission
        );
        if (dateCurrentLocation > caseFile.dateOfAdmission) {
          console.log("Armando la cabecera del expediente");
          caseFile.header = await obtainCaseFileHeader(providencesResponse);
          caseFile.dateOfAdmission = dateCurrentLocation;
          caseFileLinkCurrentCover = linksTbodyCourts[j];
        }

        let providencesLinks = obtainProvidencesLinks(providencesResponse);

        if (providencesLinks.length === 0)
          console.log(
            "Este link",
            linksTbodyCourts[j],
            "no tiene providencias asociadas."
          );

        console.log("PROVIDENCIAS CORRESP AL LINK:", linksTbodyCourts[j]);
        console.log(
          "***************************************************************"
        );

        // este ciclo recorre cada uno de los links (cada uno correspondiente a cada una de las providencias del expediente) para extraer la informacion necesaria (cabecera y contenido)
        for (let i = 0; i < providencesLinks.length; i++) {
          let providenceLink = `https://iol.juscorrientes.gov.ar:8443${
            providencesLinks[i]
          }`;

          let providence = await obtainProvidence(cookie, providenceLink);

          caseFile.providences.push(providence);

          // se crea el formato de la request para hacer la mutation:creacion de la providencia del expediente.
          let createProvidence = `mutation {
            createProvidencia(
              data:{
                fechaDeActuacion: "${providence.header.fechaDeActuacion}",
                contenido: """${providence.content}""",
                extracto: "${providence.header.extracto}",
                firmadaPor: "${providence.header.firmadaPor}",
                expediente: {
                  connect: { id: "${caseFileID}" }
                }
              }
            ){
              id
            }
          }`;

          try {
            // se realiza la mutation:creacion de la providencia
            const response = await client.request(createProvidence);
            console.log(response);

            fetch("http://localhost:3035/api/webhook/trigger/addProvidence", {
              method: "post",
              body: JSON.stringify(providence),
              headers: { "Content-Type": "application/json" }
            })
              .then(res => res.json())
              .then(json => console.log(json));
          } catch (error) {
            console.log(error);
          }

          console.log(
            "--------------------------------------------------------------------------------------------"
          );
        }

        linksTbodyCourts[j] =
          linksTbodyCourts[j] + " " + providencesLinks.length;
        console.log("this is links tbodycourts niggga!", linksTbodyCourts);
      }
    } else {
      console.log("NO HAY PROVIDENCIAS PARA ESTE EXPEDIENTE");
    }
  }

  console.log("Haciendo mutation de la cabecera del expediente");

  // AQUI SE TERMINA DE PROCESAR EL EXPEDIENTE
  if (!_.isEmpty(caseFile.header)) {
    // se crea el formato de la request para hacer la mutation:creacion de la cabecera del expediente con los datos obtenidos.
    let updateCaseFileHeader;
    if (caseFile.header.fechaUltimaActuacion !== null) {
      updateCaseFileHeader = `mutation {
        updateExpediente(
          where:{
            id: "${caseFileID}"
          },
          data: {
            caratula: """${caseFile.header.caratula
              .trim()
              .replace(/"/g, "")}""",
            estado: "${caseFile.header.estado}",
            ubicacionActual: "${caseFile.header.ubicacionActual}"
            fechaIngreso: "${caseFile.header.fechaIngreso}"
            extractoUltimaActuacion: "${
              caseFile.header.extractoUltimaActuacion
            }"
            fechaUltimaActuacion: "${caseFile.header.fechaUltimaActuacion}"
            linkCaratulaActual: "${caseFileLinkCurrentCover}"
            linksCaratulas: {set: ${JSON.stringify(linksTbodyCourts)}}
          }
        ){
          id
        }
      }`;
    } else {
      updateCaseFileHeader = `mutation {
        updateExpediente(
          where:{
            id: "${caseFileID}"
          },
          data: {
            caratula: """${caseFile.header.caratula
              .trim()
              .replace(/"/g, "")}""",
            estado: "${caseFile.header.estado}",
            ubicacionActual: "${caseFile.header.ubicacionActual}"
            fechaIngreso: "${caseFile.header.fechaIngreso}"
            linkCaratulaActual: "${caseFileLinkCurrentCover}"
            linksCaratulas: {set: ${JSON.stringify(linksTbodyCourts)}}
          }
        ){
          id
        }
      }`;
    }

    try {
      // se realiza la mutation:update de la cabecera del expediente
      const response = await client.request(updateCaseFileHeader);
      console.log(response);
    } catch (error) {
      console.log(error);
    }

    // Si el organismo que cargo el usuario es distinto al organismo actual del expediente, se lo actualiza y se dispara el webhook
    if (caseFile.header.organismo !== caseFileCourt) {
      // necesito obtener el id del organismo al que pertenece el expediente para poder hacer la mutation
      const queryOrganismoID = `{
        localidad(where: { id: "${localityID}" }) {
          organismos(where: { nombre: "${caseFile.header.organismo}" }) {
            id
          }
        }
      }`;

      let responseOrganismoID = await client.request(queryOrganismoID);

      const updateCaseFileCourt = `mutation {
        updateExpediente(
          where:{
            id: "${caseFileID}"
          },
          data: {
            organismo: {
              connect: {
                id: "${responseOrganismoID.localidad.organismos[0].id}"
              }
            }
          }
        ){
          id
        }
      }`;

      try {
        // se realiza la mutation:update de la cabecera del expediente
        const response = await client.request(updateCaseFileCourt);
        console.log(response);

        console.log(
          `El organismo del expediente es distinto al cargado inicialmente!`
        );
        console.log(
          `Este es el organismo al que pertenece actualmente el expediente: ${
            caseFile.header.organismo
          }, y este es el que cargo el usuario: ${caseFileCourt}`
        );
        fetch("http://localhost:3035/api/webhook/trigger/updateCourt", {
          method: "post",
          body: JSON.stringify({ organismo: caseFile.header.organismo.trim() }),
          headers: { "Content-Type": "application/json" }
        })
          .then(res => res.json())
          .then(json => console.log(json));
      } catch (error) {
        console.log(error);
      }
    }
  }
};

module.exports = obtainProvidences;
