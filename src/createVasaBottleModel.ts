import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import capTopImage from './assets/cap-top.webp';

/** The dimensions are proportional estimates from the three supplied views, not CAD measurements. */
export function createVasaBottleModel() {
  const root = new THREE.Group();
  root.name = 'VASA | The Sweetest Stranger';
  const parts: Record<string, THREE.Object3D> = {};
  const add = (id: string, object: THREE.Object3D, parent: THREE.Object3D = root) => {
    object.name = id;
    object.userData.partId = id;
    parent.add(object);
    parts[id] = object;
    return object;
  };

  // The liquid sits behind the transparent shell. The lower 22% stays clear, as in the photos.
  const liquid = new THREE.Mesh(
    new RoundedBoxGeometry(1.18, 1.34, 0.925, 6, 0.105),
    new THREE.MeshPhysicalMaterial({
      color: 0xe97156, metalness: 0, roughness: 0.23, transmission: 0.0,
      thickness: 0.28, ior: 1.34, transparent: true, opacity: 0.94,
      clearcoat: 0.24, clearcoatRoughness: 0.1,
    }),
  );
  liquid.position.y = 1.0;
  add('peach perfume fill', liquid);

  const meniscus = new THREE.Mesh(
    new RoundedBoxGeometry(1.16, 0.028, 0.90, 4, 0.012),
    new THREE.MeshPhysicalMaterial({ color: 0xffa18d, roughness: 0.10, transmission: 0.3,
      transparent: true, opacity: 0.65, side: THREE.DoubleSide }),
  );
  meniscus.position.y = 1.672;
  add('liquid meniscus', meniscus);

  const shell = new THREE.Mesh(
    new RoundedBoxGeometry(1.33, 1.78, 1.07, 7, 0.085),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.045, transmission: 0.94,
      thickness: 0.17, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.035,
      envMapIntensity: 1.25, transparent: true, opacity: 0.78,
      depthWrite: false, side: THREE.FrontSide,
    }),
  );
  shell.position.y = 0.90;
  shell.renderOrder = 2;
  add('rounded glass bottle', shell);

  const thickBase = new THREE.Mesh(
    new RoundedBoxGeometry(1.328, 0.225, 1.065, 5, 0.070),
    new THREE.MeshPhysicalMaterial({ color: 0xfff7f2, roughness: 0.055,
      transmission: 0.82, ior: 1.52, thickness: 0.33, clearcoat: 1,
      transparent: true, opacity: 0.65, depthWrite: false, envMapIntensity: 1.0 }),
  );
  thickBase.position.y = 0.155;
  thickBase.renderOrder = 3;
  add('thick clear glass heel', thickBase);

  // A narrow cut line on the glass shoulder catches light and grounds the cylindrical neck.
  const shoulder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.355, 0.365, 0.082, 64),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.035,
      transmission: 0.93, thickness: 0.11, ior: 1.5, transparent: true, opacity: 0.78 }),
  );
  shoulder.position.y = 1.805;
  add('clear glass shoulder', shoulder);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.306, 0.318, 0.210, 64),
    new THREE.MeshPhysicalMaterial({ color: 0xffe9de, roughness: 0.045,
      transmission: 0.82, thickness: 0.10, ior: 1.48, transparent: true, opacity: 0.86 }),
  );
  neck.position.y = 1.908;
  add('glass neck', neck);

  const gold = new THREE.MeshPhysicalMaterial({ color: 0xb98642, metalness: 1,
    roughness: 0.22, clearcoat: 0.45, envMapIntensity: 1.7 });
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.322, 0.322, 0.126, 72), gold);
  collar.position.y = 1.986;
  add('polished gold collar', collar);
  const bandTop = new THREE.Mesh(new THREE.TorusGeometry(0.317, 0.009, 8, 72), gold);
  bandTop.rotation.x = Math.PI / 2;
  bandTop.position.y = 2.049;
  add('collar top seam', bandTop);

  // Only visible during the optional cap lift. Its exact form is inferred from the bottle type.
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.083, 0.103, 0.275, 32),
    new THREE.MeshPhysicalMaterial({ color: 0xe9d9bf, metalness: 0.38, roughness: 0.27 }));
  stem.position.y = 2.154;
  add('inferred atomizer stem', stem);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.137, 0.112, 0.076, 32), gold);
  nozzle.position.y = 2.276;
  add('inferred atomizer button', nozzle);

  const capPivot = add('removable cap pivot', new THREE.Group());
  capPivot.position.y = 2.055;
  const capProfile = [
    [0, 0.00], [0.315, 0.00], [0.345, 0.012], [0.375, 0.037],
    [0.43, 0.115], [0.485, 0.23], [0.540, 0.395],
    [0.585, 0.555], [0.608, 0.715], [0.605, 0.797],
    [0.59, 0.811], [0, 0.812],
  ];
  const cap = new THREE.Mesh(
    new THREE.LatheGeometry(capProfile.map(([r,y]) => new THREE.Vector2(r,y)), 96),
    new THREE.MeshPhysicalMaterial({ map: makeWoodTexture(false), bumpMap: makeWoodTexture(true),
      bumpScale: 0.014, roughness: 0.57, metalness: 0, clearcoat: 0.10,
      clearcoatRoughness: 0.45, envMapIntensity: 0.7, color: 0xb28d62 }),
  );
  cap.castShadow = true;
  add('tapered wooden cap', cap, capPivot);
  // The supplied top-view photograph shows a dark recessed swirl in the wood.
  // Give the flat top its own UV surface so the photographed engraving is not
  // stretched around the lathed side grain. Both textures travel with the cap.
  const capTopColor = new THREE.TextureLoader().load(capTopImage);
  capTopColor.colorSpace = THREE.SRGBColorSpace;
  capTopColor.anisotropy = 8;
  const capTopRelief = new THREE.TextureLoader().load(capTopImage);
  capTopRelief.colorSpace = THREE.NoColorSpace;
  capTopRelief.anisotropy = 8;
  const capTop = new THREE.Mesh(
    new THREE.CircleGeometry(0.589, 128),
    new THREE.MeshPhysicalMaterial({ map: capTopColor, bumpMap: capTopRelief,
      color: 0xb08470, bumpScale: 0.008, roughness: 0.68, metalness: 0, clearcoat: 0.06,
      clearcoatRoughness: 0.8 }),
  );
  capTop.rotation.x = -Math.PI / 2;
  capTop.position.y = 0.815;
  add('engraved wooden cap top', capTop, capPivot);
  const capBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.012, 48),
    new THREE.MeshStandardMaterial({ color: 0x603d27, roughness: 0.85 }));
  capBottom.position.y = -0.006;
  add('cap underside', capBottom, capPivot);

  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.092, 1.060),
    new THREE.MeshBasicMaterial({ map: makeFrontLabel(), transparent: true,
      depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  face.position.set(0.065, 0.970, 0.545);
  face.renderOrder = 6;
  add('front VASA label', face);

  const side = new THREE.Mesh(new THREE.PlaneGeometry(0.70, 1.090),
    new THREE.MeshBasicMaterial({ map: makeSideLabel(), transparent: true,
      depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  side.position.set(0.677, 0.950, 0.015);
  side.rotation.y = Math.PI / 2;
  side.renderOrder = 6;
  add('side inscription label', side);

  // The hierarchy gives consumers access to animation pivots and attachment locations.
  root.userData.sculptRuntime = {
    parts, pivots: { cap: capPivot },
    sockets: { capSeat: new THREE.Vector3(0,2.055,0), base: new THREE.Vector3(0,0,0) },
    approximateDimensions: new THREE.Vector3(1.33,2.867,1.07),
    inferredParts: ['inferred atomizer stem','inferred atomizer button'],
  };
  return { root, parts, capPivot };
}

function makeWoodTexture(height: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const base = ctx.createLinearGradient(0,0,1024,0);
  if (height) {
    base.addColorStop(0,'#868686'); base.addColorStop(1,'#858585');
  } else {
    base.addColorStop(0,'#a76036'); base.addColorStop(.33,'#b96e40');
    base.addColorStop(.63,'#a65c31'); base.addColorStop(1,'#be7646');
  }
  ctx.fillStyle = base; ctx.fillRect(0,0,1024,512);
  let seed = 197707;
  const rand = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  for (let i=0; i<350; i++) {
    const x = rand()*1024, sway=(rand()-.5)*35, width=0.5+rand()*3;
    ctx.strokeStyle = height ? `rgba(${rand()>.5?220:35},${rand()>.5?220:35},${rand()>.5?220:35},${0.12+rand()*.12})`
      : (rand()>.5 ? `rgba(67,28,10,${0.018+rand()*.045})` : `rgba(255,194,116,${0.015+rand()*.045})`);
    ctx.lineWidth=width*.65; ctx.beginPath(); ctx.moveTo(x,-12);
    ctx.bezierCurveTo(x+sway,140,x-sway,340,x+sway*.7,524); ctx.stroke();
  }
  for (let i=0; i<22; i++) {
    let x=rand()*1024,y=rand()*512;
    ctx.strokeStyle=height?'rgba(80,80,80,.18)':'rgba(87,43,19,.08)';
    ctx.lineWidth=1+rand()*2;
    ctx.beginPath(); ctx.ellipse(x,y,15+rand()*40,4+rand()*18,rand()*.4,0,Math.PI*2);ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = height ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function makeFrontLabel() {
  const c = document.createElement('canvas'); c.width=1024; c.height=800;
  const x=c.getContext('2d')!;
  labelPath(x, 16, 14, 1008, 786, 55);
  x.fillStyle='#fff7f3'; x.fill();
  x.lineJoin='round'; x.strokeStyle='#d995ab'; x.lineWidth=17; x.stroke();
  x.save(); x.textAlign='center'; x.fillStyle='#593b3a';
  x.font='italic 89px Georgia, serif'; x.fillText('vāsā',512,178);
  drawEmblem(x,512,258);
  x.fillStyle='#59403e';
  spreadText(x,'THE',512,410,57,16);
  spreadText(x,'SWEETEST',512,500,58,9);
  spreadText(x,'STRANGER',512,586,58,10);
  x.fillStyle='#705457'; x.font='italic 31px Georgia, serif'; x.fillText('50 ml / 1.7 fl oz',512,657);
  x.restore();
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8;
  return t;
}

function makeSideLabel() {
  const c=document.createElement('canvas'); c.width=780;c.height=900;
  const x=c.getContext('2d')!;
  labelPath(x,12,12,768,888,55);x.fillStyle='#fff8f4';x.fill();
  x.strokeStyle='#d895aa';x.lineWidth=14;x.lineJoin='round';x.stroke();
  x.save();x.translate(390,450);x.rotate(-Math.PI/2);
  x.textAlign='center';x.fillStyle='#684948';
  x.font='italic 34px Georgia, serif';
  const lines=['The last hug before goodbye,','when neither of you','wanted to let go first.'];
  lines.forEach((line,i)=>x.fillText(line,0,-44+i*50));
  x.restore();
  x.strokeStyle='#d9a05c';x.lineWidth=7;x.beginPath();x.arc(635,145,24,0,Math.PI*1.7);x.stroke();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
  return t;
}

function labelPath(x: CanvasRenderingContext2D,l:number,t:number,r:number,b:number,cut:number) {
  x.beginPath(); x.moveTo(l+cut,t);x.lineTo(r-15,t);x.quadraticCurveTo(r,t,r,t+15);
  x.lineTo(r,b-15);x.quadraticCurveTo(r,b,r-15,b);x.lineTo(l+cut,b);
  x.lineTo(l,b-cut);x.lineTo(l,t+cut);x.closePath();
}
function spreadText(x:CanvasRenderingContext2D,s:string,cx:number,y:number,size:number,space:number) {
  x.font=`${size}px Georgia, serif`;
  const widths=[...s].map(ch=>x.measureText(ch).width);
  const total=widths.reduce((a,b)=>a+b,0)+(s.length-1)*space;
  let left=cx-total/2;x.textAlign='left';
  [...s].forEach((ch,i)=>{x.fillText(ch,left,y);left+=widths[i]+space;});
}
function drawEmblem(x: CanvasRenderingContext2D,cx:number,cy:number) {
  // A small fan/floral mark in the location of the printed emblem.
  x.strokeStyle='#6c4746';x.lineWidth=5;x.lineCap='round';
  const offsets=[-75,-48,-24,0,24,48,75];
  offsets.forEach((a,i)=>{
    const endX=cx+a*.47,endY=cy-26-Math.cos(a/80*Math.PI/2)*22;
    x.beginPath();x.moveTo(cx,cy+24);
    x.bezierCurveTo(cx+a*.25,cy-12,cx+a*.32,cy-34,endX,endY);
    x.stroke();
  });
  x.beginPath();x.moveTo(cx-58,cy-10);x.quadraticCurveTo(cx-37,cy-32,cx-16,cy-12);
  x.moveTo(cx+58,cy-10);x.quadraticCurveTo(cx+37,cy-32,cx+16,cy-12);x.stroke();
  x.beginPath();x.moveTo(cx-43,cy+3);x.quadraticCurveTo(cx-9,cy-2,cx,cy+30);
  x.quadraticCurveTo(cx+9,cy-2,cx+43,cy+3);x.stroke();
}
