#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); 
const https = require('https');
const { promisify } = require('util');
const execAsync = promisify(exec);

function isValidGitHubUrl(url) {
    const regex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/;
    return regex.test(url);
}

function githubRepoExists(url) {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function executePrompt(command) {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr && stderr.trim()) {
            console.warn("⚠️  Stderr:", stderr);
        }
        return stdout;
    } catch (error) {
        console.error(`❌ Errore eseguendo: ${command}`);
        console.error(error.message);
        return null;
    }
}

async function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const answer = await new Promise(resolve => rl.question(question, resolve));
    rl.close();
    return answer.trim();
}

function createFileIfNotExists(filePath, content) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
        console.log(`📄 File '${path.basename(filePath)}' creato.`);
    }
}

async function gitIsAvailable() {
    try {
        await execAsync("git --version");
        return true;
    } catch {
        return false;
    }
}

module.exports = async () => {
    const rootDir = process.cwd();
    const nomeProgetto = await askQuestion("📦 Inserisci il nome del progetto: ");
    const projectPath = path.join(rootDir, nomeProgetto);

    if (fs.existsSync(projectPath)) {
        console.error(`❌ La cartella '${nomeProgetto}' esiste già.`);
        process.exit(1);
    }

    fs.mkdirSync(projectPath);
    process.chdir(projectPath);

    const hasGit = await gitIsAvailable();

    let isGithub = "n";
    if (hasGit) {
        do {
            isGithub = await askQuestion("🔧 Vuoi collegare una repo GitHub (y/n)? ");
        } while (!['y', 'n'].includes(isGithub.toLowerCase()));
    } else {
        console.warn("⚠️  Git non è installato. Operazioni Git disabilitate.");
    }

    if (hasGit && isGithub.toLowerCase() === "y") {
        let repositoryUrl;
        while (true) {
            repositoryUrl = await askQuestion("🔗 Inserisci l'URL della repository GitHub: ");
            const isValid = isValidGitHubUrl(repositoryUrl);
            const exists = isValid ? await githubRepoExists(repositoryUrl) : false;

            if (!isValid) {
                console.log("❌ URL non valida. Deve essere del tipo: https://github.com/utente/progetto.git");
            } else if (!exists) {
                console.log("⚠️  Repository non trovata o non accessibile.");
            } else {
                console.log("✅ Repository valida. Inizializzazione...");
                await executePrompt("rm -rf .git");
                await executePrompt("git init");
                await executePrompt(`git remote add origin ${repositoryUrl}`);

                const pulled = await executePrompt("git pull origin main") ||
                               await executePrompt("git pull origin master");

                if (pulled) {
                    console.log("📥 Codice importato dalla repository.");
                } else {
                    console.log("⚠️  Nessun branch remoto 'main' o 'master' trovato.");
                }
                break;
            }
        }
    }

    // ✅ Crea solo se non esistono (es. dopo la pull)
    createFileIfNotExists('main.py', `
def saluta(): 
    print("Hello world")

if __name__ == "__main__":
    saluta()
    `);

    createFileIfNotExists('README.md', `# ${nomeProgetto}\n\nDescrizione del progetto Python.`);
    createFileIfNotExists('requirements.txt', `# Inserisci le dipendenze qui`);
    createFileIfNotExists('.gitignore', `
__pycache__/
*.pyc
*.pyo
.env
venv/
`);

    console.log("✅ Progetto Python creato con successo nella cartella:", nomeProgetto);
};
