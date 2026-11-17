// Offline, reproducible packing of the licensed Shopify Midnight GLB.
// Requires sharp from the local tooling runtime, not an app dependency.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require('sharp');
(async()=>{
 const source=path.resolve('tmp/health-verification/shoe-source/original.glb');
 const bytes=fs.readFileSync(source), jsonSize=bytes.readUInt32LE(12);
 const doc=JSON.parse(bytes.subarray(20,20+jsonSize));
 const binary=bytes.subarray(28+jsonSize);
 const output=[],views=[];let offset=0;
 for(let index=0;index<7;index++){
   const view=doc.bufferViews[index];let data=binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
   if(index>=4)data=await sharp(data).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).jpeg({quality:index===6?92:88,chromaSubsampling:'4:4:4'}).toBuffer();
   views.push({...view,byteOffset:offset,byteLength:data.length});output.push(data);offset+=data.length;
   const padding=(4-offset%4)%4;if(padding){output.push(Buffer.alloc(padding));offset+=padding;}
 }
 doc.bufferViews=views;doc.images=doc.images.slice(0,3);doc.textures=doc.textures.slice(0,3);doc.materials=doc.materials.slice(0,1);
 doc.materials[0].name='GOAL Midnight / Shopify';
 delete doc.meshes[0].primitives[0].extensions;delete doc.extensions;delete doc.extensionsUsed;delete doc.extensionsRequired;
 doc.buffers=[{byteLength:offset}];
 doc.asset.copyright='Materials Variants Shoe © 2021 Shopify, CC BY 4.0. Optimized Midnight variant for GOAL; runtime lime/charcoal material adaptation. See SHOE-LICENSE.txt.';
 doc.asset.extras={source:'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe',license:'CC-BY-4.0',sourceSHA256:crypto.createHash('sha256').update(bytes).digest('hex')};
 let json=Buffer.from(JSON.stringify(doc));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
 const bin=Buffer.concat(output),header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
 header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);
 jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
 const result=Buffer.concat([header,jh,json,bh,bin]);fs.mkdirSync('public/health/models',{recursive:true});fs.writeFileSync('public/health/models/goal-shoe.glb',result);
 console.log(JSON.stringify({originalBytes:bytes.length,optimizedBytes:result.length,triangles:doc.accessors[3].count/3,sourceSHA256:doc.asset.extras.sourceSHA256}));
})().catch(error=>{console.error(error);process.exitCode=1;});
