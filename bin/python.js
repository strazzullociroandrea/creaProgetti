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
        if (stderr) {
            console.error("⚠️ Errore:", stderr);
        }
        return stdout;
    } catch (error) {
        console.error("❌ Errore durante l'esecuzione:", error.message);
    }
}

module.exports = async() =>{ 
    const rootDir = process.cwd();
    const nomeProgetto = askQuestion("Inserisci il nome del progetto: ");
    const projectPath = path.join(rootDir, nomeProgetto);
    if (fs.existsSync(projectPath)) {
        console.error(`❌ La cartella ${nomeProgetto} esiste già. Scegli un nome diverso o elimina la cartella.`);
        process.exit(1);
    }
    fs.mkdirSync(projectPath);
    process.chdir(projectPath); 

    const paginaMain = `
def saluta(): 
    print("Hello world")

if __name__ == "__main__":
    saluta()
`;
    const indexPath = path.join(dirPublic, 'main.py');
    if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, paginaMain, 'utf8');
        console.log("📝 File 'main.py' creato.");
    }
    let isGithub;
    do {
        sGithub = await askQuestion("Vuoi usare github (y/n)? ");
    } while (!['y', 'n'].includes(isGithub.toLowerCase()));

    let repositoryUrl;
    if (isGithub.toLowerCase() === "y") {
        do {
        repositoryUrl = await askQuestion("🔗 Inserisci l'URL della repository GitHub: ");
        const isValid = isValidGitHubUrl(repositoryUrl);
        const exists = isValid ? await githubRepoExists(repositoryUrl) : false;

        if (!isValid) {
            console.log("❌ URL non valida. Deve essere del tipo: https://github.com/utente/progetto.git");
        } else if (!exists) {
            console.log("⚠️ Repository non trovata o non accessibile.");
        } else {
            console.log("✅ Repository valida e trovata.");
            await executePrompt("rm -rf .git");
            await executePrompt("git init");
            const remotes = await executePrompt("git remote");
            if (remotes && remotes.includes("origin")) {
                console.log("🔁 Remote 'origin' già presente. Rimuovo...");
                await executePrompt("git remote remove origin");
            }
                await executePrompt(`git remote add origin ${repositoryUrl}`);
                await executePrompt("git pull origin main || git pull origin master");
                break;
            }
        } while (true);
    }
    console.log("Progetto creato con successo!");
}