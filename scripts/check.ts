// Runs lint alongside compile + test. Test output streams live; lint output is held
// and printed when lint finishes, so the two never interleave.
//
//   node scripts/check.ts
import { spawn } from 'node:child_process';

function run(command: string, live: boolean): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, stdio: live ? 'inherit' : 'pipe' });
    let output = '';
    const collect = (chunk: Buffer) => {
      output += chunk.toString();
    };
    child.stdout?.on('data', collect);
    child.stderr?.on('data', collect);
    child.on('close', (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}

const lint = run('npm run lint', false).then((result) => {
  process.stdout.write(result.output);
  return result.code;
});
const tests = run('npm run compile && npm run test', true).then((result) => result.code);

const [lintCode, testCode] = await Promise.all([lint, tests]);
if (lintCode !== 0) console.error(`lint failed (exit ${lintCode})`);
if (testCode !== 0) console.error(`compile or test failed (exit ${testCode})`);
process.exit(lintCode || testCode);
