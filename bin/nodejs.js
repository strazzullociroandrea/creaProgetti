#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const htmlBase = require("./nodeutil/htmlBase");
const createPackageJson = require("./nodeutil/package");
const mainImport = require("./nodeutil/import");
const mainRequire = require("./nodeutil/require");
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
            console.warn("⚠️", stderr.trim());
        }
        return stdout;
    } catch (error) {
        console.error(`❌ Errore durante '${command}':`, error.message);
        return null;
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

async function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const answer = await new Promise(resolve => rl.question(question, resolve));
    rl.close();
    return answer.trim();
}

module.exports = async function createProject() {
    try {
        const rootDir = process.cwd();
        const nomeProgetto = await askQuestion("📦 Inserisci il nome del progetto: ");
        const projectPath = path.join(rootDir, nomeProgetto);

        if (fs.existsSync(projectPath)) {
            console.error(`❌ La cartella '${nomeProgetto}' esiste già.`);
            process.exit(1);
        }
        fs.mkdirSync(projectPath);
        process.chdir(projectPath);
        console.log(`📁 Cartella progetto creata: ${projectPath}`);

        const isModule = (await askQuestion("🧩 Vuoi usare gli import ES6 (y/n)? ")).toLowerCase() === "y";
        const hasGit = await gitIsAvailable();

        let isGithub = false;
        if (hasGit) {
            isGithub = (await askQuestion("🔧 Vuoi collegare una repo GitHub (y/n)? ")).toLowerCase() === "y";
        } else {
            console.warn("⚠️ Git non è disponibile. Operazioni Git disabilitate.");
        }

        if (hasGit && isGithub) {
            let repositoryUrl;
            while (true) {
                repositoryUrl = await askQuestion("🔗 Inserisci l'URL della repository GitHub: ");
                const valid = isValidGitHubUrl(repositoryUrl);
                const exists = valid ? await githubRepoExists(repositoryUrl) : false;

                if (!valid) {
                    console.log("❌ URL non valida. Deve essere del tipo: https://github.com/utente/progetto.git");
                } else if (!exists) {
                    console.log("⚠️ Repository non trovata o non accessibile.");
                } else {
                    console.log("✅ Repository valida. Clonazione...");
                    await executePrompt("rm -rf .git");
                    await executePrompt("git init");
                    await executePrompt(`git remote add origin ${repositoryUrl}`);
                    await executePrompt("git pull origin main || git pull origin master");
                    break;
                }
            }
        }

        // PORTA
        let porta;
        do {
            porta = await askQuestion("🌐 Inserisci la porta di ascolto: ");
        } while (isNaN(porta) || Number(porta) <= 0);
        porta = Number(porta);

        // PUBLIC
        const dirPublic = path.join(process.cwd(), 'public');
        if (!fs.existsSync(dirPublic)) {
            fs.mkdirSync(dirPublic, { recursive: true });
            console.log("📁 Cartella 'public' creata.");
        }

        const indexHtmlPath = path.join(dirPublic, 'index.html');
        if (!fs.existsSync(indexHtmlPath)) {
            fs.writeFileSync(indexHtmlPath, htmlBase(nomeProgetto), 'utf8');
            console.log("📝 File 'index.html' creato.");
        }

        // ASSETS + CONF
        const assetsDir = path.join(process.cwd(), 'assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
            console.log("📁 Cartella 'assets' creata.");
        }

        const confPath = path.join(assetsDir, 'conf.json');
        let conf = {};
        if (fs.existsSync(confPath)) {
            try {
                conf = JSON.parse(fs.readFileSync(confPath, 'utf8'));
            } catch {
                console.warn("⚠️ Errore parsing 'conf.json'. Verrà sovrascritto.");
            }
        }
        if (conf.porta !== porta) {
            conf.porta = porta;
            fs.writeFileSync(confPath, JSON.stringify(conf, null, 2), 'utf8');
            console.log("🔧 File 'conf.json' aggiornato.");
        }

        // package.json
        fs.writeFileSync("package.json", createPackageJson(nomeProgetto, isModule), 'utf8');
        console.log("📦 File 'package.json' creato.");

        // index.js
        fs.writeFileSync("index.js", isModule ? mainImport() : mainRequire(), 'utf8');
        console.log("📝 File 'index.js' creato.");

        // install deps
        console.log("📦 Installazione dipendenze...");
        const installCmd = isModule
            ? "npm install express http path body-parser fs url"
            : "npm install express http path body-parser fs";
        await executePrompt(installCmd);

        console.log("🎉 Progetto Node creato con successo!");

    } catch (error) {
        console.error("❌ Errore generale:", error.message);
    }
};
