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

    // Creo cartelle essenziali
    const srcDir = path.join(nomeProgetto, 'src');
    const resourcesDir = path.join(nomeProgetto, 'resources');

    [srcDir, resourcesDir].forEach(dir => {
      const fullPath = path.join(currentDir, dir);
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Cartella creata: ${fullPath}`);
    });

    // Creo build.gradle
    const buildGradle = `
plugins {
    id 'java'
    id 'application'
}

group 'main'
version '1.0-SNAPSHOT'

repositories {
    mavenCentral()
}

application {
    mainClass = 'Main'
}
`.trim();

    fs.writeFileSync(path.join(currentDir, nomeProgetto, 'build.gradle'), buildGradle, 'utf8');
    console.log("📝 File 'build.gradle' creato.");

    // Creo settings.gradle
    const settingsGradle = `rootProject.name = '${nomeProgetto}'`;
    fs.writeFileSync(path.join(currentDir, nomeProgetto, 'settings.gradle'), settingsGradle, 'utf8');
    console.log("📝 File 'settings.gradle' creato.");

    // Creo Main.java in src
    const mainJava = `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from ${nomeProgetto}!");
    }
}
`.trim();

    const mainJavaPath = path.join(currentDir, srcDir, 'Main.java');
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
