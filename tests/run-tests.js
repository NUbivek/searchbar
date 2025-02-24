import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const tests = [
  'web-search.js',
  'verified-search.js',
  'search-functionality.js'
];

// Helper function to clean up resources
async function cleanup() {
  // Add cleanup tasks here if needed
  console.log('Cleaning up test resources...');
}

async function waitForServer(server) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.kill();
      reject(new Error('Server startup timed out'));
    }, 30000);

    let port;
    const portRegex = /- Local:\s+http:\/\/localhost:(\d+)/;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Server stdout:', output);

      // Extract port number if available
      const match = output.match(portRegex);
      if (match) {
        port = match[1];
        process.env.PORT = port;
      }

      if (output.includes('Ready')) {
        clearTimeout(timeout);
        resolve(port);
      }
    });

    server.stderr.on('data', (data) => {
      const output = data.toString();
      console.error('Server stderr:', output);
      if (output.includes('error')) {
        clearTimeout(timeout);
        reject(new Error(output));
      }
    });

    server.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    server.on('exit', (code) => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

async function runTest(testFile, env) {
  return new Promise((resolve, reject) => {
    console.log(`\nRunning ${testFile}...`);
    const testProcess = spawn('node', [path.join(__dirname, testFile)], {
      stdio: 'inherit',
      env
    });

    testProcess.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} passed`);
        resolve(true);
      } else {
        console.error(`❌ ${testFile} failed`);
        resolve(false);
      }
    });

    testProcess.on('error', reject);
  });
}

async function runTests() {
  let server;
  try {
    // Set environment variables for test
    const env = {
      ...process.env,
      NODE_ENV: 'test'
    };

    // Start development server
    console.log('Starting development server...');
    server = spawn('npm', ['run', 'dev'], {
      cwd: path.resolve(__dirname, '..'),
      env
    });

    // Wait for server to start and get port
    const port = await waitForServer(server);
    console.log(`Server started on port ${port}`);

    // Run tests
    console.log('\nRunning tests...');
    const results = await Promise.all(tests.map(test => runTest(test, env)));
    const allTestsPassed = results.every(passed => passed);

    // Cleanup
    await cleanup();

    // Exit with appropriate code
    process.exit(allTestsPassed ? 0 : 1);
  } catch (error) {
    console.error('Test runner failed:', error);
    process.exit(1);
  } finally {
    if (server) {
      console.log('\nStopping development server...');
      server.kill();
    }
  }
}

runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
