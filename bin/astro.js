#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const askQuestion = async (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
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

function commandExists(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
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

module.exports = async () => {
  try {
    if (!commandExists('node')) {
      console.error('❌ Node.js non è installato o non è nel PATH.');
      process.exit(1);
    }
    if (!commandExists('npm')) {
      console.error('❌ npm non è installato o non è nel PATH.');
      process.exit(1);
    }

    const projectName = await askQuestion('📦 Inserisci il nome del progetto Astro (per info, non obbligatorio): ');

    // Esegui il comando interattivo (lasciando a npm create astro@latest il prompt)
    execSync('npm create astro@latest', { stdio: 'inherit' });

    // Se l’utente ha inserito un nome progetto, prova a scrivere README.md e .gitignore nella cartella relativa
    if (projectName) {
      const projectPath = path.join(process.cwd(), projectName);

      // Controlla che esista la cartella progetto prima di scrivere i file
      if (fs.existsSync(projectPath)) {
        const readmePath = path.join(projectPath, 'README.md');
        const readmeContent = `# ${projectName}

Progetto creato con \`npm create astro@latest\`.
`;
        writeIfMissing(readmePath, readmeContent, 'creato');

        const gitignorePath = path.join(projectPath, '.gitignore');
        const gitignoreContent = `node_modules/
dist/
.astro/
.env
`;
        writeIfMissing(gitignorePath, gitignoreContent, 'creato');
      } else {
        console.warn(`⚠️ La cartella del progetto '${projectName}' non è stata trovata, salto la creazione di README.md e .gitignore`);
      }
    }

  } catch (error) {
    console.error('❌ Errore durante la creazione del progetto Astro:', error.message);
    process.exit(1);
  }
};
