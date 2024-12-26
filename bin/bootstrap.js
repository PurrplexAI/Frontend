#!/usr/bin/env node

import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

console.log("Bootstrapping development environment...");

const commandExists = (cmd) => {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
};

console.log("\n📦 Setting up backend...");
try {
  let pythonCmd;
  if (process.platform === 'win32') {
    pythonCmd = 'python';
  } else {
    pythonCmd = commandExists('python3') ? 'python3' : 'python';
  }
  
  if (!existsSync(join('backend', '.venv'))) {
    execSync(`${pythonCmd} -m venv backend/.venv`, { stdio: 'inherit' });
  }
  
  const pipCmd = process.platform === 'win32' ? '.venv\\Scripts\\pip' : '.venv/bin/pip';
  execSync(`cd backend && ${pipCmd} install -r requirements.txt`, { stdio: 'inherit' });
} catch (error) {
  console.error('⚠️ Backend setup failed:', error.message);
}

if (!process.env.npm_lifecycle_event || process.env.npm_lifecycle_event !== 'postinstall') {
  console.log("\n📦 Setting up frontend...");
  try {
    execSync('cd frontend && pnpm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('⚠️ Frontend setup failed:', error.message);
  }
}

console.log("\n✅ Bootstrap complete!");
