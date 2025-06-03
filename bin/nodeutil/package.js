/**
 * Funzione per creare il package.json .
 * @param {String} name nome del progetto
 * @param {String} useModule y se viene usato l'import, altro per require
 * @returns file
 */
const createPackageJson = (name, useModule) => {
  const packageJson = {
    name: name,
    version: "1.0.0",
    main: "index.js",
    scripts: {
      start: "node index.js",
      test: "echo \"Error: no test specified\" && exit 1"
    },
    keywords: [],
    author: "",
    license: "ISC",
    description: "",
    dependencies: {}
  };

  if (useModule.toLowerCase() === "y") {
    packageJson.type = "module";
  }

  return JSON.stringify(packageJson, null, 2); // formato leggibile
};

module.exports = createPackageJson;