import json, struct, math, pathlib, numpy as np
from collections import defaultdict
OUT=pathlib.Path(__file__).parent/'models';OUT.mkdir(exist_ok=True)
J=[('Hips',-1,(0,1.12,0)),('Spine',0,(0,.5,0)),('Neck',1,(0,.48,0)),('Head',2,(0,.34,0)),('Jaw',3,(0,-.19,-.27)),('Ear_L',3,(-.25,.38,0)),('Ear_R',3,(.25,.38,0)),('UpperArm_L',1,(-.48,.28,0)),('Forearm_L',7,(-.03,-.48,0)),('UpperArm_R',1,(.48,.28,0)),('Forearm_R',9,(.03,-.48,0)),('Thigh_L',0,(-.22,-.09,0)),('Shin_L',11,(0,-.50,0)),('Thigh_R',0,(.22,-.09,0)),('Shin_R',13,(0,-.50,0))]
world=[]
for name,parent,p in J:
 world.append(np.array(p,dtype=float)+(world[parent] if parent>=0 else np.zeros(3)))

def quat(axis,a):
 if axis=='x':return [math.sin(a/2),0,0,math.cos(a/2)]
 if axis=='y':return [0,math.sin(a/2),0,math.cos(a/2)]
 return [0,0,math.sin(a/2),math.cos(a/2)]

def build(key,monster=False,archival=False,variant=''):
 damaged=monster and not archival
 # palette rgba physical materials
 if monster:
  P={'pink':'#7e555f' if damaged else '#e5a7b6','cream':'#93887e' if damaged else '#f6dfca','vest':'#3d505c' if damaged else '#586a86','red':'#55252a' if damaged else '#8b3544','eye':'#070608' if damaged else '#201b18','shoe':'#332b28','glove':'#827f73' if damaged else '#efe9dc','dark':'#161114','hair':'#4e3129','metal':'#544a47'}
 else:
  P={'skin':'#bb9078','hair':'#47352e','dark':'#282e34','shoe':'#41382e','glove':'#948779','red':'#8d4b4a','cream':'#bbb3a8','shirt':'#857c70','trouser':'#535c61','vest':'#635255','metal':'#807970', 'eye':'#251d1a', 'pink':'#9d7b73'}
  if key.startswith('june_1973'):P.update(shirt='#a89283',vest='#5f6570',red='#77414c',trouser='#5c6c79',shoe='#873f40')
  if key.startswith('june_1983'):P.update(shirt='#8c817d',vest='#793e3d',trouser='#5d6e7b',shoe='#4b3a31')
  if key.startswith('ruth'):P.update(vest='#606157',shirt='#424d59',trouser='#414e59',shoe='#42382d')
  if key.startswith('edwin'):P.update(vest='#55363b',shirt='#d5c8b2',trouser='#41413f',shoe='#3a2525')
  if key.startswith('robin'):P.update(vest='#5e7772',shirt='#a48f79',trouser='#555764',shoe='#51453e')
  if key.startswith('ivy'):P.update(vest='#876b65',shirt='#b7a292',trouser='#645d59',shoe='#51443e')
 buckets=defaultdict(lambda: {'pos':[],'nor':[],'ids':[],'idx':[]})
 def add(mat,bone,geo,trans=(0,0,0),scale=(1,1,1)):
  pos,nor,faces=geo
  a=np.array(pos)*np.array(scale)+np.array(trans);n=np.array(nor)/np.array(scale);n/=np.maximum(1e-10,np.linalg.norm(n,axis=1)[:,None])
  b=buckets[mat];start=len(b['pos']);b['pos'].extend(a.tolist());b['nor'].extend(n.tolist());b['ids'].extend([bone]*len(a));b['idx'].extend((np.array(faces).ravel()+start).tolist())
 def sphere(mat,bone,ctr,rad,lat=9,lon=14):
  vs=[];ns=[];fs=[]
  for iy in range(lat+1):
   p=math.pi*iy/lat
   for ix in range(lon+1):
    t=2*math.pi*ix/lon;v=(math.sin(p)*math.cos(t),math.cos(p),math.sin(p)*math.sin(t));vs.append(v);ns.append(v)
  for iy in range(lat):
   for ix in range(lon):
    i=iy*(lon+1)+ix;fs.extend([(i,i+lon+1,i+1),(i+1,i+lon+1,i+lon+2)])
  add(mat,bone,(vs,ns,fs),ctr,rad)
 def box(mat,bone,ctr,size):
  x,y,z=np.array(size)/2
  v=[];n=[];f=[]
  for face,normal in [([(-x,-y,-z),(-x,y,-z),(x,y,-z),(x,-y,-z)],(0,0,-1)), ([(x,-y,z),(x,y,z),(-x,y,z),(-x,-y,z)],(0,0,1)),([(-x,-y,z),(-x,y,z),(-x,y,-z),(-x,-y,-z)],(-1,0,0)), ([(x,-y,-z),(x,y,-z),(x,y,z),(x,-y,z)],(1,0,0)),([(-x,y,-z),(-x,y,z),(x,y,z),(x,y,-z)],(0,1,0)),([(-x,-y,z),(-x,-y,-z),(x,-y,-z),(x,-y,z)],(0,-1,0))]:
   k=len(v);v.extend(face);n.extend([normal]*4);f.extend([(k,k+1,k+2),(k,k+2,k+3)])
  add(mat,bone,(v,n,f),ctr)
 def torus_look(mat,bone,ctr,r=.16):
  sphere(mat,bone,ctr,(r,.07,.045),7,12)
 if monster:
  sphere('pink',1,(0,1.52,0),(.48,.73,.32))
  sphere('cream',1,(0,1.53,-.19),(.34,.52,.15))
  sphere('vest',1,(-.33,1.72,-.17),(.17,.44,.12))
  sphere('vest',1,(.33,1.72,-.17),(.17,.44,.12))
  sphere('red',2,(0,2.07,-.28),(.30,.14,.11))
  for p in [1.54,1.72,1.9]:sphere('metal',1,(0,p,-.345),(.062,.063,.035))
  sphere('cream',3,(0,2.64,0),(.56,.54,.44),lat=12,lon=20)
  sphere('cream',3,(-.23,2.47,-.34),(.28,.22,.2));sphere('cream',3,(.23,2.47,-.34),(.28,.22,.2))
  sphere('pink',3,(0,2.49,-.53),(.13,.105,.10))
  # empty black sockets in 1983, friendly eye patches in 1973
  for s in (-1,1):
   sphere('eye',3,(s*.245,2.76,-.403),(.172,.23,.075));
   if not damaged:
    sphere('cream',3,(s*.242,2.77,-.472),(.065,.09,.032));sphere('eye',3,(s*.225,2.78,-.505),(.033,.058,.021))
   sphere('glove',3,(s*.43,2.48,-.18),(.11,.09,.08))
  sphere('dark',4,(0,2.28,-.39),(.32,.13,.13))
  box('cream',4,(0,2.245,-.505),(.30,.11,.065))
  for sign,bone in [(-1,5),(1,6)]:
   sphere('pink',bone,(sign*.37,3.25,.02),(.21,.48,.13));
   sphere('red' if damaged else 'cream',bone,(sign*.38,3.26,-.11),(.12,.37,.045))
  for s,bone,lower in [(-1,7,8),(1,9,10)]:
   sphere('pink',bone,(s*.54,1.56,0),(.20,.39,.22));sphere('pink',lower,(s*.59,1.04,0),(.18,.35,.19));sphere('glove',lower,(s*.59,.78,-.07),(.17,.18,.17))
  for s,bone,shin in [(-1,11,12),(1,13,14)]:
   sphere('pink',bone,(s*.24,.73,0),(.23,.40,.26));sphere('pink',shin,(s*.25,.30,0),(.21,.35,.23));sphere('shoe',shin,(s*.25,.11,-.15),(.27,.15,.42))
  sphere('cream',1,(0,1.14,.29),(.15,.16,.20)) # cotton tail approximate
  if damaged:
   # torn seams, discoloration patches and exposed internal straps
   for ctr,rad in [((-.30,1.65,-.325),(.07,.19,.025)),((.29,.84,-.16),(.11,.20,.035)),((-.27,.26,-.18),(.08,.17,.04)),((.29,2.98,-.11),(.06,.16,.04))]:sphere('dark',1 if ctr[1]>1 else 12,ctr,rad)
   box('metal',1,(0,1.30,.29),(.45,.10,.08))
 else:
  small=key.startswith(('robin','ivy'));scale=.77 if small else (0.88 if key.startswith('june_1973') else 1)
  # human torso arms and legs, joint weighted
  sphere('shirt',1,(0,1.55,0),(.34*scale,.49*scale,.23*scale))
  sphere('vest',1,(0,1.68,-.18),(.34*scale,.40*scale,.065))
  sphere('skin',2,(0,2.16,0),(.13,.22,.13))
  sphere('skin',3,(0,2.50,0),(.32*scale,.40*scale,.29*scale),lat=13,lon=18)
  sphere('hair',3,(0,2.76,.06),(.33*scale,.22*scale,.29*scale))
  for s in (-1,1):sphere('eye',3,(s*.11*scale,2.55,-.274*scale),(.03,.034,.019))
  for s,bone,lower in [(-1,7,8),(1,9,10)]:
   sphere('vest' if not key.startswith('edwin') else 'shirt',bone,(s*.5,1.60,0),(.15,.36,.17));sphere('vest',lower,(s*.54,1.10,0),(.13,.29,.15));sphere('skin' if key.startswith('june') else 'glove',lower,(s*.55,.87,0),(.11,.14,.11))
  for s,bone,shin in [(-1,11,12),(1,13,14)]:
   sphere('trouser',bone,(s*.20,.79,0),(.17,.38,.19));sphere('trouser',shin,(s*.20,.31,0),(.17,.31,.17));sphere('shoe',shin,(s*.20,.09,-.11),(.20,.14,.32))
  if key.startswith('june_1983'):box('red',1,(0,1.60,.255),(.42,.16,.045))
  if key.startswith('edwin'): sphere('red',1,(0,1.83,-.26),(.07,.22,.035))
  if key.startswith('ruth'):box('metal',1,(.20,1.50,-.21),(.12,.09,.04))
 # glTF data build
 bdata=bytearray();views=[];access=[]
 def buff(data,target=None):
  while len(bdata)%4:bdata.append(0)
  offset=len(bdata);bdata.extend(data);d={'buffer':0,'byteOffset':offset,'byteLength':len(data)}
  if target:d['target']=target
  views.append(d);return len(views)-1
 def acc(raw,dtype,component,count,typ,target=None,extremes=False):
  vi=buff(np.asarray(raw,dtype=dtype).tobytes(),target);a={'bufferView':vi,'componentType':component,'count':count,'type':typ}
  if extremes:
   r=np.asarray(raw).reshape(count,-1);a['min']=r.min(axis=0).tolist();a['max']=r.max(axis=0).tolist()
  access.append(a);return len(access)-1
 materials=[];matIndex={}
 for name,hexcolor in P.items():
  rgb=[int(hexcolor[i:i+2],16)/255 for i in (1,3,5)]
  matIndex[name]=len(materials)
  materials.append({'name':name,'pbrMetallicRoughness':{'baseColorFactor':[*rgb,1],'metallicFactor':0.02 if name!='metal' else .48,'roughnessFactor':.87 if name!='metal' else .66},'doubleSided':True})
 primitives=[]
 for material,b in buckets.items():
  if not b['pos']:continue
  n=len(b['pos']);p=acc(b['pos'],np.float32,5126,n,'VEC3',34962,True);norm=acc(b['nor'],np.float32,5126,n,'VEC3',34962);
  joints=np.array([[j,0,0,0] for j in b['ids']],dtype=np.uint16);weights=np.array([[1,0,0,0]]*n,dtype=np.float32)
  ji=acc(joints,np.uint16,5123,n,'VEC4',34962);wi=acc(weights,np.float32,5126,n,'VEC4',34962)
  inds=acc(b['idx'],np.uint32,5125,len(b['idx']),'SCALAR',34963)
  primitives.append({'attributes':{'POSITION':p,'NORMAL':norm,'JOINTS_0':ji,'WEIGHTS_0':wi},'indices':inds,'material':matIndex[material]})
 bones=[]
 for i,(name,parent,off) in enumerate(J):
  node={'name':name,'translation':list(off),'rotation':[0,0,0,1]}
  ch=[j for j,(_,p,_) in enumerate(J) if p==i]
  if ch:node['children']=ch
  bones.append(node)
 ibm=[]
 for wp in world:
  m=np.eye(4,dtype=np.float32);m[:3,3]=-wp
  ibm.extend(m.T.ravel().tolist())
 ibmidx=acc(ibm,np.float32,5126,len(J),'MAT4')
 skin={'name':key+'_Skeleton','inverseBindMatrices':ibmidx,'joints':list(range(len(J))),'skeleton':0}
 root={'name':key,'mesh':0,'skin':0}
 nodes=bones+[root]
 # scene loads 2 roots; root and skeleton. Skeleton itself is hierarchy
 anims=[]
 def animation(name,duration,channels):
  cs=[];sam=[]
  for bone,axis,angles in channels:
   ts=[duration*i/(len(angles)-1) for i in range(len(angles))];qi=[quat(axis,a) for a in angles]
   timeidx=acc(ts,np.float32,5126,len(ts),'SCALAR',extremes=True)
   validx=acc(qi,np.float32,5126,len(qi),'VEC4')
   sam.append({'input':timeidx,'output':validx,'interpolation':'LINEAR'});cs.append({'sampler':len(sam)-1,'target':{'node':bone,'path':'rotation'}})
  anims.append({'name':name,'samplers':sam,'channels':cs})
 def sequence(name,amplitude=1,rate=1):
  duration=1.25/rate
  channels=[]
  for bone,axis,amount in [(7,'x',.38),(9,'x',-.38),(11,'x',-.45),(13,'x',.45),(8,'x',-.08),(10,'x',.08),(3,'y',.05)]:
   a=amount*amplitude;channels.append((bone,axis,[0,a,0,-a,0]))
  animation(name,duration,channels)
 animation('Idle',3.3,[(3,'z',[0,.08,0,-.04,0]),(3,'y',[0,-.07,0,.10,0]),(7,'z',[0,.045,0,-.045,0]),(9,'z',[0,-.04,0,.04,0]),(5,'z',[0,.05,0,-.04,0]),(6,'z',[0,-.05,0,.04,0])])
 sequence('Walk',.85,1);sequence('Run',1.55,1.8)
 if monster:
  animation('Chase',.66,[(7,'x',[.20,-.65,.2]),(9,'x',[-.2,-.65,-.2]),(3,'z',[0,.17,0]),(11,'x',[.75,-.75,.75]),(13,'x',[-.75,.75,-.75])])
  animation('Jumpscare',.8,[(7,'x',[0,-1.65,-1.40]),(9,'x',[0,-1.65,-1.40]),(3,'x',[0,.28,-.42]),(4,'x',[0,.52,.75]),(5,'z',[0,-.2,.1]),(6,'z',[0,.2,-.1])])
  if archival:animation('Wave',1.5,[(9,'z',[0,1.6,1.6,1.45,1.6,0]),(10,'x',[0,-.3,.3,-.3,0,0]),(3,'z',[0,.08,0,0,0,0])])
 else:
  animation('Gesture',1.6,[(9,'x',[0,-.6,-.4,0]),(3,'y',[0,.16,-.12,0])])
 nodes[0]['name']='Armature';nodes[0]['extras']={'rig':'15-joint skin','characters':key}
 gltf={'asset':{'version':'2.0','generator':'The Last Birthday Procedural Character Pipeline'},'scene':0,'scenes':[{'nodes':[0,len(J)]}], 'nodes':nodes,'meshes':[{'name':key+'_SkinnedMesh','primitives':primitives}],'skins':[skin],'materials':materials,'animations':anims,'buffers':[{'byteLength':len(bdata)}],'bufferViews':views,'accessors':access}
 # pad data and create binary glb file
 data=json.dumps(gltf,separators=(',',':')).encode();data+=b' '*((-len(data))%4)
 while len(bdata)%4:bdata.append(0)
 total=12+8+len(data)+8+len(bdata)
 glb=struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(data),b'JSON')+data+struct.pack('<I4s',len(bdata),b'BIN\x00')+bytes(bdata)
 path=OUT/(key+'.glb');path.write_bytes(glb)
 print(key, len(glb),'bytes',len(J),'joints',len(anims),'animations')
for n,mon,arch in [('mr_morrow_1983',True,False),('mr_morrow_1973',True,True),('june_1983',False,False),('june_1973',False,True),('robin_1973',False,True),('edwin_1973',False,True),('ruth_1973',False,True),('ivy_1973',False,True)]:build(n,mon,arch)
