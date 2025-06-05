#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

// Version check
if (args.includes('--version')) {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`Versione: ${packageJson.version}`);
  } catch (e) {
    console.error('Impossibile leggere la versione dal package.json');
  }
  process.exit(0);
}

// Controllo argomenti
if (args.length < 2 || args[0] !== 'init') {
  console.log('Uso: creaprogetto init [nodejs|java|html|cpp|astro|python]');
  process.exit(1);
}

const projectType = args[1].toLowerCase();

switch (projectType) {
  case 'nodejs':
    require('./nodejs')();
    break;
  case 'java':
    require('./java')();
    break;
  case 'html':
    require('./html')();
    break;
  case 'cpp':
  case 'c++':
  case 'c':
    require('./cpp')();
    break;
  case 'astro':
    require('./astro')();
    break;
  case 'python':
    require('./python')();
    break;
  default:
    console.log(`Tipo progetto non supportato: ${projectType}`);
    process.exit(1);
}
