import {readFile,mkdir,writeFile,readdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {buildStandalone} from '../dist/export.js';
const names=['waitcanvas.js','themes.js','painterly.js','catalog.js','studies.js','react-example.jsx','LICENSES.txt','QUICKSTART.md','INSPIRATION.md'];
const files=await Promise.all(names.map(async name=>({name,data:await readFile('dist/'+name)})));
const sources=['catalog.js','studies.js','painterly.js','themes.js','waitcanvas.js','LICENSES.txt'].map(name=>files.find(f=>f.name===name).data.toString());
const demo=buildStandalone({theme:'sketch',sample:'apple-cube',seed:'a-little-pause',primary:'#514b45',accent:'#97897b',paper:'#f1ece2',speed:'1',reducedMotion:false},sources);
files.push({name:'demo.html',data:Buffer.from(demo)});
const crc32=buffer=>{let c=0xffffffff;for(const byte of buffer){c^=byte;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
function zip(entries){
 let offset=0;const local=[],central=[];
 for(const file of entries){const name=Buffer.from(file.name),data=file.data,crc=crc32(data),head=Buffer.alloc(30);
 head.writeUInt32LE(0x04034b50);head.writeUInt16LE(20,4);head.writeUInt16LE(0x800,6);head.writeUInt16LE(0x21,12);head.writeUInt32LE(crc,14);head.writeUInt32LE(data.length,18);head.writeUInt32LE(data.length,22);head.writeUInt16LE(name.length,26);local.push(head,name,data);
 const cd=Buffer.alloc(46);cd.writeUInt32LE(0x02014b50);cd.writeUInt16LE(20,4);cd.writeUInt16LE(20,6);cd.writeUInt16LE(0x800,8);cd.writeUInt16LE(0x21,14);cd.writeUInt32LE(crc,16);cd.writeUInt32LE(data.length,20);cd.writeUInt32LE(data.length,24);cd.writeUInt16LE(name.length,28);cd.writeUInt32LE(offset,42);central.push(cd,name);offset+=head.length+name.length+data.length;}
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,directory,end]);
}
await mkdir('dist/downloads',{recursive:true});await writeFile('dist/downloads/waitcanvas-free-v0.4.1.zip',zip(files));await writeFile('dist/downloads/demo.html',demo);
const source=[];
async function collect(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const path=directory+'/'+entry.name;if(path==='dist/downloads'||path==='dist/.openai')continue;if(entry.isDirectory())await collect(path);else if(entry.isFile())source.push({name:path,data:await readFile(path)});}}
await collect('dist');await collect('scripts');await collect('tests');
for(const name of ['package.json','README.md','CONTRIBUTING.md','LICENSE'])source.push({name,data:await readFile(name)});
await writeFile('dist/downloads/waitcanvas-source-v0.4.1.zip',zip(source));
console.log(JSON.stringify({componentFiles:files.map(f=>f.name),sourceFiles:source.length,coreAndThemesGzip:gzipSync(Buffer.concat(files.filter(f=>f.name.endsWith('.js')).map(f=>f.data))).length}));

