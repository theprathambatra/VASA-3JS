import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createVasaBottleModel } from './createVasaBottleModel';

const canvas = document.querySelector<HTMLCanvasElement>('#viewer')!;
const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.42;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(new RoomEnvironment(),0.06).texture;

scene.add(new THREE.HemisphereLight(0xffffff,0xe0bca8,1.55));
function area(x:number,y:number,z:number,color:number,intensity:number) {
  const light=new THREE.DirectionalLight(color,intensity);
  light.position.set(x,y,z);scene.add(light);return light;
}
area(-4.4,7.0,7.3,0xffffff,2.65);
area(4.2,4.7,1.0,0xffece0,1.35);
area(0.5,5.5,-4.0,0xffffff,2.4);

const model=createVasaBottleModel();scene.add(model.root);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),
  new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.98,transparent:true,opacity:0.01}));
ground.rotation.x=-Math.PI/2;ground.position.y=-0.01;scene.add(ground);

// The reference has a broad, soft contact shadow rather than a hard cast silhouette.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;
const sx=shadowCanvas.getContext('2d')!;
const rg=sx.createRadialGradient(128,128,4,128,128,125);
rg.addColorStop(0,'rgba(104,70,60,.27)');rg.addColorStop(.35,'rgba(120,84,74,.13)');
rg.addColorStop(1,'rgba(120,84,74,0)');sx.fillStyle=rg;sx.fillRect(0,0,256,256);
const shTex=new THREE.CanvasTexture(shadowCanvas);
const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.35,1.65),
  new THREE.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false,opacity:0.48}));
shadow.rotation.x=-Math.PI/2;shadow.position.set(.20,.008,-.08);scene.add(shadow);

const camera=new THREE.PerspectiveCamera(34,1,.1,70);
const controls=new OrbitControls(camera,canvas);
controls.target.set(0,1.45,0);
controls.enableDamping=true;controls.dampingFactor=.075;
controls.enablePan=false;
controls.minDistance=3.5;controls.maxDistance=8;
controls.minPolarAngle=.52;controls.maxPolarAngle=Math.PI-.42;
controls.rotateSpeed=.73;
controls.zoomSpeed=.75;
camera.position.set(.16,1.62,6.15);
controls.update();

let targetOrbit:THREE.Spherical|null=null;
let capOpen=false;
let spinning=false;
let restoreSpin=false;
const viewPositions:Record<string,THREE.Vector3>={
  front:new THREE.Vector3(.16,1.62,6.15),
  side:new THREE.Vector3(6.15,1.62,.12),
  back:new THREE.Vector3(.12,1.62,-6.15),
};
const state=document.querySelector<HTMLElement>('#status')!;
const buttons=[...document.querySelectorAll<HTMLButtonElement>('[data-view]')];
function selectView(view:string) {
  if(!viewPositions[view])return;
  const distance=THREE.MathUtils.clamp(camera.position.distanceTo(controls.target),4.0,7.0);
  targetOrbit=new THREE.Spherical().setFromVector3(viewPositions[view].clone().sub(controls.target));
  targetOrbit.radius=distance;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  state.textContent=`${view.toUpperCase()} VIEW`;
  controls.autoRotate=false;
  spinning=false;
  document.querySelector('#spin')?.setAttribute('aria-pressed','false');
}
buttons.forEach(b=>b.addEventListener('click',()=>selectView(b.dataset.view!)));
canvas.addEventListener('pointerdown',()=>{
  targetOrbit=null;
  buttons.forEach(b=>b.setAttribute('aria-pressed','false'));
  state.textContent='FREE ORBIT';
});
canvas.addEventListener('wheel',()=>targetOrbit=null,{passive:true});

const capButton=document.querySelector<HTMLButtonElement>('#cap')!;
function toggleCap() {
  capOpen=!capOpen;
  capButton.setAttribute('aria-pressed',String(capOpen));
  capButton.textContent=capOpen?'Replace cap':'Lift cap';
  // Keep the raised cap inside the viewport at every angle.
  targetOrbit=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  targetOrbit.radius=capOpen?7.2:6.15;
}
capButton.addEventListener('click',toggleCap);
const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
canvas.addEventListener('click',e=>{
  const rect=canvas.getBoundingClientRect();
  pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects([model.parts['tapered wooden cap']],true);
  if(hit.length)toggleCap();
});

const spinButton=document.querySelector<HTMLButtonElement>('#spin')!;
spinButton.addEventListener('click',()=>{
  spinning=!spinning;
  spinButton.setAttribute('aria-pressed',String(spinning));
  controls.autoRotate=spinning;controls.autoRotateSpeed=.75;
  targetOrbit=null;
  buttons.forEach(b=>b.setAttribute('aria-pressed','false'));
  state.textContent=spinning?'TURNTABLE':'FREE ORBIT';
});

function resize(){
  const w=window.innerWidth,h=window.innerHeight;
  renderer.setSize(w,h,false);camera.aspect=w/h;
  const narrow=w<700;
  camera.fov=narrow?46:34;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);resize();
const clock=new THREE.Clock();
function frame(){
  requestAnimationFrame(frame);
  const dt=Math.min(clock.getDelta(),.06);
  if(targetOrbit){
    const orbit=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    const factor=1-Math.pow(.004,dt);
    let delta=((targetOrbit.theta-orbit.theta+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
    orbit.theta+=delta*factor;
    orbit.phi=THREE.MathUtils.lerp(orbit.phi,targetOrbit.phi,factor);
    orbit.radius=THREE.MathUtils.lerp(orbit.radius,targetOrbit.radius,factor);
    camera.position.setFromSpherical(orbit).add(controls.target);
    if(Math.abs(delta)<.003 && Math.abs(orbit.radius-targetOrbit.radius)<.003)targetOrbit=null;
  }
  const capY=2.055+(capOpen?.44:0);
  model.capPivot.position.y=THREE.MathUtils.damp(model.capPivot.position.y,capY,5.0,dt);
  model.capPivot.rotation.y=THREE.MathUtils.damp(model.capPivot.rotation.y,capOpen?.09:0,4,dt);
  controls.update();
  renderer.render(scene,camera);
}
frame();

document.addEventListener('visibilitychange',()=>{
  if(document.hidden){restoreSpin=spinning;controls.autoRotate=false;}
  else if(restoreSpin){controls.autoRotate=true;restoreSpin=false;}
});
window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(key==='1')selectView('front');
  if(key==='2')selectView('side');
  if(key==='3')selectView('back');
  if(key==='c')toggleCap();
});
(window as any).vasaScene={scene,camera,model,selectView,toggleCap};
