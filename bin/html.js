#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const askQuestion = async (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const questionAsync = promisify(rl.question).bind(rl);

    let answer;
    try {
        do {
            answer = await questionAsync(question);
        } while (!answer.trim());
        return answer.trim();
    } finally {
        rl.close();
    }
};

module.exports = async function createHtmlProject() {
    try {
        const projectName = await askQuestion("🧱 Nome del progetto: ");
        const currentDir = process.cwd();
        const projectPath = path.join(currentDir, projectName);

        // Crea la directory
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath);
            console.log("📁 Cartella creata:", projectName);
        } else {
            console.error("❌ La cartella esiste già!");
            process.exit(1);
        }

        // Crea file index.html
        const htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <h1>Benvenuto in ${projectName}!</h1>

    <script src="script.js"></script>
</body>
</html>`;

        fs.writeFileSync(path.join(projectPath, 'index.html'), htmlContent, 'utf8');
        console.log("📝 Creato: index.html");

        // Crea file style.css
        fs.writeFileSync(path.join(projectPath, 'style.css'), `/* Stili CSS per ${projectName} */\nbody { font-family: sans-serif; }`, 'utf8');
        console.log("🎨 Creato: style.css");

        // Crea file script.js
        fs.writeFileSync(path.join(projectPath, 'script.js'), `// JavaScript per ${projectName}\nconsole.log("Ciao da ${projectName}!");`, 'utf8');
        console.log("📜 Creato: script.js");

        console.log("✅ Progetto HTML creato con successo!");
    } catch (err) {
        console.error("❌ Errore:", err.message);
    }
};
