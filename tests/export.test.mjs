import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {buildStandalone} from '../dist/export.js';
const sources=await Promise.all(['catalog.js','studies.js','painterly.js','themes.js','waitcanvas.js','LICENSES.txt'].map(file=>readFile(new URL('../dist/'+file,import.meta.url),'utf8')));
test('standalone download includes all six painting methods with no missing module imports',()=>{
  const html=buildStandalone({theme:'oil',seed:'test',primary:'#447c83',accent:'#d79572',paper:'#f4ead8',speed:'1'},sources);
  const script=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  new vm.Script(script);assert.doesNotMatch(script,/^import\s/m);assert.doesNotMatch(script,/\bexport /);
  for(const theme of ['oil','line','crayon','ink','sketch','pencil'])assert.ok(html.includes(`value="${theme}"`));
  for(const id of ['apple-cube','boots','garden-bridge','violin','penguin','chrysanthemum','feather'])assert.ok(html.includes(id));
  assert.ok(html.includes('sampleSelector'));
});
test('user-supplied seed cannot break out of exported HTML attributes',()=>{
  const html=buildStandalone({theme:'oil',seed:'"><script>UNSAFE_MARKER</script>',primary:'#447c83',accent:'#d79572',paper:'#f4ead8',speed:'1'},sources);
  assert.ok(html.includes('&quot;&gt;&lt;script&gt;UNSAFE_MARKER'));
  assert.ok(!html.includes('<script>UNSAFE_MARKER'));
  assert.equal((html.match(/<script type="module">/g)||[]).length,1);
});
