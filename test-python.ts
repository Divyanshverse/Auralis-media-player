import { execSync } from 'child_process';

try {
  const pythonVersion = execSync('python3 --version').toString();
  console.log('Python version:', pythonVersion);
} catch (e) {
  console.log('Python not found');
}
