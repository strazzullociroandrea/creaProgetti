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

    // Chiedi il nome del progetto prima
    const projectName = await askQuestion('📦 Inserisci il nome del progetto Astro: ');
    if (!projectName) {
      console.error('❌ Nome progetto non valido');
      process.exit(1);
    }

    // Esegui il comando in modo non interattivo se possibile, specificando il nome
    // Se non si può, almeno facciamo il cd dopo la creazione

    // Qui usa il flag -- --template minimal per creare progetto minimal e senza prompt
    execSync(`npm create astro@latest ${projectName} -- --template minimal`, { stdio: 'inherit' });

    const projectPath = path.join(process.cwd(), projectName);

    // README.md base dentro la cartella progetto
    const readmePath = path.join(projectPath, 'README.md');
    const readmeContent = `# ${projectName}

Progetto creato con \`npm create astro@latest\`.
`;

    writeIfMissing(readmePath, readmeContent, 'creato');

    // .gitignore base dentro la cartella progetto
    const gitignorePath = path.join(projectPath, '.gitignore');
    const gitignoreContent = `node_modules/
dist/
.astro/
.env
`;

    writeIfMissing(gitignorePath, gitignoreContent, 'creato');
  } catch (error) {
    console.error('❌ Errore durante la creazione del progetto Astro:', error.message);
    process.exit(1);
  }
};
