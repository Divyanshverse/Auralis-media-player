import { execSync } from 'child_process';

try {
  console.log('Installing pip...');
  execSync('curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py');
  execSync('python3 get-pip.py --user');
  console.log('Installing ytmusicapi...');
  const output = execSync('python3 -m pip install ytmusicapi --user').toString();
  console.log(output);
} catch (e) {
  console.log('Error:', e.message);
  if (e.stdout) console.log('Stdout:', e.stdout.toString());
  if (e.stderr) console.log('Stderr:', e.stderr.toString());
}
