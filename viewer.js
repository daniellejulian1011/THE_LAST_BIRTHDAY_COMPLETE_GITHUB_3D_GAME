import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#12161d');scene.fog=new THREE.Fog('#12161d',10,25);
const camera=new THREE.PerspectiveCamera(44,innerWidth/innerHeight,.1,100);camera.position.set(3.5,2.7,6.6);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;$('studio').append(renderer.domElement);
const ambient=new THREE.HemisphereLight('#dfd8d2','#24202c',2.3);scene.add(ambient);
for(const [x,y,z,c,p] of [[-4,7,4,'#ead0b3',110],[5,4,-3,'#aabfd8',90]]){const l=new THREE.PointLight(c,p,18);l.position.set(x,y,z);scene.add(l);}
const floor=new THREE.Mesh(new THREE.CylinderGeometry(2,2,.2,64),new THREE.MeshStandardMaterial({color:'#29262d',metalness:.34,roughness:.75}));floor.position.y=-.12;floor.receiveShadow=true;scene.add(floor);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.55,0);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=14;controls.maxPolarAngle=Math.PI/2-.02;controls.update();
const loader=new GLTFLoader();const clock=new THREE.Clock();let actor=null,mixer=null,clipAction=null,loadSeq=0;
function load(name){const seq=++loadSeq;if(actor){scene.remove(actor);actor=null;}if(mixer){mixer.stopAllAction();mixer=null;}$('meta').textContent='LOADING MODEL…';loader.load('./models/'+name+'.glb',gltf=>{
 if(seq!==loadSeq)return;actor=gltf.scene;const modelScale=name==='mr_morrow_1983'?.76:name==='mr_morrow_1973'?.62:name==='june_1983'?.58:name==='june_1973'?.50:name==='robin_1973'?.40:name==='ivy_1973'?.42:name==='ruth_1973'?.59:.63;actor.scale.setScalar(modelScale);actor.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;}});scene.add(actor);mixer=new THREE.AnimationMixer(actor);
 const select=$('animation');select.replaceChildren();for(const clip of gltf.animations){const opt=document.createElement('option');opt.value=clip.name;opt.textContent=clip.name.toUpperCase();select.appendChild(opt);}
 select.onchange=()=>{mixer.stopAllAction();const clip=THREE.AnimationClip.findByName(gltf.animations,select.value);if(clip){clipAction=mixer.clipAction(clip).reset().play();}};select.dispatchEvent(new Event('change'));
 const skins=[];actor.traverse(o=>{if(o.isSkinnedMesh)skins.push(o.skeleton.bones.length);});$('meta').textContent=skins.length?`${skins[0]} BONES · SKINNED MESH · ${gltf.animations.length} ANIMATION CLIPS · GLB`:`ANIMATED GLB · ${gltf.animations.length} CLIPS`;
 },undefined,err=>{$('meta').textContent='MODEL LOAD FAILED. OPEN FROM A LOCAL SERVER OR GITHUB PAGES.';console.error(err);});}
$('character').onchange=()=>load($('character').value);$('character').dispatchEvent(new Event('change'));
function tick(){requestAnimationFrame(tick);const dt=Math.min(.05,clock.getDelta());mixer?.update(dt);controls.update();renderer.render(scene,camera);}tick();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
