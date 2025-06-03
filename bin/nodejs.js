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
        if (stderr) {
            console.error("⚠️ Errore:", stderr);
        }
        return stdout;
    } catch (error) {
        console.error("❌ Errore durante l'esecuzione:", error.message);
    }
}

async function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const questionAsync = (q) => new Promise(resolve => rl.question(q, resolve));

    let answer;
    try {
        do {
            answer = await questionAsync(question);
        } while (!answer || answer.trim() === "");
        return answer.trim();
    } finally {
        rl.close();
    }
}

async function createProject() {
    try {
        const rootDir = process.cwd();

        // Version check può restare fuori o dentro createProject a seconda di come richiami il modulo
        if (process.argv.includes('--version')) {
            const packageJsonPath = path.join(__dirname, '..', 'package.json');
            console.log(`Versione: ${ JSON.parse(fs.readFileSync(packageJsonPath)).version }`);
            process.exit(0);
        }

        const nomeProgetto = await askQuestion("Inserisci il nome del progetto: ");

        // Creo la cartella del progetto e cambio dir di lavoro
        const projectPath = path.join(rootDir, nomeProgetto);
        if (fs.existsSync(projectPath)) {
            console.error(`❌ La cartella ${nomeProgetto} esiste già. Scegli un nome diverso o elimina la cartella.`);
            process.exit(1);
        }
        fs.mkdirSync(projectPath);
        process.chdir(projectPath); // <-- Qui cambio la working directory dentro la cartella progetto
        console.log(`📂 Cartella progetto creata e spostato in: ${projectPath}`);

        let isModule;
        do {
            isModule = await askQuestion("Vuoi usare gli import (y/n)? ");
        } while (!['y', 'n'].includes(isModule.toLowerCase()));

        let isGithub;
        do {
            isGithub = await askQuestion("Vuoi usare github (y/n)? ");
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

        let porta;
        do {
            porta = await askQuestion("Inserisci la porta di ascolto: ");
        } while (isNaN(porta) || Number(porta) <= 0);
        porta = Number(porta);

        const dirPublic = path.join(process.cwd(), 'public');
        if (!fs.existsSync(dirPublic)) {
            fs.mkdirSync(dirPublic, { recursive: true });
            console.log("📁 Cartella 'public' creata.");
        }

        const indexPath = path.join(dirPublic, 'index.html');
        if (!fs.existsSync(indexPath)) {
            fs.writeFileSync(indexPath, htmlBase(nomeProgetto), 'utf8');
            console.log("📝 File 'index.html' creato.");
        }

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
                console.warn("⚠️ Errore nel parsing di 'conf.json', verrà sovrascritto.");
            }
        }

        if (typeof conf.porta !== 'number' || isNaN(conf.porta) || conf.porta <= 0 || conf.porta !== porta) {
            conf.porta = porta;
            fs.writeFileSync(confPath, JSON.stringify(conf, null, 2), 'utf8');
            console.log("🔧 File 'conf.json' aggiornato o creato.");
        } else {
            console.log("✅ File 'conf.json' già valido. Nessuna modifica.");
        }

        const packagePath = path.join(process.cwd(), 'package.json');
        fs.writeFileSync(packagePath, createPackageJson(nomeProgetto, isModule.toLowerCase() === 'y'), 'utf8');
        console.log("📝 File 'package.json' scritto.");

        const indexJsPath = path.join(process.cwd(), 'index.js');
        fs.writeFileSync(indexJsPath, isModule.toLowerCase() === 'y' ? mainImport() : mainRequire(), 'utf8');
        console.log("📝 File 'index.js' scritto.");

        console.log("📦 Installazione dipendenze...");
        const installCommand = isModule.toLowerCase() === 'y'
            ? "npm install express http path body-parser fs url"
            : "npm install express http path body-parser fs";
        await executePrompt(installCommand);

        console.log("✅ Progetto creato con successo!");

    } catch (error) {
        console.error("❌ Errore durante la creazione del progetto:", error.message);
    }
}

// Esportiamo la funzione
module.exports = createProject;
