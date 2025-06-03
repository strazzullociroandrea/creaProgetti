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

(async () => {
  try {
    const currentDir = process.cwd();

    const nomeProgetto = await askQuestion("Inserisci il nome del progetto Java: ");
    const basePackage = await askQuestion("Inserisci il package base (es. com.example): ");
    const packagePath = basePackage.replace(/\./g, path.sep);

    // Creo cartelle essenziali
    const dirsToCreate = [
      `src/main/java/${packagePath}`,
      'src/main/resources'
    ];

    dirsToCreate.forEach(dir => {
      const fullPath = path.join(currentDir, nomeProgetto, dir);
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Cartella creata: ${fullPath}`);
    });

    // build.gradle
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

    // settings.gradle
    const settingsGradle = `rootProject.name = '${nomeProgetto}'`;
    fs.writeFileSync(path.join(currentDir, nomeProgetto, 'settings.gradle'), settingsGradle, 'utf8');
    console.log("📝 File 'settings.gradle' creato.");

    // Main.java
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

    console.log(`✅ Progetto Java '${nomeProgetto}' creato correttamente in: ${path.join(currentDir, nomeProgetto)}`);
    console.log(`Apri la cartella in VSCode o altro IDE e inizia a sviluppare.`);
    console.log(`Per compilare ed eseguire (se hai Gradle):`);
    console.log(`  cd ${nomeProgetto}`);
    console.log(`  ./gradlew run   (Linux/macOS)`);
    console.log(`  gradlew.bat run (Windows)`);

  } catch (e) {
    console.error('❌ Errore durante la creazione del progetto:', e.message);
  }
})();
