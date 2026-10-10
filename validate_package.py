from pathlib import Path
import json, re, struct, subprocess
root=Path(__file__).parent
files=['index.html','style.css','script.js','model-viewer.html','viewer.css','viewer.js','README.md','STORY_BIBLE.md','GAME_DESIGN_DOCUMENT.md']
for f in files:assert (root/f).exists(),f
for f in ['script.js','viewer.js']:
 p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
 assert p.returncode==0,(f,p.stderr)
models=list((root/'models').glob('*.glb'))
assert len(models)==8,len(models)
for p in models:
 raw=p.read_bytes()
 magic,version,size=struct.unpack_from('<4sII',raw,0)
 assert magic==b'glTF' and version==2 and size==len(raw),p
 jsonLen,jsonMagic=struct.unpack_from('<I4s',raw,12)
 assert jsonMagic==b'JSON',p
 doc=json.loads(raw[20:20+jsonLen]);assert len(doc['skins'][0]['joints'])==15
 assert len(doc['animations'])>=4,p
 assert all('JOINTS_0' in prim['attributes'] for prim in doc['meshes'][0]['primitives'])
 print('GLB OK',p.name,'clips:',','.join(a['name'] for a in doc['animations']))
s=(root/'script.js').read_text()
for bad in ['Lenore Kells','Robin is alive','he whispers','WHERE IS THE BIRTHDAY GIRL']:
 assert bad not in s,bad
assert 'robin_1973' in s and 'ruth_1973' in s and 'Jumpscare' in s and 'cameraFlash' in s
print('ALL STATIC CHECKS PASSED. Browser playtest is still required.')
