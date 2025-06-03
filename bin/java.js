const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');
const { execSync } = require('child_process');

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
    const basePackage = await askQuestion("Inserisci il package base (es. com.example): ");
    const packagePath = basePackage.replace(/\./g, path.sep);

    // Creo cartelle essenziali, incluse quelle per Main.java
    const dirsToCreate = [
      path.join(nomeProgetto, 'src', 'main', 'java', packagePath),
      path.join(nomeProgetto, 'src', 'main', 'resources')
    ];

    dirsToCreate.forEach(dir => {
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

group '${basePackage}'
version '1.0-SNAPSHOT'

repositories {
    mavenCentral()
}

application {
    mainClass = '${basePackage}.Main'
}
`.trim();

    fs.writeFileSync(path.join(currentDir, nomeProgetto, 'build.gradle'), buildGradle, 'utf8');
    console.log("📝 File 'build.gradle' creato.");

    // Creo settings.gradle
    const settingsGradle = `rootProject.name = '${nomeProgetto}'`;
    fs.writeFileSync(path.join(currentDir, nomeProgetto, 'settings.gradle'), settingsGradle, 'utf8');
    console.log("📝 File 'settings.gradle' creato.");

    // Creo Main.java
    const mainJava = `
package ${basePackage};

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from ${nomeProgetto}!");
    }
}
`.trim();

    const mainJavaPath = path.join(currentDir, nomeProgetto, 'src', 'main', 'java', ...basePackage.split('.'));
    fs.writeFileSync(path.join(mainJavaPath, 'Main.java'), mainJava, 'utf8');
    console.log(`📝 File 'Main.java' creato in: ${mainJavaPath}`);

    // Creo run.sh (Linux/macOS)
    const runShContent = `#!/bin/bash
mkdir -p out
javac -d out src/main/java/${packagePath.replace(/\\/g, '/')}/*.java
if [ $? -eq 0 ]; then
  java -cp out ${basePackage}.Main
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
javac -d out src\\main\\java\\${packagePath}\\*.java
if %errorlevel% neq 0 (
  echo Compilazione fallita
  exit /b %errorlevel%
)
java -cp out ${basePackage}.Main
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

// Esportiamo la funzione così può essere richiamata da altri file
module.exports = createJavaProject;
