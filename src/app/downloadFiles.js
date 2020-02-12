const Nightmare = require("nightmare");
require("nightmare-inline-download")(Nightmare);
const Xvfb = require("xvfb");
const path = require("path");

// main function
const main = async () => {
  const close = await xvfb();
  // configuring nightmare in headless mode
  const nightmare = Nightmare({ show: false });

  const [err, title] = await poss(run(nightmare));
  if (err) {
    // cleanup properly
    await nightmare.end();
    await close();
    throw err;
  }

  // shutting down
  await nightmare.end();
  await close();
  return title;
};

// running the code of nightmare
async function run(nightmare) {
  const pathToSaveNotifications = path.resolve(__dirname, "../notifications");

  await nightmare.goto("https://iol.juscorrientes.gov.ar:8443/iurix-online/");

  await nightmare.type('input[name="txtUser"]', "vero86");
  await nightmare.type('input[name="txtPassword"]', "leonel86");
  await nightmare.click('input[name="submit1"]');

  await nightmare.wait('a[href="/iurix-online/jsp/QueryNotific.jsp"]');
  await nightmare.click('a[href="/iurix-online/jsp/QueryNotific.jsp"]');

  let lesOptions = await nightmare.evaluate(() => {
    let options = document.querySelectorAll(
        `select[name="cbocircunscripcion"] option`
      ),
      i;
    let values = [];

    for (let i = 1; i < options.length; i++) {
      obj = {};
      obj.value = options[i].value;
      obj.text = options[i].text;
      values.push(obj);
    }

    return values;
  });

  for (let i = 0; i < lesOptions.length; i++) {
    await nightmare.select(`select`, lesOptions[i].value);
    await nightmare.wait(1000);

    await nightmare.wait('input[value="Buscar"]');
    await nightmare.click('input[value="Buscar"]');

    await nightmare.wait(800);
    await nightmare.click("center a");
    await nightmare.download(
      `${pathToSaveNotifications}/${lesOptions[i].text}.xls`
    );
    await nightmare.wait(800);
  }

  return "files downloaded successfully!";
}

// xvfb wrapper
function xvfb(options) {
  // xvfb server to perform the tasks without showing any screen output
  var xvfb = new Xvfb(options);

  function close() {
    return new Promise((resolve, reject) => {
      xvfb.stop(err => (err ? reject(err) : resolve()));
    });
  }

  return new Promise((resolve, reject) => {
    xvfb.start(err => (err ? reject(err) : resolve(close)));
  });
}

// try/catch helper
async function poss(promise) {
  try {
    const result = await promise;
    return [null, result];
  } catch (err) {
    return [err, null];
  }
}

module.exports = main;
