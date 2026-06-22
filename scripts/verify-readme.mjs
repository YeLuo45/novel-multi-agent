import { execFileSync } from 'node:child_process';

const commands = [
  ['npm', ['run', 'check']],
  ['npm', ['test']],
  ['npm', ['run', 'build']],
];

for (const [cmd, args] of commands) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  execFileSync(cmd, args, { stdio: 'inherit' });
}
console.log('verify-readme: 0 failed');
