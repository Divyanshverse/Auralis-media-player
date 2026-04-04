import { execSync } from 'child_process';

try {
  const output = execSync('python3 get_stream.py rj5wZqReXQE').toString();
  console.log(output);
} catch (e) {
  console.log('Error:', e.message);
}
