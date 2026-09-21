// Escena y Renderizador 3D
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.2; // Aumenta la exposición de luz
container.appendChild(renderer.domElement);

// Controles de Cámara
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 180;
controls.minDistance = 10;
camera.position.set(0, 35, 60);
controls.update();

// --- POSTPROCESAMIENTO DE RESPLANDOR (BLOOM ULTRA BRILLO) ---
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.28,  // Fuerza del brillo (Bloom Strength)
  0.4,  // Radio de esparcimiento de luz (Radius)
  0.001  // Umbral de activación (Threshold muy bajo = Todo brilla más)
);

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Textura de Puntos de Luz Radiantes
function createGlowTexture() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 128;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 235, 150, 0.9)');
  gradient.addColorStop(0.8, 'rgba(255, 200, 50, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

const glowTexture = createGlowTexture();

// 1. ESTRELLAS MASIVAS DE ALTO CONTRASTE (35,000 PUNTOS DE LUZ)
const galaxyStarsCount = 35000;
const galaxyStarsGeometry = new THREE.BufferGeometry();
const galaxyStarPositions = new Float32Array(galaxyStarsCount * 3);
const galaxyStarColors = new Float32Array(galaxyStarsCount * 3);

for (let i = 0; i < galaxyStarsCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.pow(Math.random(), 0.4) * 90 + 1.2; 
  const height = (Math.random() - 0.5) * 16;

  galaxyStarPositions[i * 3] = Math.cos(angle) * radius;
  galaxyStarPositions[i * 3 + 1] = height;
  galaxyStarPositions[i * 3 + 2] = Math.sin(angle) * radius;

  const randColor = Math.random();
  if (randColor > 0.82) {
    // Morado neón vibrante
    galaxyStarColors[i * 3] = 1.0;
    galaxyStarColors[i * 3 + 1] = 0.3;
    galaxyStarColors[i * 3 + 2] = 1.0;
  } else if (randColor > 0.60) {
    // Amarillo dorado resplandeciente
    galaxyStarColors[i * 3] = 1.0;
    galaxyStarColors[i * 3 + 1] = 1.0;
    galaxyStarColors[i * 3 + 2] = 0.2;
  } else {
    // Blanco hiper puro
    galaxyStarColors[i * 3] = 1.2;
    galaxyStarColors[i * 3 + 1] = 1.2;
    galaxyStarColors[i * 3 + 2] = 1.2;
  }
}

galaxyStarsGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyStarPositions, 3));
galaxyStarsGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyStarColors, 3));

const galaxyStarsMaterial = new THREE.PointsMaterial({
  size: 0.95,
  map: glowTexture,
  transparent: true,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const galaxyStarField = new THREE.Points(galaxyStarsGeometry, galaxyStarsMaterial);
scene.add(galaxyStarField);

// 2. ANILLO CENTRAL Y NÚCLEO CON HIPER-CONTRASTE
const ringGroup = new THREE.Group();

// Anillo Dorado Neón
const ringGeometry = new THREE.RingGeometry(6.2, 11.5, 128);
const ringMaterial = new THREE.MeshBasicMaterial({
  color: 0xffea00,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 1.0,
  blending: THREE.AdditiveBlending
});
const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
ringMesh.rotation.x = Math.PI / 2;
ringGroup.add(ringMesh);

// Halo Blanco Interno para Efecto Incandescente
const haloGeometry = new THREE.RingGeometry(5.5, 12.8, 128);
const haloMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});
const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
haloMesh.rotation.x = Math.PI / 2;
ringGroup.add(haloMesh);

// Agujero Negro Absoluto en el Centro
const coreGeo = new THREE.SphereGeometry(6.0, 32, 32);
const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const coreMesh = new THREE.Mesh(coreGeo, coreMat);
ringGroup.add(coreMesh);

scene.add(ringGroup);

// 3. TEXTURAS PARA TEXTO NEÓN MORADO BRILLANTE
function createPurpleTextTexture(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'Bold 42px "Caveat", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Resplandor violáceo neón intenso
  ctx.shadowColor = '#e087ff';
  ctx.shadowBlur = 25;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return new THREE.CanvasTexture(canvas);
}

// 4. TEXTURA PARA RAMOS DE GIRASOLES
function createSunflowerTexture() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 128;

  ctx.font = '95px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌻', 64, 64);

  return new THREE.CanvasTexture(canvas);
}

const sunflowerTexture = createSunflowerTexture();

const phrases = [
  "Eres pura alegría",
  "Luz en mi vida",
  "Alegras mis días",
  "Flores para ti",
  "Un detalle amarillo",
  "Eres muy especial",
  "Atesoro tu compañía",
  "Siempre sonríe",
  "Mi persona favorita",
  "Pasar más días así"
];

// 5. FRASES Y GIRASOLES INTERACTIVOS EN LA GALAXIA
const galaxyGroup = new THREE.Group();
const totalElements = 52;

for (let i = 0; i < totalElements; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 13 + Math.random() * 50;
  const height = (Math.random() - 0.5) * 15;

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  if (i % 2 === 0) {
    const mat = new THREE.SpriteMaterial({ map: sunflowerTexture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, height, z);
    sprite.scale.set(5.0, 5.0, 1);
    galaxyGroup.add(sprite);
  } else {
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const textTex = createPurpleTextTexture(phrase);
    const mat = new THREE.SpriteMaterial({ 
      map: textTex, 
      transparent: true,
      blending: THREE.AdditiveBlending 
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, height, z);
    sprite.scale.set(12, 3.2, 1);
    galaxyGroup.add(sprite);
  }
}

scene.add(galaxyGroup);

// 6. BUCLE DE ANIMACIÓN
function animate() {
  requestAnimationFrame(animate);

  galaxyGroup.rotation.y += 0.0012;
  galaxyStarField.rotation.y += 0.0008;
  ringGroup.rotation.z += 0.001;

  controls.update();
  composer.render(); // Renderiza usando el pase Bloom de ultra resplandor
}

animate();

// Ajuste Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});