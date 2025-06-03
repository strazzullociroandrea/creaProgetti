const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { promisify } = require("util");

const askQuestion = async (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const questionAsync = promisify(rl.question).bind(rl);

    let answer;
    try {
        do {
            answer = await questionAsync(question);
        } while (!answer.trim());
        return answer.trim();
    } finally {
        rl.close();
    }
};

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

        // Crea main.cpp
        const mainCpp = `
#include <iostream>
using namespace std;

int main() {
    cout << "Hello from ${projectName}!" << endl;
    return 0;
}
`;
        fs.writeFileSync(path.join(projectPath, "main.cpp"), mainCpp);
        console.log("📝 Creato: main.cpp");

        // Crea Makefile
        const makefile = `all:
\tg++ -o ${projectName} main.cpp

clean:
\trm -f ${projectName}
`;
        fs.writeFileSync(path.join(projectPath, "Makefile"), makefile);
        console.log("🔧 Creato: Makefile");

        // Crea README.md
        const readme = `# ${projectName}

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
        fs.writeFileSync(path.join(projectPath, "README.md"), readme);
        console.log("📝 Creato: README.md");

        // Cartelle opzionali
        fs.mkdirSync(path.join(projectPath, "include"));
        fs.mkdirSync(path.join(projectPath, "src"));
        console.log("📁 Cartelle 'include/' e 'src/' create.");

        console.log("✅ Progetto C++ creato con successo!");
    } catch (err) {
        console.error("❌ Errore:", err.message);
    }
}

module.exports = createCppProject;

