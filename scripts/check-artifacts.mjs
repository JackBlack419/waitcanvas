import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const files=['dist/downloads/demo.html',...process.argv.slice(2)];
for(const file of files){
  const html=await readFile(file,'utf8'),scripts=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  if(scripts.length!==1)throw Error(`Expected one self-contained module in ${file}`);
  if(/\bimport\s+(?:\{|['"]|\.\.\.)/.test(scripts[0][1]))throw Error('Standalone example has external imports');
  new vm.Script(scripts[0][1],{filename:file});
  if(!html.includes('wait-canvas')||!html.includes('cancelled'))throw Error('Incomplete example');
  console.log(`Standalone module syntax passed: ${file}`);
}
