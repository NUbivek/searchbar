const { spawn } = require('child_process');
const { logger } = require('../utils/logger');

// Start the Next.js dev server
function startDevServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      env: { ...process.env, PORT: '3000' }
    });

    let started = false;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('ready started server on')) {
        started = true;
        logger.info('Dev server started');
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      logger.error(`Dev server error: ${data}`);
      if (!started) {
        reject(new Error('Failed to start dev server'));
      }
    });

    server.on('close', (code) => {
      if (!started) {
        reject(new Error(`Dev server exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        server.kill();
        reject(new Error('Dev server start timeout'));
      }
    }, 30000);
  });
}

// Run the test suite
async function runTests() {
  let server;
  try {
    // Start dev server
    logger.info('Starting dev server...');
    server = await startDevServer();

    // Import and run tests
    logger.info('Running tests...');
    const { testSearchFlow } = require('./searchFlow.test');
    await testSearchFlow();

  } catch (error) {
    logger.error('Test runner error:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (server) {
      server.kill();
      logger.info('Dev server stopped');
    }
  }
}

// Run everything
runTests();
