#!/usr/bin/env node

const args = process.argv.slice(2);

// Version check può restare fuori o dentro createProject a seconda di come richiami il modulo
if (process.argv.includes('--version')) {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  console.log(`Versione: ${ JSON.parse(fs.readFileSync(packageJsonPath)).version }`);
  process.exit(0);
}

if (args.length < 2 || args[0] !== 'init') {
  console.log('Uso: creaprogetto init [nodejs|java|html|cpp|astro|python]');
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
  case 'cpp' || 'c++' || 'c':
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
