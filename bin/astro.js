#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

module.exports = () => {
  try {
    if (!commandExists('node')) {
      console.error('❌ Node.js non è installato o non è nel PATH.');
      process.exit(1);
    }
    if (!commandExists('npm')) {
      console.error('❌ npm non è installato o non è nel PATH.');
      process.exit(1);
    }

    // Esegui comando di creazione Astro (mostra output in tempo reale)
    execSync('npm create astro@latest', { stdio: 'inherit' });

    // Dopo creazione, se non c'è Git o non viene usato, crea README.md e .gitignore base
    const cwd = process.cwd();

    // README.md base
    const readmePath = path.join(cwd, 'README.md');
    const readmeContent = `# Progetto Astro

Progetto creato con \`npm create astro@latest\`.
`;

    writeIfMissing(readmePath, readmeContent, 'creato');

    // .gitignore base
    const gitignorePath = path.join(cwd, '.gitignore');
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
