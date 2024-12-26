#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

console.log('Starting development servers...');

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

const pythonCmd = process.platform === 'win32' ? 
  join(projectRoot, 'backend', '.venv', 'Scripts', 'python.exe') :
  join(projectRoot, 'backend', '.venv', 'bin', 'python');

const backend = spawn(pythonCmd, ['-m', 'flask', '--debug', 'run'], {
  stdio: 'inherit',
  cwd: join(projectRoot, 'backend'),
  env: { ...process.env, FLASK_APP: 'app.py' }
});

const frontend = spawn('pnpm', ['dev:frontend'], {
  stdio: 'inherit',
  cwd: join(projectRoot, 'frontend')
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
