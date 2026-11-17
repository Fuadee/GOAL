// Build a verification copy of the SAME app, isolating .next from existing localhost dev servers.
// This is not a new application. Never copy production env files into the fixture build.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const target = path.join(root, 'tmp/health-verification/motion-build');
fs.mkdirSync(target, {recursive:true});
for(const directory of ['app','components','lib','public','types','src','tests']) {
  const source=path.join(root,directory);
  if(fs.existsSync(source))fs.cpSync(source,path.join(target,directory),{recursive:true});
}
for(const file of ['package.json','package-lock.json','tsconfig.json','next.config.mjs','postcss.config.mjs','tailwind.config.ts','.eslintrc.json']) {
  fs.copyFileSync(path.join(root,file),path.join(target,file));
}
const modules=path.join(target,'node_modules');
if(!fs.existsSync(modules))fs.symlinkSync(path.join(root,'node_modules'),modules,'junction');
if(fs.readdirSync(target).some(name=>name.startsWith('.env')))throw new Error('Unexpected environment file in isolated build');
console.log(target);
