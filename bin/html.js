#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function gitIsAvailable() {
  try {
    execSync("git --version", { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function writeIfMissing(filePath, content, description) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📝 File '${path.basename(filePath)}' ${description}.`);
  }
}

module.exports = async function createHtmlProject() {
  try {
    const projectName = await askQuestion("🧱 Nome del progetto HTML: ");
    const currentDir = process.cwd();
    const projectPath = path.join(currentDir, projectName);

    // Check esistenza cartella
    if (fs.existsSync(projectPath)) {
      console.error("❌ La cartella esiste già!");
      process.exit(1);
    }

    fs.mkdirSync(projectPath);
    console.log("📁 Cartella creata:", projectName);

    // index.html
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

    // style.css
    fs.writeFileSync(path.join(projectPath, 'style.css'), `/* Stili CSS per ${projectName} */\nbody { font-family: sans-serif; }`, 'utf8');
    console.log("🎨 Creato: style.css");

    // script.js
    fs.writeFileSync(path.join(projectPath, 'script.js'), `// JavaScript per ${projectName}\nconsole.log("Ciao da ${projectName}!");`, 'utf8');
    console.log("📜 Creato: script.js");

    // Git
    const usaGit = gitIsAvailable()
      ? (await askQuestion("Vuoi inizializzare una repo Git? (y/n): ")).toLowerCase() === 'y'
      : false;

    if (usaGit && gitIsAvailable()) {
      process.chdir(projectPath);
      execSync("git init", { stdio: 'ignore' });
      console.log("✅ Repository Git inizializzata.");
    }

    // README & .gitignore
    const readmePath = path.join(projectPath, 'README.md');
    const gitignorePath = path.join(projectPath, '.gitignore');

    const readmeContent = `# ${projectName}\n\nProgetto HTML base creato automaticamente.\n`;
    const gitignoreContent = `.DS_Store\nnode_modules/\n`;

    writeIfMissing(readmePath, readmeContent, "creato");
    writeIfMissing(gitignorePath, gitignoreContent, "creato");

    console.log("✅ Progetto HTML creato con successo!");

  } catch (err) {
    console.error("❌ Errore:", err.message);
  }
};
