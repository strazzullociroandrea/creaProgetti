/**
 * Funzione per ottenere l'html base del progetto inserito nella cartella public .
 * @param {String} name nome del progetto
 * @returns file 
 */
const htmlBase = (name) =>{
    return `
<!DOCTYPE html>
<html>
    <head>
        <title>${name}</title>
    </head>
    <body>
        <h2> Server is running correctly! </h2>
    </body>
</html>
    `;
}

module.exports = htmlBase;