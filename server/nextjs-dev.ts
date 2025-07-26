import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Next.js Development Server...');
console.log('📁 Switching to client_nextjs directory');

const projectRoot = path.resolve(__dirname, '..');
const nextjsPath = path.join(projectRoot, 'client_nextjs');

console.log('🔧 Project root:', projectRoot);
console.log('🔧 Next.js path:', nextjsPath);

// Start Next.js development server
const nextProcess = spawn('npm', ['run', 'dev'], {
  cwd: nextjsPath,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '5000' // Use same port as current Vite server
  }
});

nextProcess.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  console.log(`📤 Next.js process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Next.js...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Next.js...');
  nextProcess.kill('SIGTERM');
});