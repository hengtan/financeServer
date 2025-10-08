#!/usr/bin/env node

/**
 * Hybrid Startup Script
 *
 * Starts both Node.js (port 3001) and Python (port 8000) services
 * Works seamlessly on Railway and local development
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FinanceServer Hybrid Backend...\n');

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;

// Set PYTHONPATH for Railway
if (isRailway && !process.env.PYTHONPATH) {
  process.env.PYTHONPATH = __dirname;
}

// Start Python analytics service
console.log('🐍 Starting Python Analytics Service (port 8000)...');
const pythonProcess = spawn('python3', [
  '-m', 'uvicorn',
  'analytics.main:app',
  '--host', '0.0.0.0',
  '--port', '8000',
  '--log-level', isDevelopment ? 'debug' : 'info',
  ...(isDevelopment ? ['--reload'] : [])
], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    PYTHONPATH: process.env.PYTHONPATH || __dirname
  }
});

pythonProcess.on('error', (error) => {
  console.error('❌ Failed to start Python service:', error);
  process.exit(1);
});

// Give Python a moment to start
setTimeout(() => {
  // Start Node.js backend
  console.log('\n📦 Starting Node.js Backend (port 3001)...');
  const nodeProcess = spawn('node', [
    'dist/main.js'
  ], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      PYTHON_SERVICE_URL: 'http://localhost:8000'
    }
  });

  nodeProcess.on('error', (error) => {
    console.error('❌ Failed to start Node.js service:', error);
    pythonProcess.kill();
    process.exit(1);
  });

  // Handle shutdown
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down services...');
    pythonProcess.kill('SIGTERM');
    nodeProcess.kill('SIGTERM');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down services...');
    pythonProcess.kill('SIGINT');
    nodeProcess.kill('SIGINT');
    process.exit(0);
  });

}, 2000); // Wait 2 seconds for Python to start

console.log('\n✅ Hybrid backend starting...');
console.log('📊 Node.js API: http://localhost:3001');
console.log('🐍 Python Analytics: http://localhost:8000');
console.log('📚 Python Docs: http://localhost:8000/analytics/docs\n');
