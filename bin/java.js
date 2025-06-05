#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const questionAsync = promisify(rl.question).bind(rl);
  try {
    let answer;
    do {
      answer = await questionAsync(query);
    } while (!answer || answer.trim() === '');
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function createJavaProject() {
  try {
    const currentDir = process.cwd();

    const nomeProgetto = await askQuestion("Inserisci il nome del progetto Java: ");

    // Creo solo la cartella src
    const srcDir = path.join(nomeProgetto, 'src');
    const fullSrcPath = path.join(currentDir, srcDir);
    fs.mkdirSync(fullSrcPath, { recursive: true });
    console.log(`📁 Cartella creata: ${fullSrcPath}`);

    // Creo Main.java
    const mainJava = `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from ${nomeProgetto}!");
    }
}
`.trim();

    const mainJavaPath = path.join(fullSrcPath, 'Main.java');
    fs.writeFileSync(mainJavaPath, mainJava, 'utf8');
    console.log(`📝 File 'Main.java' creato in: ${mainJavaPath}`);

    // Creo run.sh (Linux/macOS)
    const runShContent = `#!/bin/bash
mkdir -p out
javac -d out src/Main.java
if [ $? -eq 0 ]; then
  java -cp out Main
else
  echo "Compilazione fallita"
fi
`;
    const runShPath = path.join(currentDir, nomeProgetto, 'run.sh');
    fs.writeFileSync(runShPath, runShContent, { mode: 0o755 });
    console.log("📝 File 'run.sh' creato e reso eseguibile.");

    // Creo run.bat (Windows)
    const runBatContent = `
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
`;
    const runBatPath = path.join(currentDir, nomeProgetto, 'run.bat');
    fs.writeFileSync(runBatPath, runBatContent);
    console.log("📝 File 'run.bat' creato.");

    console.log(`✅ Progetto Java '${nomeProgetto}' creato correttamente in: ${path.join(currentDir, nomeProgetto)}`);
    console.log(`Usa 'run.sh' (Linux/macOS) o 'run.bat' (Windows) per compilare ed eseguire il progetto.`);

  } catch (e) {
    console.error('❌ Errore durante la creazione del progetto:', e.message);
  }
}

module.exports = createJavaProject;
