#!/usr/bin/env node

const args = process.argv.slice(2);

if (args.length < 2 || args[0] !== 'init') {
  console.log('Uso: creaprogetto init [nodejs|java|html|cpp|astro]');
  process.exit(1);
}

const projectType = args[1].toLowerCase();

switch(projectType) {
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
    require('./cpp')();
    break;
  case 'astro':
    require('./astro')();
  break;
  default:
    console.log(`Tipo progetto non supportato: ${projectType}`);
    process.exit(1);
}
