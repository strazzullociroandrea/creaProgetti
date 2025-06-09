const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(question, answer => {
    rl.close();
    resolve(answer.trim());
  }));
}

function checkGitHubRepoExists(url) {
  return new Promise(resolve => {
    const repoPath = url.replace('https://github.com/', '');
    const options = {
      method: 'HEAD',
      host: 'api.github.com',
      path: `/repos/${repoPath}`,
      headers: { 'User-Agent': 'node.js' }
    };

    const req = https.request(options, res => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.end();
  });
}

async function creaReact() {
  try {
    const nomeProgetto = await prompt('📦 Inserisci il nome del progetto React + Vite: ');

    // Crea progetto con Vite (che genera anche la directory)
    execSync(`npm create vite@latest ${nomeProgetto} -- --template react`, { stdio: 'inherit' });

    const projectPath = path.join(process.cwd(), nomeProgetto);
    process.chdir(projectPath);

    execSync('npm install', { stdio: 'inherit' });

    const githubUrl = await prompt('🔗 Inserisci il link del repo GitHub (facoltativo): ');

    if (githubUrl) {
      const exists = await checkGitHubRepoExists(githubUrl);
      if (exists) {
        const useGit = await prompt('✅ Il repository esiste. Vuoi associarlo? (s/N): ');
        if (useGit.toLowerCase() === 's' || useGit.toLowerCase() === 'y') {
          execSync('git init', { stdio: 'ignore' });
          execSync(`git remote add origin ${githubUrl}`, { stdio: 'ignore' });
          console.log('✅ Repository GitHub collegato.');
        }
      } else {
        console.warn('⚠️ Il repository GitHub non esiste o non è raggiungibile.');
      }
    }

    // Crea .gitignore se mancante
    if (!fs.existsSync('.gitignore')) {
      fs.writeFileSync('.gitignore', 'node_modules\n/dist\n');
      console.log('📝 Creato .gitignore');
    }

    // Crea README.md se mancante
    if (!fs.existsSync('README.md')) {
      fs.writeFileSync('README.md', `# ${nomeProgetto}\n\nCreato con \`creaprogetto\` + Vite + React.\n`);
      console.log('📝 Creato README.md');
    }

    console.log('\n🎉 Progetto React+Vite creato con successo!');
    console.log(`👉 cd ${nomeProgetto} && npm run dev`);

  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
}

module.exports = creaReact;
