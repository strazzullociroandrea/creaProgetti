#!/usr/bin/env node
const { execSync } = require('child_process');

module.exports = async () => {
    try {
        execSync('npx create-next-app@latest .', { stdio: 'inherit' });
    }catch(error){
        console.warn(`⚠️ Non è stato possibile creare il progetto next.js: ${error.message}`);
    }
}