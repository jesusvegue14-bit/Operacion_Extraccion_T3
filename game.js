import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// T3: escena, cámara FPS, renderizador y sombras (metodología semana 12).
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x17252b);
scene.fog = new THREE.FogExp2(0x17252b, 0.016);
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, .08, 170);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0x9ab8c9,0x25372b,2));
const sun=new THREE.DirectionalLight(0xd7e7e3,2.1);sun.position.set(18,35,-20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-65;sun.shadow.camera.right=65;sun.shadow.camera.top=65;sun.shadow.camera.bottom=-65;scene.add(sun);
const loader=new GLTFLoader();
const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.88});
const asphalt=mat(0x303a3d),concrete=mat(0x64716d),wallMat=mat(0x475957),metal=mat(0x58676b);
const colliders=[],rayTargets=[],zombies=[],crates=[];
function block(x,y,z,w,h,d,material,solid=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);if(solid){colliders.push(new THREE.Box3().setFromObject(m));rayTargets.push(m)}return m}
// Mundo explorable: carretera de 120 unidades, edificios, obstáculos y desvíos.
block(0,-.15,-53,24,.3,142,asphalt,false);
for(const side of [-1,1]){
 block(side*13,1.4,-53,2.5,2.8,142,wallMat);
 for(let i=0;i<9;i++){
  const z=9-i*15;block(side*20,5,z,11,10,12,concrete);
  block(side*13.05,3,z,1.1,.6,2,metal,false);
 }
}
for(const [x,z,w,d] of [[-6,-12,4,3],[5,-25,4,4],[-5,-41,5,3],[6,-57,4,4],[-5,-75,4,4],[4,-94,4,3]]){
 block(x,1,z,w,2,d,metal);
}
// Marcas de carretera, luces de señalización y carteles de orientación.
for(let z=12;z>-116;z-=8)block(0,.018,z,.18,.025,3,mat(0x9c9a76),false);
for(let z=0;z>-120;z-=24){const p=new THREE.PointLight(0xffbb70,13,16);p.position.set(-10,4,z);scene.add(p);block(-10,2,z,.15,4,.15,metal,false)}
const zone=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.2,.06,40),new THREE.MeshStandardMaterial({color:0x21cf87,emissive:0x067a44,emissiveIntensity:1,transparent:true,opacity:.65}));zone.position.set(0,.05,-113);scene.add(zone);
const beacon=new THREE.PointLight(0x00ff9d,45,20);beacon.position.set(0,3,-113);scene.add(beacon);
block(0,.12,-113,9,.12,.3,mat(0x12e6a0),false);

const player={pos:new THREE.Vector3(0,1.65,10),yaw:0,pitch:0,speed:7};
const keys=new Set();let state='menu',activeWeapon=0,ammo=[12,18],lastNotice=0;
const guns=[null,null];const gunMount=new THREE.Group();camera.add(gunMount);scene.add(camera);
const weaponNames=['PISTOLA','RIFLE'];
const ui={overlay:document.getElementById('overlay'),heading:document.getElementById('heading'),description:document.getElementById('description'),start:document.getElementById('start'),ammo:document.getElementById('ammo'),weapon:document.getElementById('weapon'),zombies:document.getElementById('zombies'),notice:document.getElementById('notice')};
function showNotice(t){ui.notice.textContent=t;lastNotice=performance.now()}
function updateHud(){ui.weapon.textContent=weaponNames[activeWeapon];ui.ammo.textContent=ammo[activeWeapon]+' BALAS';ui.zombies.textContent='ZOMBIS: '+zombies.filter(z=>z.hp>0).length}
// GLB obligatorios: dos armas diferentes y modelo zombi, generados para este proyecto.
function loadGLB(path){return new Promise((resolve,reject)=>loader.load(path,g=>resolve(g.scene),undefined,reject))}
const assets=await Promise.all([loadGLB('assets/arma1.glb'),loadGLB('assets/arma2.glb'),loadGLB('assets/zombi.glb')]);
for(let i=0;i<2;i++){
 const gun=assets[i];gun.position.set(.37,-.35,-.62);gun.rotation.y=-.08;gun.scale.setScalar(i===0?1:0.8);gun.visible=i===0;
 gun.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});gunMount.add(gun);guns[i]=gun;
}
function spawnZombie(x,z,range=13,speed=1.5){
 const model=assets[2].clone(true);model.position.set(x,0,z);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.zombie=true}});scene.add(model);
 const zed={model,hp:2,range,speed,active:false};model.traverse(o=>{if(o.isMesh)o.userData.owner=zed});zombies.push(zed);
}
for(const [x,z,range,speed] of [[4,-10,11,1.35],[-4,-20,12,1.5],[3,-34,14,1.8],[-4,-48,12,1.55],[4,-62,15,1.7],[-3,-73,12,1.7],[3,-86,14,2],[-4,-98,13,1.8]])spawnZombie(x,z,range,speed);
function ammoCrate(x,z){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(1,.6,.8),mat(0x997c40));b.position.y=.35;b.castShadow=true;g.add(b);const stripe=new THREE.Mesh(new THREE.BoxGeometry(.9,.07,.84),mat(0xffdb79));stripe.position.y=.68;g.add(stripe);g.position.set(x,0,z);scene.add(g);crates.push({mesh:g,taken:false})}
for(const [x,z] of [[7,-18],[-7,-43],[7,-68],[-6,-91]])ammoCrate(x,z);
updateHud();
function switchWeapon(n){if(state!=='playing')return;activeWeapon=n;guns.forEach((g,i)=>g.visible=i===n);updateHud()}
function collides(x,z,r=.38){if(Math.abs(x)>11.35||z>16||z< -119)return true;const box=new THREE.Box3(new THREE.Vector3(x-r,.1,z-r),new THREE.Vector3(x+r,2,z+r));return colliders.some(c=>c.intersectsBox(box))}
function finish(won){state=won?'won':'lost';document.exitPointerLock?.();ui.heading.textContent=won?'¡MISIÓN COMPLETADA!':'GAME OVER';ui.description.textContent=won?'Has llegado a la zona de extracción. ¡Sobreviviste!':'Un zombi te ha atrapado. La misión ha terminado.';ui.start.textContent='REINICIAR PARTIDA';ui.overlay.classList.remove('hidden')}
function restart(){player.pos.set(0,1.65,10);player.yaw=0;player.pitch=0;ammo=[12,18];activeWeapon=0;guns.forEach((g,i)=>g.visible=i===0);zombies.forEach(z=>{scene.remove(z.model)});zombies.length=0;for(const [x,z,r,s] of [[4,-10,11,1.35],[-4,-20,12,1.5],[3,-34,14,1.8],[-4,-48,12,1.55],[4,-62,15,1.7],[-3,-73,12,1.7],[3,-86,14,2],[-4,-98,13,1.8]])spawnZombie(x,z,r,s);crates.forEach(c=>{c.taken=false;c.mesh.visible=true});updateHud();state='playing';ui.overlay.classList.add('hidden');renderer.domElement.requestPointerLock()}
ui.start.addEventListener('click',()=>{if(state==='paused'){state='playing';ui.overlay.classList.add('hidden');renderer.domElement.requestPointerLock()}else restart()});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement!==renderer.domElement&&state==='playing'){state='paused';ui.heading.textContent='PAUSA';ui.description.textContent='Haz clic en continuar para regresar a la misión.';ui.start.textContent='CONTINUAR';ui.overlay.classList.remove('hidden')}else if(document.pointerLockElement===renderer.domElement&&state==='paused'){state='playing';ui.overlay.classList.add('hidden')}});
ui.start.addEventListener('click',()=>{if(state==='playing')ui.overlay.classList.add('hidden')});
document.addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='Digit1')switchWeapon(0);if(e.code==='Digit2')switchWeapon(1)});
document.addEventListener('keyup',e=>keys.delete(e.code));
document.addEventListener('mousemove',e=>{if(state!=='playing'||document.pointerLockElement!==renderer.domElement)return;player.yaw-=e.movementX*.0023;player.pitch=THREE.MathUtils.clamp(player.pitch-e.movementY*.0023,-1.35,1.35)});
const raycaster=new THREE.Raycaster();
function shoot(){if(state!=='playing'||document.pointerLockElement!==renderer.domElement)return;if(ammo[activeWeapon]<=0){showNotice('SIN MUNICIÓN: BUSCA UNA CAJA');return}ammo[activeWeapon]--;updateHud();
 const direction=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);raycaster.set(camera.position,direction);raycaster.far=85;
 const targets=[...rayTargets];for(const z of zombies)if(z.hp>0)z.model.traverse(o=>{if(o.isMesh)targets.push(o)});
 const hits=raycaster.intersectObjects(targets,false);if(hits.length){const owner=hits[0].object.userData.owner;if(owner&&owner.hp>0){owner.hp--;showNotice(owner.hp===0?'ZOMBI ELIMINADO':'IMPACTO: 1 / 2');if(owner.hp===0){scene.remove(owner.model);updateHud()}}}
 gunMount.position.z=.07;setTimeout(()=>{gunMount.position.z=0},90);
}
renderer.domElement.addEventListener('mousedown',e=>{if(e.button===0)shoot()}); // mousedown = 1 disparo por clic; no bucle de fuego.
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
 if(state==='playing'){
  const forward=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));const right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));const move=new THREE.Vector3();
  if(keys.has('KeyW'))move.add(forward);if(keys.has('KeyS'))move.sub(forward);if(keys.has('KeyD'))move.add(right);if(keys.has('KeyA'))move.sub(right);
  if(move.lengthSq()>0){move.normalize().multiplyScalar(player.speed*dt);if(!collides(player.pos.x+move.x,player.pos.z))player.pos.x+=move.x;if(!collides(player.pos.x,player.pos.z+move.z))player.pos.z+=move.z}
  camera.position.copy(player.pos);camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
  for(const z of zombies){if(z.hp<=0)continue;const delta=new THREE.Vector3(player.pos.x-z.model.position.x,0,player.pos.z-z.model.position.z);const distance=delta.length();if(distance<z.range)z.active=true;
   if(z.active&&distance>.72){delta.normalize();const nx=z.model.position.x+delta.x*z.speed*dt,nz=z.model.position.z+delta.z*z.speed*dt;if(!collides(nx,z.model.position.z,.3))z.model.position.x=nx;if(!collides(z.model.position.x,nz,.3))z.model.position.z=nz;z.model.rotation.y=Math.atan2(-delta.x,-delta.z)}
   if(distance<.85){finish(false);break}
  }
  for(const c of crates)if(!c.taken&&Math.hypot(c.mesh.position.x-player.pos.x,c.mesh.position.z-player.pos.z)<1.5){c.taken=true;c.mesh.visible=false;ammo[0]+=6;ammo[1]+=9;showNotice('SUMINISTROS: +6 PISTOLA / +9 RIFLE');updateHud()}
  if(state==='playing'&&Math.hypot(player.pos.x,player.pos.z+113)<3.7)finish(true);
  if(performance.now()-lastNotice>2600)ui.notice.textContent='';
 }
 renderer.render(scene,camera);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
// Estado inicial: escena visible detrás del menú.
camera.position.copy(player.pos);animate();
