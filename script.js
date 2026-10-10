/**
 * THE LAST BIRTHDAY (1983)
 * Fully procedural first-person 3D horror story. No models, asset packs, or build step.
 * Requires an internet connection to load pinned Three.js from jsDelivr.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const PLAYER_HEIGHT = 1.64;
const PLAYER_RADIUS = 0.37;
const eye = new THREE.Vector3(0, PLAYER_HEIGHT, 17.4);
const clock = new THREE.Clock();
const temp = new THREE.Vector3();
const keys = new Set();
const solids = [];
const interactables = [];
const swingLights = [];
const motes = [];
let nearInteraction = null;
let dialogue = null;
let lastLocation = '';
let mouseSensitivity = 0.0021;
let yaw = 0;
let pitch = 0;
let touchLook = null;
let mobileInput = { x: 0, y: 0, running: false };
let lastSubId = 0;
let cooldown = 0;
let lastFootstep = 0;
let animTime = 0;
let soundtrack;
let birthdayMusicTimer=null;
let nextHaunt=0;
let monster;
let monsterGroup;
let monsterWaypoints = [new THREE.Vector3(0, 0, -13.7), new THREE.Vector3(0, 0, -5), new THREE.Vector3(0, 0, 5), new THREE.Vector3(0, 0, -15)];
let monsterWp = 0;
let lastChaseMessage = 0;
let lastMorrowFootstep = 0;
let endingSeen = loadSeen();

const state = {
  started: false, ended: false, paused: true, overlay: null, hiddenUntil: 0,
  hasPartyTape: false, hasArcadeTape: false, hasLedger: false, hasFuse: false,
  hasPower: false, hasKey: false, gateOpen: false, answeredTape: false,
  flashlight: true, battery: 100, stamina: 100, flashShots:3, catches: 0, introRead: false,
  fear: 0, clues: [], notes: [], lastBump: 0
};

const story = {
 partyTape: {
  title:'CASSETTE 01 — THE LAST PARTY',type:'ORIGINAL SHOW REEL / OCT 27, 1973',
  body:'A cheerful voice crackles from a <em>separate cassette player</em>: <strong>“Hiya, birthday stars! It’s your pal, Mr. Morrow!”</strong> Children cheer. Robin’s name is announced. The song cuts out beneath the sound of a fire alarm. Then: three distinct knocks. The tape ends.',
  note:'October 27, 1973: Mr. Morrow’s ORIGINAL prerecorded show reel captured the start of the stage fire and Robin’s three-knock signal. The rabbit stalking Candlewick’s in 1983 does not have a functioning voice.'
 },
 arcadeTape: {
  title:'CASSETTE 02 — RUTH HALE',type:'MAINTENANCE STAFF / TESTIMONY 1973',
  body:'Maintenance supervisor Ruth Hale recounts overloaded stage wiring, an unapproved chain across backstage exits and ignored repair requests. <strong>“I cut the power. The rabbit still turned its head. I know what I saw.”</strong> Her words are followed by the scratch of a tape being stopped.',
  note:'Ruth Hale warned management repeatedly of electrical hazards and chained exits. Her recorded testimony also describes the burnt rabbit costume moving after the power was cut. Ruth is never physically present in 1983.'
 },
 ledger: {
  title:'THE MANAGER’S LEDGER',type:'EDWIN CANDLEWICK / OCT 27, 1973',
  body:'Eleven children signed in for Robin’s seventh birthday. Ten were evacuated. A red line beside <strong>ROBIN MERCER — AGE 7</strong> is annotated <strong>“DECEASED — UNRECOVERED.”</strong> A signed order reads: <strong>“Keep backstage exits secured.”</strong> Edwin’s handwriting trails off: <strong>“I heard him knock. I did not open the door.”</strong> A brass key is tucked beneath the last page.',
  note:'Edwin ordered emergency doors chained despite Ruth’s protests. Eleven children attended; ten escaped. Robin died in the October 27, 1973 fire at age seven. Edwin disappeared during the investigation.'
 }
};
const endings = [
 {id:'silence',name:'THE LAST SILENCE',title:'THE LAST SILENCE',number:'ENDING 01 / 06',desc:'You answer the sealed service door with Robin’s three-knock signal. A latch releases. Behind the old stage you find the final original safety report, still bearing Edwin’s signature. You leave with proof of the fire-code violations and Robin’s death. At dawn, a police vehicle approaches the palace. For the first time in ten years, the stage lights go out.',outcome:'JUNE SURVIVES · THE COVER-UP EXPOSED'},
 {id:'host',name:'THE NEW HOST',title:'THE NEW HOST',number:'ENDING 02 / 06',desc:'You choose to sit in the empty birthday chair. Mr. Morrow silently places a paper crown upon your head. The doors close without a sound. When a trespasser develops film from the ruins weeks later, you are visible in the audience, smiling beneath a banner marked HAPPY BIRTHDAY.',outcome:'JUNE REMAINS · THE PARTY CONTINUES'},
 {id:'ashes',name:'ASHES & CONFETTI',title:'ASHES & CONFETTI',number:'ENDING 03 / 06',desc:'You overload the ruined stage circuit and flee as the old velvet curtains begin to burn. This time, the exits are open. You escape with the ledger and Ruth’s testimony. The fire consumes the palace, but the truth about 1973 survives. Across the road, two enormous rabbit ears briefly silhouette against the flames.',outcome:'JUNE ESCAPES · CANDLEWICK’S BURNS AGAIN'},
 {id:'eleventh',name:'THE ELEVENTH GUEST',title:'THE ELEVENTH GUEST',number:'ENDING 04 / 06',desc:'You follow three knocks past the curtain into a room that should not fit inside the building. Eleven empty chairs encircle a cake with a single candle. A large gloved hand pulls out a twelfth chair. The photograph taken that night shows no trace of June’s escape.',outcome:'JUNE DISAPPEARS · THE FINAL PARTY EXPANDS'},
 {id:'escape',name:'THE GUEST WHO LEFT',title:'THE GUEST WHO LEFT',number:'ENDING 05 / 06',desc:'You push through the front doors into the cold Maine rain and drive away. What you have found does not explain everything that happened to Robin. The official case remains open in your mind. In the rear-view mirror, one upstairs window of Candlewick’s glows for a single second.',outcome:'JUNE LIVES · QUESTIONS REMAIN'},
 {id:'caught',name:'NEVER FOUND',title:'NEVER FOUND',number:'ENDING 06 / 06',desc:'The last thing you see is Mr. Morrow’s cracked smile, close enough to touch. Silence. When the darkness lifts, he is arranging a paper party hat on a motionless figure at Robin’s old table. An ancient camera flashes. Another guest has joined the unfinished party.',outcome:'JUNE IS CAUGHT · GAME OVER'}
];
function loadSeen() { try { return new Set(JSON.parse(localStorage.getItem('candlewick-endings-v1') || '[]')); } catch { return new Set(); } }
function saveSeen() { try { localStorage.setItem('candlewick-endings-v1', JSON.stringify([...endingSeen])); } catch {} }
const isMobile = () => matchMedia('(pointer:coarse)').matches;
const clamp = THREE.MathUtils.clamp;

// THREE.JS SCENE ----------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color('#05090c');
scene.fog = new THREE.FogExp2('#081013', 0.034);
const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.copy(eye);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha:false });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.88;
$('world').appendChild(renderer.domElement);
const ambient = new THREE.AmbientLight('#718f8d', 0.30);
scene.add(ambient);
const moon = new THREE.DirectionalLight('#a3b8d9', 0.55);
moon.position.set(-7, 15, 18);
moon.castShadow = true;
moon.shadow.mapSize.set(1024,1024);
moon.shadow.camera.left = -26; moon.shadow.camera.right=26;
moon.shadow.camera.top = 29; moon.shadow.camera.bottom=-29;
scene.add(moon);
const torch = new THREE.SpotLight('#e7dcc7', 12, 27, 0.39, 0.65, 1.85);
torch.position.set(0.08,-0.10,-0.12);
torch.target.position.set(0,-0.06,-11);
camera.add(torch);camera.add(torch.target);
scene.add(camera);

const mat = (color, roughness=0.82, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const dark = mat('#1a2529'), black = mat('#060b0d'), bone = mat('#bbb19b'), red = mat('#7d3437'), brass=mat('#846644',.46,.54), wood=mat('#4e3d36');
const glowMat = (color, strength=1.9) => new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:strength, roughness:.35 });
const emissiveRed = glowMat('#e45154',2.4);
const emissivePale = glowMat('#e9d4a5',1.6);
const boxGeo = new THREE.BoxGeometry(1,1,1);
function mesh(geo, material, x=0,y=0,z=0, casts=true) { const m = new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=casts;m.receiveShadow=true;scene.add(m);return m; }
function block(x,y,z,w,h,d,m,solid=false) { const a=mesh(boxGeo,m,x,y,z);a.scale.set(w,h,d); if(solid)solids.push({x,z,w,d});return a; }
function wall(x,z,w,d,h=4.25,m=wallPaper) { return block(x,h/2,z,w,h,d,m,true); }

function canvasTexture(draw,sz=512) { const c=document.createElement('canvas');c.width=c.height=sz;const ctx=c.getContext('2d');draw(ctx,sz);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t; }
const floorTex=canvasTexture((c,s)=>{c.fillStyle='#353d39';c.fillRect(0,0,s,s);const n=8;for(let y=0;y<n;y++)for(let x=0;x<n;x++){c.fillStyle=(x+y)%2?'#505148':'#343e3a';c.fillRect(x*s/n+1,y*s/n+1,s/n-2,s/n-2);}for(let k=0;k<2300;k++){c.fillStyle=`rgba(16,18,18,${Math.random()*.15})`;c.fillRect(Math.random()*s,Math.random()*s,Math.random()*8,1);} },512);
floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(9,12);
const wallTex=canvasTexture((c,s)=>{c.fillStyle='#606456';c.fillRect(0,0,s,s);for(let i=0;i<30;i++){c.fillStyle=i%2?'#7b756038':'#161f1e30';c.fillRect(i*s/30,0,3,s)}for(let k=0;k<1900;k++){c.fillStyle=`rgba(15,23,20,${Math.random()*.24})`;c.fillRect(Math.random()*s,Math.random()*s,Math.random()*7,Math.random()*4)}c.fillStyle='#56493b';c.fillRect(0,s*.72,s,s*.28);c.fillStyle='#222c29';c.fillRect(0,s*.70,s,10)},512);
wallTex.wrapS=wallTex.wrapT=THREE.RepeatWrapping;wallTex.repeat.set(2,1);
const wallPaper = new THREE.MeshStandardMaterial({ map:wallTex,roughness:.98,color:'#b9b8af' });
const floorMat=new THREE.MeshStandardMaterial({map:floorTex,roughness:.98,color:'#9b9f96'});
const ceilingMat=mat('#29312f');

// FLOORS + ROOM PLAN. +Z is the entrance, -Z is the stage.
block(0,-.14,-2,38,.28,49,floorMat);
block(0,4.38,-2,38,.26,49,ceilingMat);
// Lobby
wall(-12,15.5,.45,13.5);wall(12,15.5,.45,13.5);
wall(-7.1,22,9.5,.5);wall(7.1,22,9.5,.5);
wall(-7.5,9,9,.5);wall(7.5,9,9,.5);
// Central corridor: split to allow side room doorways.
for(const x of [-3.1,3.1]) { wall(x,5, .45,8); wall(x,-7.15,.45,9.1);wall(x,-16.65,.45,2.7);wall(x,-11.15,.45,2.7); }
// Party room left, z -9.5..8.9; door x -3.1 at z -2.7
wall(-18.5,-.3,.5,18.8);wall(-10.75,8.8,15.5,.5);wall(-10.75,-9.6,15.5,.5);
// Arcade right
wall(18.5,-.3,.5,18.8);wall(10.75,8.8,15.5,.5);wall(10.75,-9.6,15.5,.5);
// Office and maintenance z -20.8..-9.6
wall(-18.5,-15.25,.5,11.4);wall(-10.75,-20.85,15.5,.5);
wall(18.5,-15.25,.5,11.4);wall(10.75,-20.85,15.5,.5);
// Corridor rear & stage entry
wall(-4.10,-18.1,5.2,.5);wall(4.10,-18.1,5.2,.5);
// Stage chamber
wall(-6.7,-22.25,.45,8.5);wall(6.7,-22.25,.45,8.5);wall(0,-26.4,13.8,.5);
block(0,.28,-23.1,10.3,.56,4.4,wood); // raised stage
block(0,2.1,-26.0,12,.22,.35,red);
// Door frame and sliding barrier.
const stageBarrier=block(0,1.9,-18.1,3.05,3.8,.28,red,true);
const barrierCollide=solids[solids.length-1];
block(-1.69,2,-18.1,.26,4,.46,brass);block(1.69,2,-18.1,.26,4,.46,brass);
block(0,4.04,-18.1,3.72,.25,.5,brass);
// Entrance doors are visual, but you can leave only by making a choice.
block(-1.85,2.06,21.9,.2,4,.3,brass);block(1.85,2.06,21.9,.2,4,.3,brass);
block(0,4.1,21.9,3.9,.22,.4,brass);

function sign(text,x,y,z,w=3,h=.66,rotation=0,fg='#e2d0ac',bg='#3f2928') {
 const t=canvasTexture((c,s)=>{c.fillStyle=bg;c.fillRect(0,0,s,s);c.strokeStyle='#bc9c6488';c.lineWidth=9;c.strokeRect(19,19,s-38,s-38);c.fillStyle=fg;c.font='bold 51px Georgia';c.textAlign='center';c.textBaseline='middle';for(let i=0;i<Math.min(2,Math.ceil(text.length/23));i++){const lines=text.length>23?[text.slice(0,23),text.slice(23)]:[text];c.fillText(lines[i],s/2,s/2+(i-(lines.length-1)/2)*69,s-45)}},512);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:false,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=rotation;scene.add(m);return m;
}
sign('CANDLEWICK’S',0,3.2,21.58,5.4,.85,0,'#e4cda6','#342c2d');
sign('PARTY ROOM',-3.0,3.35,-2.8,2.65,.7,Math.PI/2);
sign('GAME ARCADE',3,3.35,-2.8,2.65,.7,Math.PI/2);
sign('MANAGER',-3,3.32,-13.2,2.4,.64,Math.PI/2);
sign('MAINTENANCE',3,3.32,-13.2,2.5,.64,Math.PI/2);
sign('BACKSTAGE - STAFF ONLY',0,3.3,-17.89,3.6,.55,0);
sign('ONE MORE CANDLE',0,3.3,-25.64,4.2,.72,0,'#e5d6b5','#3a1b24');

function ceilingLight(x,z,color='#e8bc8c',initial=1.4,flicker=false) {
 const lamp=block(x,4.1,z,1.45,.12,.52,mat('#594b43'));
 block(x,4.01,z,1.25,.045,.32,glowMat(color,.8));
 const l=new THREE.PointLight(color,initial,15,2);l.position.set(x,3.8,z);l.castShadow=false;scene.add(l);
 swingLights.push({light:l,base:initial,flicker,seed:Math.random()*TAU});
 return lamp;
}
ceilingLight(0,16,'#e6bb8e',1.95,true);ceilingLight(0,4,'#c5c2a8',.6,true);ceilingLight(0,-8,'#b1d8cd',.55,true);ceilingLight(-11,1,'#e3a4a5',1.0,true);ceilingLight(11,1,'#cfa889',.9,true);
ceilingLight(-11,-15,'#b3d0bf',.72,true);ceilingLight(11,-15,'#d1c393',.6,true);ceilingLight(0,-23,'#e9a0a0',.25,true);
// Atmospheric floor details.
for(let i=0;i<35;i++) {const x=(Math.random()-.5)*36,z=Math.random()*46-25;const p=mesh(new THREE.PlaneGeometry(Math.random()*.45+.12,Math.random()*.22+.06),mat(i%3?'#625443':'#6b4e4a'),x,.013,z,false);p.rotation.x=-Math.PI/2;p.rotation.z=Math.random()*TAU;}
function poster(title,x,y,z,rotation=0,base='#634d3a') {
 const tx=canvasTexture((c,s)=>{c.fillStyle=base;c.fillRect(0,0,s,s);c.fillStyle='#d7bc95';c.fillRect(25,25,s-50,s-50);c.fillStyle='#912f38';c.textAlign='center';c.font='bold 48px Georgia';c.fillText(title.slice(0,16),s/2,134,s-80);c.font='bold 37px Georgia';c.fillText(title.slice(16),s/2,200,s-80);c.fillStyle='#aa5455';c.beginPath();c.arc(260,330,110,0,TAU);c.fill();c.fillStyle='#e6d4b9';c.font='bold 74px Georgia';c.fillText('11',260,358);c.font='28px Georgia';c.fillStyle='#272a26';c.fillText('EVERYONE IS INVITED',260,470,s-60)},512);
 const o=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.65),new THREE.MeshStandardMaterial({map:tx,side:THREE.DoubleSide,roughness:1}));o.position.set(x,y,z);o.rotation.y=rotation;scene.add(o);
}
poster('STAY FOR THE PARTY',-17.99,2.35,3,Math.PI/2);
poster('GAMES & PRIZES',18,2.35,3,-Math.PI/2,'#3a5d52');
poster('MR MORROW IS HERE',-11.84,2.3,18,Math.PI/2,'#695444');

function table(x,z,r=1.3) {block(x,1.04,z,r,.12,r,wood,true);for(const dx of [-r*.36,r*.36])for(const dz of [-r*.36,r*.36])block(x+dx,.51,z+dz,.10,1,.10,wood);}
function chair(x,z,angle=0) { const g=new THREE.Group();const seat=new THREE.Mesh(boxGeo,mat('#8a4947'));seat.scale.set(.48,.11,.43);seat.position.y=.49;g.add(seat);const back=new THREE.Mesh(boxGeo,mat('#704c3f'));back.scale.set(.48,.67,.09);back.position.set(0,.82,.17);g.add(back);for(const sx of [-.16,.16])for(const sz of [-.14,.14]){const leg=new THREE.Mesh(boxGeo,wood);leg.scale.set(.07,.45,.07);leg.position.set(sx,.24,sz);g.add(leg)}g.position.set(x,0,z);g.rotation.y=angle;scene.add(g); }
function balloon(x,z,col='#a85054',h=2.2){const string=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,.2,z),new THREE.Vector3(x,h-.31,z)]),new THREE.LineBasicMaterial({color:'#b8aca0',transparent:true,opacity:.4}));scene.add(string);const a=mesh(new THREE.SphereGeometry(.32,12,10),mat(col,.48,.05),x,h,z);a.scale.set(.83,1.15,.83);motes.push({object:a,y:h,t:Math.random()*TAU,amp:.05})}
function partyHat(x,y,z,color='#a95456') {const c=mesh(new THREE.ConeGeometry(.22,.55,8),mat(color),x,y,z);return c}
function bunting(a,b,z,y){for(let x=a;x<b;x+=.8){const flag=mesh(new THREE.ConeGeometry(.26,.65,3),mat(Math.round(x*3)%2?'#69847c':'#a05c52'),x,y,z,false);flag.rotation.z=Math.PI;flag.rotation.y=.2;}}
for(const x of [-14,-9])for(const z of [-5,3]){table(x,z);chair(x+1,z,.4);chair(x-.8,z,-.3);partyHat(x,1.35,z)}
for(const p of [[-16,6],[-5.2,5],[-16,-7],[-6,-7],[6,6],[16,5],[7,-7],[16,-7]])balloon(p[0],p[1],p[0]>0?'#718b80':'#a25d61',2.2+Math.random()*.7);
bunting(-17,-4,7.7,3.72);bunting(4,18,7.7,3.72);
// Lobby: reception desk, slatted counter, lobby posters and abandoned shoes.
block(-6,.83,15.2,4.2,1.65,1.25,wood,true);block(-6,1.68,15.2,4.3,.16,1.4,brass);
block(5.6,.83,17.5,3.0,1.45,.65,wood,true);
for(let i=0;i<7;i++)block(5.6+(i-3)*.3,1.6,17.15,.13,.1,.12,mat('#8c7e69'));
block(0,.035,12,4.9,.03,2,red);
// Party stage, tables and curtains.
const curtainMat=mat('#6c252d');
for(const x of [-5.6,5.6])block(x,2.3,-24.7,1.0,3.8,1.2,curtainMat);
block(0,4.18,-24.6,11.8,.28,1.2,curtainMat);
for(let x=-4.5;x<5;x+=1.2){const c=block(x,2.67,-25.8,.22,2.7,.5,curtainMat);c.rotation.z=Math.sin(x)*.07;}
for(let i=0;i<10;i++){partyHat(-4+i*.9,.81,-22.1,i%2?'#ca9996':'#77928a')}
// Arcade cabinets with dim colored glass/screens.
function arcadeMachine(x,z,color='#63a69c',rotation=0){const g=new THREE.Group();const body=new THREE.Mesh(boxGeo,dark);body.scale.set(.93,1.94,.8);body.position.y=.97;g.add(body);const screen=new THREE.Mesh(boxGeo,glowMat(color,.7));screen.scale.set(.72,.62,.045);screen.position.set(0,1.43,.421);g.add(screen);const panel=new THREE.Mesh(boxGeo,brass);panel.scale.set(.78,.1,.48);panel.position.set(0,.96,.5);g.add(panel);const stick=new THREE.Mesh(new THREE.SphereGeometry(.08,7,7),glowMat('#e8bb93',.7));stick.position.set(-.2,1.08,.6);g.add(stick);g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);solids.push({x,z,w:.9,d:.8});}
for(const z of [-6,-3,0,3,6])arcadeMachine(16.7,z,z%2?'#a04459':'#5b9f97',-Math.PI/2);
for(const z of [-6,-3,0,3,6])arcadeMachine(6.1,z,'#bb996e',Math.PI/2);
// Office and utility.
block(-13,.65,-16,4.8,1.3,2.15,wood,true);block(-13,1.37,-16,4.9,.12,2.2,brass);
block(-16.6,.98,-18.5,1.4,1.96,.7,dark,true);block(-8.4,.95,-18.8,2,1.9,.65,dark,true);
for(let z=-18.8;z<-11;z+=1.6)block(17.0,1.05,z,1.8,2.1,.75,dark,true);
const generator=block(12.1,1.0,-17.3,2,2,1.35,dark,true);block(12.1,1.1,-16.57,1.15,.65,.1,glowMat('#647d6f',.25));
for(const x of [11.3,11.8,12.3,12.8])block(x,1.1,-16.48,.08,.46,.13,brass);
// Static lamps at stage, cold spotlight on microphone.
const stageSpot = new THREE.SpotLight('#e6c69e',0.8,16,.52,.62);stageSpot.position.set(2.5,3.9,-22.2);stageSpot.target.position.set(0,.9,-23);scene.add(stageSpot,stageSpot.target);
const mic=mesh(new THREE.CylinderGeometry(.04,.06,1.35,12),brass,0,1.21,-22.35);mesh(new THREE.SphereGeometry(.16,12,8),dark,0,1.95,-22.35);block(0,.55,-22.35,.72,.07,.63,dark);

// Dust motes float in pooled light.
const dustCount=165;const dustPos=new Float32Array(dustCount*3);
for(let i=0;i<dustCount;i++){dustPos[i*3]=(Math.random()-.5)*35;dustPos[i*3+1]=Math.random()*4.1;dustPos[i*3+2]=Math.random()*47-25}
const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPos,3));
const dust = new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:'#b6b7a1',size:.04,transparent:true,opacity:.45,depthWrite:false}));scene.add(dust);

// Animated GLB character pipeline. All models use skinned 15-joint skeletons
// with built-in clips. These are stylized production-prototype models, not scans.
const loader = new GLTFLoader();
const actors = {};
const mixers = [];
function createFallbackRabbit(){
 const g=new THREE.Group();
 const pink=mat('#7c565e'),cream=mat('#a59b8a'),voidMat=mat('#050405');
 const part=(geo,m,x,y,z,sx=1,sy=1,sz=1)=>{const a=new THREE.Mesh(geo,m);a.position.set(x,y,z);a.scale.set(sx,sy,sz);a.castShadow=true;g.add(a);return a;};
 part(new THREE.SphereGeometry(1,16,12),pink,0,1.45,0,.47,.77,.38);
 part(new THREE.SphereGeometry(1,20,14),cream,0,2.66,0,.51,.53,.43);
 for(const s of [-1,1]){
  part(new THREE.SphereGeometry(1,12,8),pink,s*.32,3.25,0,.18,.55,.15);
  part(new THREE.SphereGeometry(1,12,8),voidMat,s*.23,2.76,-.39,.16,.20,.07);
  part(new THREE.CylinderGeometry(.17,.20,.9,9),pink,s*.58,1.45,0);
  part(new THREE.CylinderGeometry(.21,.23,.85,9),pink,s*.22,.48,0);
  part(new THREE.SphereGeometry(1,12,8),mat('#382b2a'),s*.22,.09,-.18,.29,.15,.36);
 }
 part(new THREE.SphereGeometry(1,12,8),mat('#6e262d'),0,2.24,-.34,.29,.16,.11);
 part(new THREE.SphereGeometry(1,12,8),mat('#423d39'),0,2.46,-.48,.12,.12,.10);
 g.position.set(0,0,-12.5);g.visible=false;scene.add(g);return g;
}
let monsterGroup=createFallbackRabbit();
function registerActor(id, file, position, scale=1, visible=false){
 return new Promise(resolve=>loader.load('./models/'+file+'.glb',gltf=>{
  const model=gltf.scene;model.position.copy(position);model.scale.setScalar(scale);model.visible=visible;
  model.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;n.frustumCulled=false;}});
  scene.add(model);const mixer=new THREE.AnimationMixer(model);
  const clips={};for(const c of gltf.animations)clips[c.name]=mixer.clipAction(c);
  const actor={id,model,mixer,clips,playing:null,play(name,fade=.25){
   const next=clips[name]||clips.Idle;if(!next||this.playing===next)return;
   next.reset().setLoop(THREE.LoopRepeat).play();if(this.playing){next.crossFadeFrom(this.playing,fade,true);}this.playing=next;
  }};
  actor.play('Idle');actors[id]=actor;mixers.push(mixer);
  if(id==='morrow1983'){
   const wasVisible=monsterGroup.visible;const old=monsterGroup.position.clone();scene.remove(monsterGroup);
   monsterGroup=model;monsterGroup.position.copy(old);monsterGroup.visible=wasVisible;
  }
  resolve(actor);
 },undefined,e=>{console.warn('Model '+file+' did not load; fallback visuals remain.',e);resolve(null)}));
}
const characterAssets=Promise.all([
 registerActor('morrow1983','mr_morrow_1983',new THREE.Vector3(0,0,-12.5),.76,false),
 registerActor('morrow1973','mr_morrow_1973',new THREE.Vector3(-10.7,0,-1.0),.62,false),
 registerActor('june1973','june_1973',new THREE.Vector3(-12.5,0,1),.50,false),
 registerActor('robin1973','robin_1973',new THREE.Vector3(-11.5,0,1.7),.40,false),
 registerActor('edwin1973','edwin_1973',new THREE.Vector3(-13.8,0,-.2),.63,false),
 registerActor('ruth1973','ruth_1973',new THREE.Vector3(-14.8,0,-1.7),.59,false),
 registerActor('ivy1973','ivy_1973',new THREE.Vector3(-10.1,0,2),.42,false),
 registerActor('june1983','june_1983',new THREE.Vector3(-3.5,0,16.2),.58,false)
]);
let flashbackActive=false;
function flashbackActors(on){flashbackActive=on;
 for(const id of ['morrow1973','june1973','robin1973','edwin1973','ruth1973','ivy1973']){
  const a=actors[id];if(a){a.model.visible=on;a.play(id==='morrow1973'?'Wave':'Idle');}
 }
}
const monsterState={ mode:'sleep', target:new THREE.Vector3(), chase:false, awareness:0, warned:false };

// Interactables appear as authored props; no invisible trigger boxes in the game.
function addInteractor(id,label,x,z,meshObj,callback,opts={}){
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.43,.017,5,30),new THREE.MeshBasicMaterial({color:opts.color||'#e6bc8a',transparent:true,opacity:.60}));ring.position.set(x,.055,z);ring.rotation.x=Math.PI/2;scene.add(ring);
 const item={id,label,x,z,mesh:meshObj,ring,callback,active:true,range:opts.range||2.7};interactables.push(item);return item;
}
function cassette(x,z,color='#ba575b'){
 const g=new THREE.Group();const shell=new THREE.Mesh(boxGeo,mat('#292a27'));shell.scale.set(.6,.36,.10);g.add(shell);
 const sticker=new THREE.Mesh(boxGeo,mat(color));sticker.scale.set(.49,.14,.11);sticker.position.set(0,.015,-.01);g.add(sticker);
 for(const sx of [-.13,.13]){const spool=new THREE.Mesh(new THREE.TorusGeometry(.055,.015,6,10),bone);spool.position.set(sx,-.08,-.065);g.add(spool)}
 g.position.set(x,1.5,z);scene.add(g);return g;
}
function collectible(item,flag,entry){
 state[flag]=true;item.active=false;item.ring.visible=false;item.mesh.visible=false;
 state.notes.push(entry.note);state.clues.push(flag);updateHUD();sting();
 const choices=[{label:'REWIND AND PRESERVE THE EVIDENCE',action:()=>{subtitle(flag==='hasPartyTape'?'Knock. Knock. Knock. Robin’s familiar signal.':'The archive is clear: these were ignored warnings.',4700);maybeWake();}},
  {label:'PLAY THE RECORDING OVER THE PA',action:()=>{state.answeredTape=true;state.fear++;subtitle('Old loudspeakers crackle in an empty building.',4700);sting('scare');maybeWake();}}];
 openDialog(entry.type,entry.title,entry.body,choices);
}
let lobbyTape = cassette(-5.8,14.2,'#a68b76');
addInteractor('invitation','READ THE UNMARKED ENVELOPE',-5.8,14.2,lobbyTape,()=>openDialog('UNMARKED PACKAGE / OCTOBER 1983','THE TAPE THAT BROUGHT YOU BACK',
 'An envelope arrived without a return address. Inside: a reel labeled <strong>ROBIN’S SEVENTH BIRTHDAY — 10.27.1973</strong>. It contains Mr. Morrow’s old show greeting, the fire alarm and three knocks. Robin died in the fire. Whoever sent this knew your private signal.',[
  {label:'POCKET THE ENVELOPE',action:()=>{feed('JOURNAL UPDATED · THE 1973 TAPE');state.notes.push('Invitation: an anonymous envelope with a cassette of Robin’s final birthday. Robin died in 1973.');disableById('invitation');}}
 ]),{range:2.6});
block(-12,.68,0,1.5,1.25,1.1,wood,true);
const partyCassette=cassette(-12,0);
addInteractor('partyTape','TAKE CASSETTE 01',-12,0,partyCassette,(item)=>collectible(item,'hasPartyTape',story.partyTape));
const familyPhoto=block(-16.25,1.36,2.2,.62,.38,.07,mat('#ad9a77'));
addInteractor('photo','EXAMINE THE BIRTHDAY PHOTOGRAPH',-16.25,2.2,familyPhoto,()=>{
 flashbackActors(true);
 openDialog('ARCHIVE / OCTOBER 27, 1973','THE LAST HAPPY PHOTOGRAPH',
 '<strong>1973. June is 14. Robin is 7.</strong> A smiling Mr. Morrow waves behind Robin’s cake. Edwin stands by the stage, and Ruth watches the overloaded ceiling lights. This was taken only hours before the electrical fire. Robin died that night. <em>The figures appearing in the room are a reconstruction of June’s memory, not living people in 1983.</em>',[
  {label:'REMEMBER THE THREE KNOCKS',action:()=>{flashbackActors(false);state.notes.push('Photo: Robin is seven in his final birthday photograph; June is fourteen. Edwin and Ruth are present.');disableById('photo');}},
  {label:'PUT THE PHOTOGRAPH DOWN',action:()=>flashbackActors(false)}
 ]);
},{range:2.6});

block(10,.60,-4,1.6,1.0,1.1,wood,true);
const arcadeCassette=cassette(10,-4,'#73a19c');
addInteractor('arcadeTape','TAKE CASSETTE 02',10,-4,arcadeCassette,(item)=>collectible(item,'hasArcadeTape',story.arcadeTape));
const ledgerMesh=block(-13.0,1.52,-15.1,.65,.06,.85,mat('#8c7056'));
addInteractor('ledger','OPEN THE MANAGER’S LEDGER',-13.0,-15.1,ledgerMesh,(item)=>{state.hasKey=true;collectible(item,'hasLedger',story.ledger);});
const fuseObj=mesh(new THREE.CylinderGeometry(.09,.09,.48,12),glowMat('#be9873',.9),10.4,1.25,-15.5);fuseObj.rotation.z=Math.PI/2;
addInteractor('fuse','TAKE THE CERAMIC FUSE',10.4,-15.5,fuseObj,(item)=>{state.hasFuse=true;item.active=false;item.mesh.visible=false;item.ring.visible=false;feed('ITEM FOUND · 1973 CERAMIC FUSE');updateHUD();sting();subtitle('A fuse. It still smells like burnt sugar.',4400);});
addInteractor('generator','OPERATE THE GENERATOR',12.1,-16.45,generator,()=>{
 if(!state.hasFuse){openDialog('MAINTENANCE / CONTROL BOX','THE CIRCUIT IS EMPTY','The building’s old generator is intact, but someone removed its ceramic fuse. Ruth’s repair notes are still taped above the panel.',[{label:'LEAVE THE PANEL',action:()=>{}}]);return;}
 if(state.hasPower){openDialog('MAINTENANCE','THE ENGINE IS RUNNING','The wall vibrates. Somewhere deep in the stage, the birthday music starts over.',[{label:'STEP BACK',action:()=>{}}]);return;}
 openDialog('RESTORE POWER / DANGEROUS','THE ELEVENTH SWITCH','You can restore electricity. But the last person who tried wrote one warning in chalk: <strong>“When the lights come on, he can see you.”</strong>',[
  {label:'RESTORE THE POWER',action:()=>{state.hasPower=true;wakeMonster();startBirthdayMusic();nextHaunt=performance.now()+12000;feed('POWER RESTORED · SOMETHING HAS WOKEN UP');subtitle('A battered 1973 show reel starts playing through the old ceiling speakers.',5000);updateHUD();}},
  {label:'LEAVE THE SWITCH OFF',action:()=>{feed('THE BUILDING STAYS DARK.');}}
 ]);
},{range:3.1});
addInteractor('stageGate','UNLOCK THE BURNED BACKSTAGE DOOR',0,-16.5,stageBarrier,()=>{
 if(state.gateOpen){feed('THE STAGE DOOR IS OPEN.');return;}
 const missing=[];if(!state.hasPower)missing.push('RESTORE THE POWER');if(!state.hasKey)missing.push('RECOVER EDWIN’S BRASS KEY');if(!state.hasPartyTape||!state.hasArcadeTape)missing.push('LOCATE BOTH 1973 CASSETTES');
 if(missing.length){openDialog('BACKSTAGE / LOCKED','CHAINED FROM THE OUTSIDE','A broken chain hangs across the same door that trapped Robin in 1973. You need:<br>'+missing.map(m=>'— '+m).join('<br>'),[{label:'RETURN TO THE HALLWAY',action:()=>{}}]);return;}
 openDialog('BACKSTAGE / FINAL CHAPTER','THE DOOR THAT EDWIN LEFT LOCKED','The brass key turns. For one moment you remember standing outside the burning building, hearing Robin’s three knocks. <strong>He died here. You have come back for the truth, not to save him.</strong>',[
  {label:'ENTER THE BIRTHDAY STAGE',action:()=>{unlockStage();subtitle('Knock. Knock. Knock.',3600);}},
  {label:'NOT YET',action:()=>feed('THE DOOR WAITS IN SILENCE.')}
 ]);
},{range:3.1});
const stageMic=mesh(new THREE.SphereGeometry(.16,12,8),glowMat('#b9b4a1',.55),0,1.94,-22.35);
addInteractor('stage','APPROACH THE LAST MICROPHONE',0,-22.1,stageMic,()=>openFinale(),{range:3.3,color:'#ef6567'});
const exitHandle=block(0,1.05,21.63,.28,.35,.20,brass);
addInteractor('exit','OPEN THE FRONT DOORS',0,20.6,exitHandle,()=>{
 if(!state.clues.length){openDialog('ENTRANCE / 11:11 PM','YOU CAN STILL LEAVE','The front doors are unlocked. Outside is the road, your car, the life you made without Robin. Inside is the answer you came for.',[{label:'STAY AND FIND WHAT EDWIN HID',action:()=>{feed('YOU STAY. FOR NOW.');}},{label:'LEAVE CANDLEWICK’S',action:()=>finish('escape')}]);return;}
 openDialog('EXIT / FINAL CHOICE','THE ROAD OUT','Your evidence could expose what happened here. But the song is still playing, and the three-knock signal remains unexplained.',[{label:'LEAVE WITH WHAT YOU KNOW',action:()=>finish('escape')},{label:'TURN BACK',action:()=>{feed('THE MUSIC GROWS LOUDER WHEN YOU RETURN.');}}]);
},{range:3.2});
const locker=block(16.6,1,-.9,1.15,2,1.0,mat('#444f4b'),true);
block(16.5,1,-.38,.67,1.65,.13,brass);
addInteractor('hide','HIDE IN THE PRIZE LOCKER',15.4,-.9,locker,()=>{
 if(!state.hasPower){feed('THE PRIZE LOCKER SMELLS OF DAMP CARDBOARD.');return;}
 state.hiddenUntil=performance.now()+6500; $('hiding-status').classList.remove('hidden');
 monsterState.chase=false;monsterState.mode='patrol';feed('YOU HIDE. DO NOT MAKE A SOUND.');
},{range:3});

function disableById(id){const o=interactables.find(a=>a.id===id);if(o){o.active=false;o.ring.visible=false;}}
function unlockStage(){state.gateOpen=true;stageBarrier.visible=false;const i=solids.indexOf(barrierCollide);if(i>=0)solids.splice(i,1);disableById('stageGate');updateHUD();feed('BACKSTAGE UNLOCKED · THE FINAL SONG AWAITS');}
function evidenceCount(){return Number(state.hasPartyTape)+Number(state.hasArcadeTape)+Number(state.hasLedger)}
function maybeWake(){if(evidenceCount()===2&&!state.hasPower){subtitle('Somewhere, a mechanical footstep. Then another.',3700)}}
function wakeMonster(){monsterState.mode='patrol';monsterGroup.visible=true;monsterGroup.position.set(0,0,-11);monsterWp=0;shakeLights();}
function shakeLights(){for(const l of swingLights)l.seed=Math.random()*100;document.body.classList.add('scared');setTimeout(()=>document.body.classList.remove('scared'),850);sting('scare');}

// AUDIO -------------------------------------------------------------------------
function startAudio(){if(soundtrack)return;try{
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 const ctx=new AC();const master=ctx.createGain();master.gain.value=.29;master.connect(ctx.destination);
 const droneGain=ctx.createGain();droneGain.gain.value=.07;droneGain.connect(master);
 const tones=[55,55.3,82.4];const oscillators=[];
 tones.forEach((freq,i)=>{const o=ctx.createOscillator();const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=210;const g=ctx.createGain();g.gain.value=i===2?.27:.52;o.type=i===2?'triangle':'sawtooth';o.frequency.value=freq;o.connect(f);f.connect(g);g.connect(droneGain);o.start();oscillators.push(o)});
 soundtrack={ctx,master,droneGain,oscillators,muted:false};
 }catch(e){console.warn('Audio disabled',e);}}
function tone(freq=220,duration=.3,type='sine',volume=.1){if(!soundtrack||soundtrack.muted)return;const {ctx,master}=soundtrack;if(ctx.state==='suspended')ctx.resume().catch(()=>{});const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(freq*.58,22),ctx.currentTime+duration);g.gain.setValueAtTime(Math.max(volume,.001),ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);o.connect(g);g.connect(master);o.start();o.stop(ctx.currentTime+duration+.02);}
function sting(type='clue'){tone(type==='scare'?95:380,type==='scare'?.8:.48,'sawtooth',type==='scare'?.22:.10);setTimeout(()=>tone(type==='scare'?73:282,.26,'triangle',.08),120)}
function footstep(){const now=performance.now();if(now-lastFootstep<300)return;lastFootstep=now;tone(58,.07,'triangle',.035)}
function startBirthdayMusic(){
 if(birthdayMusicTimer)return;
 const phrase=()=>{
  if(!state.hasPower||state.ended||state.paused)return;
  // A deliberately wrong music-box birthday motif, composed as synthesized notes.
  [392,392,415,392,329,294,392,392,415,392,349,330].forEach((n,i)=>{
   setTimeout(()=>{if(!state.ended&&!state.paused)tone(n,.25,'sine',.022);},i*245);
  });
 };
 phrase();birthdayMusicTimer=setInterval(phrase,7900);
}
function haunt(){
 const horrors=['Three dull knocks travel through the walls.','A paper party hat moves across an empty table.','The old PA clicks on, then goes dead.','Heavy metal shoes scrape somewhere nearby.','The four-note 1973 jingle plays from a distant speaker.'];
 subtitle(horrors[Math.floor(Math.random()*horrors.length)],3100);
 tone(90+Math.random()*60,.6,'triangle',.043);
 if(Math.random()>.65)shakeLights();
}

// GAME UI & STORY ----------------------------------------------------------------
function feed(message){const container=$('message-feed');container.innerHTML='';const line=document.createElement('div');line.className='feed-line';line.textContent='› '+message;container.appendChild(line);}
function subtitle(txt,duration=3500){const el=$('subtitle');const id=++lastSubId;el.textContent=txt;el.classList.remove('hidden');setTimeout(()=>{if(id===lastSubId)el.classList.add('hidden')},duration)}
function openDialog(type,title,body,choices){
 state.overlay='dialog';state.paused=true;dialogue={type,title,body,choices};document.exitPointerLock?.();
 $('dialog-type').textContent=type;$('dialog-title').textContent=title;$('dialog-body').innerHTML=body;
 const area=$('dialog-choices');area.replaceChildren();
 choices.forEach((choice,i)=>{const b=document.createElement('button');b.className='choice-btn';b.disabled=!!choice.disabled;b.innerHTML=`<span class="choice-number">${String(i+1).padStart(2,'0')}</span><span>${choice.label}</span>`;
 b.addEventListener('click',()=>{closeDialog();choice.action?.();if(state.started&&!state.ended&&!state.overlay&&choice.action)requestMouse();});area.appendChild(b)});
 $('dialog-overlay').classList.remove('hidden');
}
function closeDialog(){state.overlay=null;state.paused=false;dialogue=null;$('dialog-overlay').classList.add('hidden');}
function requestMouse(){if(!isMobile()&&state.started&&!state.ended&&!state.overlay)renderer.domElement.requestPointerLock?.().catch(()=>{});}
function showOverlay(id){if(state.ended)return;state.paused=true;state.overlay=id;document.exitPointerLock?.();if(id==='journal-overlay')updateJournal();$(id).classList.remove('hidden');}
function closeOverlay(id){$(id).classList.add('hidden');state.overlay=null;state.paused=false;requestMouse();}
function showPause(){if(!state.started||state.ended||state.overlay)return;showOverlay('pause-overlay')}
function updateHUD(){
 const n=evidenceCount();$('evidence-count').textContent=`0${n} / 03`;$('evidence-progress').style.width=(n/3*100)+'%';
 if($('flash-count'))$('flash-count').textContent=String(state.flashShots).padStart(2,'0')+' / 03';
 $('battery-count').textContent=Math.round(state.battery)+'%';$('battery-progress').style.width=state.battery+'%';
 $('stamina-progress').style.width=state.stamina+'%';
 $('nerve-count').textContent='● '.repeat(Math.max(0,3-state.catches))+'○ '.repeat(state.catches);
 if(!state.hasPartyTape||!state.hasArcadeTape||!state.hasLedger){$('objective').textContent='RECOVER THE FIRE EVIDENCE';$('objective-detail').textContent=`Find two 1973 recordings and Edwin’s ledger. ${n}/3 recovered.`;}
 else if(!state.hasFuse){$('objective').textContent='BRING THE LIGHTS BACK';$('objective-detail').textContent='Find the ceramic fuse in Maintenance.';}
 else if(!state.hasPower){$('objective').textContent='RESTORE THE GENERATOR';$('objective-detail').textContent='The control panel is in Maintenance. But light comes at a price.';}
 else if(!state.gateOpen){$('objective').textContent='FIND THE LAST PARTY';$('objective-detail').textContent='The brass key opens Backstage, at the end of the main corridor.';}
 else {$('objective').textContent='CONFRONT THE LAST BIRTHDAY';$('objective-detail').textContent='Investigate the stage and sealed service hatch. Choose carefully.';}
}
function updateJournal(){
 const entries=[{t:'01 / THE LETTER',body:state.notes.find(n=>n.startsWith('Invitation'))||null},{t:'02 / THE PARTY TAPE',body:state.hasPartyTape?story.partyTape.note:null},{t:'03 / THE ARCADE TAPE',body:state.hasArcadeTape?story.arcadeTape.note:null},{t:'04 / THE MANAGER’S LEDGER',body:state.hasLedger?story.ledger.note:null},{t:'05 / THE SILENT RABBIT',body:state.hasPower?'The generator restores a ten-year-old birthday song. The damaged rabbit moves without a visible operator. His internal voice system is destroyed.':null}];
 $('journal-content').innerHTML=entries.map(e=>`<article class="journal-entry ${e.body?'':'locked'}"><b>${e.t}</b><p>${e.body||'NO RECORD FOUND. INVESTIGATE THE BUILDING.'}</p></article>`).join('');
}
function openFinale(){
 monsterState.mode='sleep';monsterGroup.visible=false;
 actors.morrow1983?.play('Idle');
 openDialog('FINAL CHAPTER / OCTOBER 27, 1983','ROBIN’S LAST BIRTHDAY',
 'The scorched stage lights burn dimly. Beside Robin’s empty chair sits Edwin’s original signed fire report. His last line reads: <strong>“I heard him knock. I did not open the door.”</strong><br><br>Three knocks sound from the sealed service hatch. They do not prove Robin survived. <strong>Robin died here in 1973.</strong> Mr. Morrow stands entirely silent at the far end of the stage.',[
 {label:'KNOCK THREE TIMES · RECOVER THE REPORT',action:()=>finish('silence')},
 {label:'SIT DOWN IN THE EMPTY BIRTHDAY CHAIR',action:()=>finish('host')},
 {label:'OVERLOAD THE CIRCUIT AND ESCAPE',action:()=>finish('ashes')},
 {label:'FOLLOW THE KNOCKS BEHIND THE CURTAIN',action:()=>finish('eleventh')},
 {label:'LEAVE THE STAGE · KEEP INVESTIGATING',action:()=>{monsterGroup.visible=true;monsterState.mode='patrol';feed('THE RABBIT TURNS ITS HEAD. NO SOUND COMES FROM IT.');}}
 ]);
}
function finish(id){const entry=endings.find(e=>e.id===id);if(!entry)return;
 state.ended=true;state.paused=true;state.overlay='ending-overlay';monsterState.mode='sleep';document.exitPointerLock?.();
 endingSeen.add(id);saveSeen();tone(60,1.5,'sawtooth',.10);
 $('ending-number').textContent=entry.number;$('ending-title').textContent=entry.title;$('ending-description').textContent=entry.desc;$('ending-summary').textContent=entry.outcome;
 $('ending-collection').textContent=`ENDINGS DISCOVERED: ${endingSeen.size} / ${endings.length}`;$('ending-overlay').classList.remove('hidden');$('hud').classList.add('hidden');
}
function updateEndingCollection(){
 $('ending-collection').innerHTML='<strong>YOUR ENDING ARCHIVE</strong><br>'+endings.map((e,i)=>`${endingSeen.has(e.id)?'◈ '+e.name:'◇ ??? · LOCKED ENDING'}`).join('<br>');
}
function getLocation(x,z){if(z>=9)return'ENTRANCE LOBBY';if(z < -18.1&&Math.abs(x)<7)return'THE BIRTHDAY STAGE';if(x < -3.25)return z<-9.6?'MANAGER’S OFFICE':'PARTY ROOM';if(x>3.25)return z<-9.6?'MAINTENANCE':'GAME ARCADE';return z < -9.6?'BACK HALL':'MAIN HALL';}
function getNearby(){let best=null,bestDist=Infinity;
 for(const item of interactables){if(!item.active)continue;const dist=Math.hypot(eye.x-item.x,eye.z-item.z);if(dist>item.range||dist>=bestDist)continue;
 const vx=item.x-eye.x,vz=item.z-eye.z;const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw);
 const inFront=(vx*forwardX+vz*forwardZ)/Math.max(dist,.01)>-.25;
 if(inFront||dist<1.5){best=item;bestDist=dist;}}
 return best;
}
function interact(){if(!state.started||state.paused||state.ended)return;const item=getNearby();if(item){tone(295,.12,'triangle',.06);item.callback(item)}else feed('NOTHING HERE TO INTERACT WITH.');}
function updatePrompts(){nearInteraction=getNearby();const prompt=$('interact-prompt');if(nearInteraction){prompt.classList.remove('hidden');$('interact-label').textContent=nearInteraction.label;}else prompt.classList.add('hidden');}

// INPUT + COLLISION -------------------------------------------------------------
function collides(x,z){if(Math.abs(x)>18.0||z>21.5||z<-26.0)return true;
 for(const s of solids)if(Math.abs(x-s.x)<s.w/2+PLAYER_RADIUS&&Math.abs(z-s.z)<s.d/2+PLAYER_RADIUS)return true;
 return false;}
function movePlayer(delta){
 if(state.hiddenUntil>performance.now())return;
 const w=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+(-mobileInput.y);
 const d=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+mobileInput.x;
 const length=Math.hypot(w,d);let moving=length>.1;
 const runKey=keys.has('ShiftLeft')||keys.has('ShiftRight')||mobileInput.running;
 const running=runKey&&moving&&state.stamina>1;
 if(running)state.stamina=clamp(state.stamina-delta*20,0,100);else state.stamina=clamp(state.stamina+delta*13,0,100);
 const speed=(running?5.05:2.9)*Math.min(length,1);const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw),rightX=Math.cos(yaw),rightZ=-Math.sin(yaw);
 const dx=(forwardX*w+rightX*d)/Math.max(length,1)*speed*delta;
 const dz=(forwardZ*w+rightZ*d)/Math.max(length,1)*speed*delta;
 if(!collides(eye.x+dx,eye.z))eye.x+=dx;
 if(!collides(eye.x,eye.z+dz))eye.z+=dz;
 const bob=moving?Math.sin(animTime*(running?15:9))*0.055:0;
 camera.position.set(eye.x,PLAYER_HEIGHT+bob,eye.z);camera.rotation.y=yaw;camera.rotation.x=pitch;
 if(moving&&Math.random()<delta*1.7)footstep();
 if(state.flashlight&&state.battery>0)state.battery=Math.max(0,state.battery-delta*1.45);
 if(!state.flashlight)state.battery=Math.min(100,state.battery+delta*.85);
 if(state.battery<=0)state.flashlight=false;
 torch.intensity=state.flashlight?12*(.92+Math.random()*.12):0;
}
function updateMonster(dt){
 if(jumpscarePending||!state.hasPower||monsterState.mode==='sleep'||state.gateOpen&&eye.z<-18.5)return;
 if(!monsterGroup.visible)return;
 if(monsterState.stunnedUntil && performance.now()<monsterState.stunnedUntil)return;
 if(monsterState.mode==='stunned'){monsterState.mode='patrol';monsterState.stunnedUntil=0;}
 const mx=monsterGroup.position.x,mz=monsterGroup.position.z;
 const dist=Math.hypot(eye.x-mx,eye.z-mz);
 const hidden=state.hiddenUntil>performance.now();
 if(!hidden&&dist<(state.answeredTape?10:7.5)){monsterState.chase=true;monsterState.mode='chase';if(performance.now()-lastChaseMessage>13000){subtitle('A heavy, dragging footstep. The rabbit sees you.',2500);lastChaseMessage=performance.now();sting('scare');}}
 else if(hidden||dist>14){monsterState.chase=false;monsterState.mode='patrol';}
 let target,velocity;
 if(monsterState.chase&&!hidden){target=eye;velocity=state.answeredTape?2.5:2.1;}else{target=monsterWaypoints[monsterWp];velocity=.78;if(Math.hypot(mx-target.x,mz-target.z)<.65)monsterWp=(monsterWp+1)%monsterWaypoints.length;}
 const vx=target.x-mx,vz=target.z-mz;const len=Math.hypot(vx,vz)||1;
 if(dist<12&&performance.now()-lastMorrowFootstep>(monsterState.chase?430:880)){
  lastMorrowFootstep=performance.now();
  const volume=(monsterState.chase?.085:.044)*THREE.MathUtils.clamp(1-dist/15,.15,1);
  tone(47+Math.random()*18,.15,'triangle',volume);
  if(dist<7&&!monsterState.chase&&Math.random()<.25)tone(240,.08,'square',.012);
 }
 const stepx=vx/len*velocity*dt,stepz=vz/len*velocity*dt;
 // NPC can travel through walls in the old party house, intentionally.
 monsterGroup.position.x+=stepx;monsterGroup.position.z+=stepz;
 monsterGroup.position.y=Math.sin(animTime*(monsterState.chase?12:5))*.075;
 monsterGroup.rotation.y=Math.atan2(-vx,-vz);
 monsterGroup.rotation.z=Math.sin(animTime*7)*.015;
 actors.morrow1983?.play(monsterState.chase?'Chase':'Walk',.24);
 if(monsterState.chase&&dist<1.35&&performance.now()-state.lastBump>2000){
  triggerJumpscare();
 }

}
let jumpscarePending=false;
function triggerJumpscare(){
 if(jumpscarePending)return;
 jumpscarePending=true;state.lastBump=performance.now();state.jumpscareUntil=performance.now()+1100;
 monsterState.chase=false;monsterState.mode='sleep';
 const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
 monsterGroup.position.set(eye.x+f.x*.86,0,eye.z+f.z*.86);monsterGroup.rotation.y=yaw+Math.PI;
 actors.morrow1983?.play('Jumpscare',.04);
 document.body.classList.add('jumpscare');sting('scare');tone(56,1,'sawtooth',.22);
 const el=$('jumpscare-alert');if(el)el.textContent='';
 setTimeout(()=>{
  document.body.classList.remove('jumpscare');jumpscarePending=false;state.jumpscareUntil=0;
  if(state.ended)return;
  state.catches++;updateHUD();
  if(state.catches>=3){finish('caught');return;}
  eye.set(0,PLAYER_HEIGHT,12.8);camera.position.copy(eye);monsterGroup.position.set(0,0,-14);
  monsterState.mode='patrol';monsterState.chase=false;monsterWp=0;
  actors.morrow1983?.play('Idle',0.05);
  subtitle('You wake in the foyer. Your camera lies beside you.',4600);
  feed(`YOU WERE CAUGHT · ${3-state.catches} CHANCES LEFT`);
 },1100);
}
function cameraFlash(){
 if(!state.started||state.paused||state.ended)return;
 if(state.flashShots<=0){feed('OUT OF FLASHBULBS.');return;}
 state.flashShots--;updateHUD();tone(1050,.09,'sawtooth',.12);
 document.body.classList.add('photo-flash');setTimeout(()=>document.body.classList.remove('photo-flash'),370);
 if(monsterGroup.visible && monsterState.mode!=='sleep'){
  const dx=monsterGroup.position.x-eye.x,dz=monsterGroup.position.z-eye.z,dist=Math.hypot(dx,dz);
  const facing=(-Math.sin(yaw)*dx-Math.cos(yaw)*dz)/(dist||1);
  if(dist<8&&facing>.32){monsterState.chase=false;monsterState.mode='stunned';monsterState.stunnedUntil=performance.now()+3000;
   actors.morrow1983?.play('Idle');feed('MR. MORROW STOPS MOVING · 3 SECONDS');return;}
 }
 feed('THE FLASH REVEALS EMPTY AIR.');
}
function toggleLight(){if(!state.started||state.paused)return;if(state.battery<=0){feed('THE BATTERY IS EMPTY. TURN THE LIGHT OFF TO RECHARGE.');return;}state.flashlight=!state.flashlight;tone(500,.08,'square',.025);feed(state.flashlight?'FLASHLIGHT ON':'FLASHLIGHT OFF · BATTERY RECHARGING');}
function handleKey(e){
 if(['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();
 if(e.code==='Escape'){
  if(state.overlay==='journal-overlay'||state.overlay==='map-overlay'||state.overlay==='pause-overlay')closeOverlay(state.overlay);
  else if(!state.overlay&&state.started&&!state.ended)showPause();return;
 }
 if(state.ended)return;
 if(e.repeat)return;
 if(state.overlay)return;
 if(e.code==='KeyE')interact();
 if(e.code==='KeyF')toggleLight();
 if(e.code==='KeyP')cameraFlash();
 if(e.code==='KeyJ'&&state.started)showOverlay('journal-overlay');
 if(e.code==='KeyM'&&state.started)showOverlay('map-overlay');
 keys.add(e.code);
}
document.addEventListener('keydown',handleKey);document.addEventListener('keyup',e=>keys.delete(e.code));
document.addEventListener('mousemove',e=>{
 if(!state.started||state.paused||state.ended)return;
 if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*mouseSensitivity;pitch=clamp(pitch-e.movementY*mouseSensitivity,-1.4,1.4);}
 else if(touchLook){const dx=e.clientX-touchLook.x,dy=e.clientY-touchLook.y;yaw-=dx*.004;pitch=clamp(pitch-dy*.004,-1.4,1.4);touchLook={x:e.clientX,y:e.clientY};}
});
document.addEventListener('pointerlockchange',()=>{
 if(!document.pointerLockElement&&state.started&&!state.paused&&!state.ended&&!isMobile()){showPause();}
});
renderer.domElement.addEventListener('click',()=>{if(state.started&&!state.paused&&!state.ended&&!isMobile())requestMouse()});
// Track touch-look only on right half of world canvas, avoiding the virtual joystick.
renderer.domElement.addEventListener('pointerdown',e=>{if(isMobile()&&e.clientX>window.innerWidth*.35){touchLook={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)}});
renderer.domElement.addEventListener('pointermove',e=>{if(!isMobile()||!touchLook||state.paused)return;const dx=e.clientX-touchLook.x,dy=e.clientY-touchLook.y;yaw-=dx*.005;pitch=clamp(pitch-dy*.005,-1.4,1.4);touchLook={x:e.clientX,y:e.clientY}});
renderer.domElement.addEventListener('pointerup',()=>touchLook=null);
renderer.domElement.addEventListener('pointercancel',()=>touchLook=null);
const joy=$('joystick-base'),knob=$('joystick-knob');let joyId=null;
function joyMove(e){const r=joy.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const dx=e.clientX-cx,dy=e.clientY-cy;const scale=Math.min(1,52/(Math.hypot(dx,dy)||1));const x=dx*scale,y=dy*scale;knob.style.transform=`translate(${x}px,${y}px)`;mobileInput.x=x/52;mobileInput.y=y/52;}
joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(e.pointerId);joyMove(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});
function joyStop(){joyId=null;mobileInput.x=mobileInput.y=0;knob.style.transform='';}
joy.addEventListener('pointerup',joyStop);joy.addEventListener('pointercancel',joyStop);
$('touch-interact').addEventListener('click',interact);
$('touch-journal').addEventListener('click',()=>showOverlay('journal-overlay'));
$('touch-map').addEventListener('click',()=>showOverlay('map-overlay'));
$('touch-flash').addEventListener('click',toggleLight);
 $('touch-photo')?.addEventListener('click',cameraFlash);
$('touch-run').addEventListener('pointerdown',e=>{mobileInput.running=true;$('touch-run').setPointerCapture(e.pointerId)});
$('touch-run').addEventListener('pointerup',()=>mobileInput.running=false);
$('touch-run').addEventListener('pointercancel',()=>mobileInput.running=false);
$('interact-prompt').addEventListener('click',interact);

// MENUS ------------------------------------------------------------------------
$('start-btn').addEventListener('click',()=>{
 $('start-screen').classList.remove('visible');$('hud').classList.remove('hidden');state.started=true;state.paused=false;startAudio();tone(130,.75,'sine',.1);updateHUD();
 openDialog('JUNE MERCER / OCTOBER 27, 1983','TEN YEARS SINCE THE FIRE',
 'Your brother Robin died at Candlewick’s on his seventh birthday in 1973. You were fourteen. An unmarked package arrived this morning containing a cassette from that final party: Mr. Morrow’s once-cheerful prerecorded greeting, a fire alarm and <strong>three knocks</strong>—the private signal Robin used with you. Someone wants you to investigate what Edwin Candlewick hid.',[
 {label:'POCKET THE CASSETTE · ENTER CANDLEWICK’S',action:()=>{feed('FIND THE 1973 EVIDENCE.');subtitle('Rain beats against the boarded windows.',4100);}},
 {label:'CHECK THE BUILDING FLOOR PLAN FIRST',action:()=>{feed('PRESS M TO VIEW THE FLOOR PLAN.');subtitle('Robin died here. You need the truth.',4100);}}
 ]);
});
$('story-btn').addEventListener('click',()=>{
 const d=$('dialog-overlay');d.classList.remove('hidden');$('dialog-type').textContent='1973 / ARCHIVE';$('dialog-title').textContent='THE FIRE AT CANDLEWICK’S';
 $('dialog-body').innerHTML='October 27, 1973: eleven children attended Robin Mercer’s seventh birthday. An electrical fire spread from the stage. Chained emergency exits prevented evacuation. Ten children escaped. <strong>Robin Mercer, seven, died.</strong> Edwin Candlewick, the owner, vanished during the investigation. His former maintenance supervisor Ruth Hale had warned him about the danger. Ten years later, June returns to uncover why her brother was left behind.';
 const choices=$('dialog-choices');choices.replaceChildren();const b=document.createElement('button');b.className='choice-btn';b.textContent='CLOSE THE CASE FILE';b.onclick=()=>d.classList.add('hidden');choices.appendChild(b);
});
$('menu-btn').addEventListener('click',showPause);
$('resume-btn').addEventListener('click',()=>closeOverlay('pause-overlay'));
$('mute-btn').addEventListener('click',()=>{startAudio();if(soundtrack){soundtrack.muted=!soundtrack.muted;soundtrack.master.gain.value=soundtrack.muted?0:.29;$('mute-btn').textContent=soundtrack.muted?'SOUND: OFF':'SOUND: ON';}});
$('sensitivity-btn').addEventListener('click',()=>{mouseSensitivity=mouseSensitivity>.003? .0013 :mouseSensitivity<.002?.0021:.0036;$('sensitivity-btn').textContent='MOUSE SENSITIVITY: '+(mouseSensitivity<.002?'LOW':mouseSensitivity>.003?'HIGH':'NORMAL')});
$('restart-btn').addEventListener('click',()=>location.reload());
$('replay-btn').addEventListener('click',()=>location.reload());
$('endings-btn').addEventListener('click',updateEndingCollection);
for(const btn of document.querySelectorAll('.close-ui'))btn.addEventListener('click',()=>closeOverlay(btn.dataset.close));
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7))});
window.addEventListener('blur',()=>{keys.clear();mobileInput.running=false;if(state.started&&!state.paused&&!state.ended)showPause()});

// RENDER LOOP -------------------------------------------------------------------
function animate(){requestAnimationFrame(animate);const delta=Math.min(clock.getDelta(),.047);animTime+=delta;
 if(!state.paused&&state.started&&!state.ended){
  if(!jumpscarePending)movePlayer(delta);updateMonster(delta);
  if(state.hasPower&&performance.now()>nextHaunt&&nextHaunt>0){haunt();nextHaunt=performance.now()+17000+Math.random()*21000;}
  $('glitch').style.opacity=monsterState.chase?'.72':'.35';
  const loc=getLocation(eye.x,eye.z);if(loc!==lastLocation){lastLocation=loc;$('location-label').textContent=loc;
   if(loc==='PARTY ROOM')subtitle('This is the room where Robin celebrated his final birthday.',4000);
   if(loc==='MANAGER’S OFFICE')subtitle('Edwin hid the order to chain the exits.',3900);
   if(loc==='MAINTENANCE')subtitle('Ruth Hale warned management about this equipment.',3900);
   if(loc==='GAME ARCADE')subtitle('Prize tokens scatter across the floor.',3400);
   if(loc==='THE BIRTHDAY STAGE')subtitle('The birthday table is still set for Robin.',4000);
  }
  if(performance.now()-cooldown>150){updatePrompts();updateHUD();cooldown=performance.now();}
 }
 // Warm flickering light pools.
 for(const l of swingLights){const f=(Math.sin(animTime*1.13+l.seed)+.33*Math.sin(animTime*10.4+l.seed*5));const blink=l.flicker&&Math.sin(animTime*2.6+l.seed)*Math.sin(animTime*7.1+l.seed)>.72?.13:1;l.light.intensity=(state.hasPower?l.base*1.15:l.base*.7)*(0.87+.12*f)*blink;}
 stageSpot.intensity=state.hasPower?1.9:.42;
 for(const m of mixers)m.update(Math.min(delta,.05));
 if(monsterGroup.visible&&!actors.morrow1983){const s=1+Math.sin(animTime*6)*.01;monsterGroup.scale.set(1.12*s,1.13,1.12*s);}
 for(const m of motes)m.object.position.y=m.y+Math.sin(animTime*.65+m.t)*m.amp;
 for(const o of interactables)if(o.active){o.ring.material.opacity=.30+Math.sin(animTime*2.3+o.x)*.20;o.ring.rotation.z+=delta*.20;}
 // Each flicker is a different recording scratch in the air.
 const arr=dust.geometry.attributes.position.array;for(let i=0;i<dustCount;i++){arr[i*3+1]+=delta*.034;if(arr[i*3+1]>4.15)arr[i*3+1]=.04;}dust.geometry.attributes.position.needsUpdate=true;
 if(!state.started){camera.rotation.y=Math.sin(animTime*.10)*.04;camera.position.x=Math.sin(animTime*.09)*.04;}
 if(state.hiddenUntil>0&&performance.now()>state.hiddenUntil){state.hiddenUntil=0;$('hiding-status').classList.add('hidden');feed('YOU SLIP OUT OF HIDING.');}
 renderer.render(scene,camera);
}
updateHUD();animate();
console.info('THE LAST BIRTHDAY: 1983 · READY · 6 ENDINGS');
