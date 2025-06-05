#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function gitIsAvailable() {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function writeIfMissing(filePath, content, description) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`📝 File '${path.basename(filePath)}' ${description}.`);
  }
}

async function createCppProject() {
  try {
    const projectName = await askQuestion("📦 Nome del progetto C++: ");
    const currentDir = process.cwd();
    const projectPath = path.join(currentDir, projectName);

    if (fs.existsSync(projectPath)) {
      console.error("❌ La cartella esiste già!");
      process.exit(1);
    }

    fs.mkdirSync(projectPath);
    console.log("📁 Cartella progetto creata:", projectName);

    // main.cpp
    const mainCpp = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from ${projectName}!" << endl;
    return 0;
}
`;
    fs.writeFileSync(path.join(projectPath, "main.cpp"), mainCpp);
    console.log("📝 Creato: main.cpp");

    // Makefile
    const makefile = `all:
\tg++ -o ${projectName} main.cpp

clean:
\trm -f ${projectName}
`;
    fs.writeFileSync(path.join(projectPath, "Makefile"), makefile);
    console.log("🔧 Creato: Makefile");

    // Cartelle include/ e src/
    fs.mkdirSync(path.join(projectPath, "include"));
    fs.mkdirSync(path.join(projectPath, "src"));
    console.log("📁 Cartelle 'include/' e 'src/' create.");

    // README.md (crealo solo se non esiste)
    const readmePath = path.join(projectPath, "README.md");
    const readmeContent = `# ${projectName}

Progetto C++ base generato automaticamente.

## Compilazione

\`\`\`bash
make
./${projectName}
\`\`\`

## Pulizia

\`\`\`bash
make clean
\`\`\`
`;
    writeIfMissing(readmePath, readmeContent, "creato");

    // Git
    const gitAvailable = gitIsAvailable();
    let useGit = false;
    if (gitAvailable) {
      const answer = (await askQuestion("Vuoi inizializzare una repo Git? (y/n): ")).toLowerCase();
      useGit = answer === "y";
    }

    if (useGit) {
      process.chdir(projectPath);
      execSync("git init", { stdio: "ignore" });
      console.log("✅ Repository Git inizializzata.");
    }

    // .gitignore se Git non usato o file mancante
    const gitignorePath = path.join(projectPath, ".gitignore");
    const gitignoreContent = `# Ignore binaries and build output
${projectName}
out/
*.o
*.exe
*.log
`;

    if (!useGit) {
      writeIfMissing(gitignorePath, gitignoreContent, "creato");
    } else if (useGit && !fs.existsSync(gitignorePath)) {
      writeIfMissing(gitignorePath, gitignoreContent, "creato");
    }

    console.log("✅ Progetto C++ creato con successo!");
  } catch (err) {
    console.error("❌ Errore:", err.message);
  }
}

module.exports = createCppProject;
