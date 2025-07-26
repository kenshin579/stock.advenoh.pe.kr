#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Next.js application...');
console.log('📁 Changing to client_nextjs directory');

// Change to client_nextjs directory and start Next.js dev server
const nextjsProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client_nextjs'),
  stdio: 'inherit',
  shell: true
});

nextjsProcess.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error);
  process.exit(1);
});

nextjsProcess.on('close', (code) => {
  console.log(`📤 Next.js process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Next.js...');
  nextjsProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Next.js...');
  nextjsProcess.kill('SIGTERM');
});