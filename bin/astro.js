#!/usr/bin/env node

const { execSync } = require('child_process');

module.exports = () => {
  try {
    execSync('npm create astro@latest', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Errore durante la creazione del progetto Astro:', error.message);
    process.exit(1);
  }
};
