#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function gitIsAvailable() {
  try {
    execSync("git --version", { stdio: 'ignore' });
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

async function createJavaProject() {
  try {
    const baseDir = process.cwd();

    let nomeProgetto;
    do {
      nomeProgetto = await askQuestion("📦 Inserisci il nome del progetto Java: ");
    } while (!nomeProgetto);

    const projectPath = path.join(baseDir, nomeProgetto);
    if (fs.existsSync(projectPath)) {
      console.error(`❌ La cartella '${nomeProgetto}' esiste già.`);
      process.exit(1);
    }

    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    console.log("📁 Cartella 'src' creata.");

    const mainJava = `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from ${nomeProgetto}!");
    }
}
    `.trim();
    fs.writeFileSync(path.join(projectPath, 'src', 'Main.java'), mainJava);
    console.log("📝 File 'Main.java' creato.");

    // run.sh
    const runSh = `#!/bin/bash
mkdir -p out
javac -d out src/Main.java
if [ $? -eq 0 ]; then
  java -cp out Main
else
  echo "Compilazione fallita"
fi`;
    fs.writeFileSync(path.join(projectPath, 'run.sh'), runSh, { mode: 0o755 });
    console.log("📝 Script 'run.sh' creato.");

    // run.bat
    const runBat = `
@echo off
if not exist out (
  mkdir out
)
javac -d out src\\Main.java
if %errorlevel% neq 0 (
  echo Compilazione fallita
  exit /b %errorlevel%
)
java -cp out Main
pause
    `.trim();
    fs.writeFileSync(path.join(projectPath, 'run.bat'), runBat);
    console.log("📝 Script 'run.bat' creato.");

    // Git
    const usaGit = gitIsAvailable()
      ? (await askQuestion("Vuoi inizializzare una repo Git? (y/n): ")).toLowerCase() === 'y'
      : false;

    if (usaGit && gitIsAvailable()) {
      process.chdir(projectPath);
      execSync("git init", { stdio: 'ignore' });
      console.log("✅ Inizializzata repository Git.");
    }

    // README & .gitignore
    const readmePath = path.join(projectPath, 'README.md');
    const gitignorePath = path.join(projectPath, '.gitignore');

    const readmeContent = `# ${nomeProgetto}\n\nProgetto Java creato automaticamente.\n`;
    const gitignoreContent = `out/\n*.class\n.DS_Store\n`;

    writeIfMissing(readmePath, readmeContent, "creato");
    writeIfMissing(gitignorePath, gitignoreContent, "creato");

    console.log(`✅ Progetto Java '${nomeProgetto}' creato in: ${projectPath}`);
    console.log("👉 Usa 'run.sh' o 'run.bat' per compilare ed eseguire il progetto.");

  } catch (error) {
    console.error("❌ Errore durante la creazione del progetto:", error.message);
  }
}

module.exports = createJavaProject;
