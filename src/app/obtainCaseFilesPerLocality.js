const { GraphQLClient } = require("graphql-request");
const fs = require("fs");
const path = require("path");

const client = new GraphQLClient("http://localhost:4466");

const obtainCaseFilesPerLocality = async () => {
  const pathToCaseFilesAPI = path.resolve(
    __dirname,
    "../caseFilesPerLocalityAPI"
  );

  const obtainLocalities = `{
    jurisdiccion(where: {id: "ck6jalo2z00iu082441gnbmfh"}){
      localidades {
        nombre
        id
      }
    }
  }`;

  const responseLocalities = await client.request(obtainLocalities);
  const localities = responseLocalities.jurisdiccion.localidades;
  console.log(localities);

  localities.forEach(async locality => {
    const obtainLocality = `{
      localidad(where: { id: "${locality.id}" }) {
        expedientes {
          id
          numero
          anio
          linksCaratulas
          linkCaratulaActual
          organismo {
            nombre
          }
          providencias {
            id
          }
        }
      }
    }`;

    let caseFilesPerLocality = {};
    caseFilesPerLocality.caseFiles = [];
    caseFilesPerLocality.name = locality.nombre;
    caseFilesPerLocality.id = locality.id;

    const localityResponse = await client.request(obtainLocality);

    localityResponse.localidad.expedientes.forEach(exp => {
      caseFilesPerLocality.caseFiles.push({
        number: exp.numero.toString() + "/" + exp.anio.toString(),
        id: exp.id,
        numberOfProvidences: exp.providencias.length,
        court: exp.organismo.nombre,
        linkCurrentCover: exp.linkCaratulaActual,
        linksCovers: exp.linksCaratulas
      });
    });

    // caseFilesLocality.numberOfProvidences = response.localidad.expedientes.providencias.length;

    let caseFilesPerLocalityJSON = JSON.stringify(caseFilesPerLocality);
    fs.writeFileSync(
      `${pathToCaseFilesAPI}/${locality.nombre}.json`,
      caseFilesPerLocalityJSON
    );
    //console.log(caseFilesLocality);
  });
};

module.exports = obtainCaseFilesPerLocality;
// client.request(query).then(data => console.log(JSON.stringify(data.localidad.expedientes, undefined, 2)))
