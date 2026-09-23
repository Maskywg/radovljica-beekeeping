/**
 * Radovljica & Honey Curation - Interactive Experience
 * Features:
 * 1. Three.js 3D Realistic Bee Swarm Animation with Flower Pollination Trajectories
 * 2. Web Audio API Procedural Bee Buzzing Synthesizer (Realistic Wing Frequencies ~180-240Hz)
 * 3. Interactive Leaflet Map for Radovljica Beekeeping Trail
 * 4. Audio Playback Control & Visualizer
 */

document.addEventListener('DOMContentLoaded', () => {
  initThreeBeeAnimation();
  initAudioSynthesizer();
  initLeafletMap();
  initMobileNav();
});

/* ==========================================================================
   1. THREE.JS 3D BEE SIMULATION
   Creates detailed 3D animated bees flying through a 3D coordinate space with
   fluttering wings, hovering, and drifting around the viewport.
   ========================================================================== */
function initThreeBeeAnimation() {
  const canvas = document.getElementById('bee-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 25;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xfff3d6, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffe28a, 1.8);
  dirLight.position.set(20, 40, 20);
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0xdca236, 1.5, 50);
  pointLight.position.set(0, 5, 10);
  scene.add(pointLight);

  // Bee Materials
  const thoraxMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a2e12,
    roughness: 0.8,
    metalness: 0.1
  });

  const abdomenMaterial = new THREE.MeshStandardMaterial({
    color: 0xe59c1b,
    roughness: 0.5,
    metalness: 0.15
  });

  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f1408,
    roughness: 0.7
  });

  const wingMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.92,
    opacity: 0.85,
    transparent: true,
    roughness: 0.1,
    ior: 1.45,
    side: THREE.DoubleSide
  });

  // Bee Creation Helper
  function createBeeMesh() {
    const beeGroup = new THREE.Group();

    // 1. Thorax (胸部)
    const thoraxGeo = new THREE.SphereGeometry(0.7, 16, 16);
    thoraxGeo.scale(1, 0.9, 1.1);
    const thorax = new THREE.Mesh(thoraxGeo, thoraxMaterial);
    beeGroup.add(thorax);

    // 2. Head (頭部)
    const headGeo = new THREE.SphereGeometry(0.45, 12, 12);
    const head = new THREE.Mesh(headGeo, thoraxMaterial);
    head.position.set(0, -0.1, 1.0);
    beeGroup.add(head);

    // 3. Eyes (黑曜複眼)
    const eyeGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0502, roughness: 0.2 });
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.28, 0.1, 1.15);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(-0.28, 0.1, 1.15);
    beeGroup.add(eyeL, eyeR);

    // 4. Abdomen (條紋腹部)
    const abdomenGroup = new THREE.Group();
    const abdoBaseGeo = new THREE.ConeGeometry(0.68, 1.7, 16);
    abdoBaseGeo.rotateX(Math.PI);
    const abdoBase = new THREE.Mesh(abdoBaseGeo, abdomenMaterial);
    abdomenGroup.add(abdoBase);

    // 黑黃條紋環
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.CylinderGeometry(0.65 - i * 0.12, 0.68 - i * 0.12, 0.22, 16);
      const ring = new THREE.Mesh(ringGeo, stripeMaterial);
      ring.position.y = 0.35 - i * 0.45;
      abdomenGroup.add(ring);
    }

    abdomenGroup.position.set(0, -0.2, -1.3);
    abdomenGroup.rotation.x = -0.2;
    beeGroup.add(abdomenGroup);

    // 5. Wings (透明雙翼)
    const wingGeo = new THREE.PlaneGeometry(0.75, 1.6);
    wingGeo.translate(0, 0.8, 0);

    const leftWing = new THREE.Mesh(wingGeo, wingMaterial);
    leftWing.position.set(0.5, 0.55, 0.1);
    leftWing.rotation.set(Math.PI / 2, -0.2, 0.6);

    const rightWing = new THREE.Mesh(wingGeo, wingMaterial);
    rightWing.position.set(-0.5, 0.55, 0.1);
    rightWing.rotation.set(Math.PI / 2, 0.2, -0.6);

    beeGroup.add(leftWing);
    beeGroup.add(rightWing);

    return {
      group: beeGroup,
      leftWing: leftWing,
      rightWing: rightWing,
      baseScale: 0.6 + Math.random() * 0.45,
      speed: 0.02 + Math.random() * 0.03,
      angle: Math.random() * Math.PI * 2,
      radiusX: 7 + Math.random() * 8,
      radiusY: 4 + Math.random() * 4,
      radiusZ: 4 + Math.random() * 5,
      hoverOffset: Math.random() * 10,
      centerOffset: new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      )
    };
  }

  // Create Swarm
  const bees = [];
  const beeCount = 12;
  for (let i = 0; i < beeCount; i++) {
    const bee = createBeeMesh();
    bee.group.scale.set(bee.baseScale, bee.baseScale, bee.baseScale);
    scene.add(bee.group);
    bees.push(bee);
  }

  // Golden Pollen Particles
  const pollenCount = 120;
  const pollenGeo = new THREE.BufferGeometry();
  const pollenPositions = new Float32Array(pollenCount * 3);
  for (let i = 0; i < pollenCount * 3; i += 3) {
    pollenPositions[i] = (Math.random() - 0.5) * 40;
    pollenPositions[i + 1] = (Math.random() - 0.5) * 30;
    pollenPositions[i + 2] = (Math.random() - 0.5) * 25;
  }
  pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPositions, 3));

  const pollenMat = new THREE.PointsMaterial({
    color: 0xffd154,
    size: 0.25,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  const pollenParticles = new THREE.Points(pollenGeo, pollenMat);
  scene.add(pollenParticles);

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 4;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 3;
  });

  // Animation Loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Animate Pollen
    pollenParticles.rotation.y = time * 0.04;
    pollenParticles.rotation.x = time * 0.02;

    // Animate Each Bee
    bees.forEach((bee, idx) => {
      // Flap wings rapidly (mimic 200 Hz wing beats)
      const wingFlap = Math.sin(time * 55 + idx) * 0.65;
      bee.leftWing.rotation.z = 0.6 + wingFlap;
      bee.rightWing.rotation.z = -0.6 - wingFlap;

      // Flight trajectory: Lissajous curve + subtle noise
      bee.angle += bee.speed * 0.7;
      const targetX = bee.centerOffset.x + Math.sin(bee.angle) * bee.radiusX + mouseX * 0.8;
      const targetY = bee.centerOffset.y + Math.cos(bee.angle * 1.5 + bee.hoverOffset) * bee.radiusY + Math.sin(time * 3 + idx) * 0.4 + mouseY * 0.5;
      const targetZ = bee.centerOffset.z + Math.sin(bee.angle * 0.7) * bee.radiusZ;

      // Look at direction of movement
      const oldPos = bee.group.position.clone();
      bee.group.position.set(targetX, targetY, targetZ);

      const delta = bee.group.position.clone().sub(oldPos);
      if (delta.lengthSq() > 0.0001) {
        const targetRot = Math.atan2(delta.x, delta.z);
        bee.group.rotation.y = targetRot + Math.PI;
        bee.group.rotation.x = -delta.y * 2;
        bee.group.rotation.z = -delta.x * 1.5;
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ==========================================================================
   2. WEB AUDIO API - PROCEDURAL BEE BUZZING SYNTHESIZER
   Simulates authentic honey bee wing buzz (fundamental frequency 190Hz ~ 240Hz
   with rich harmonics, slight FM vibrato, and stereo spatial panning).
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let beeAudioNodes = [];

function initAudioSynthesizer() {
  const soundBtns = [document.getElementById('nav-sound-toggle'), document.getElementById('hero-sound-toggle'), document.getElementById('box-sound-toggle')];

  soundBtns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', toggleBeeAudio);
  });
}

function toggleBeeAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (!isAudioPlaying) {
    startBeeBuzz();
    isAudioPlaying = true;
    updateAudioUI(true);
  } else {
    stopBeeBuzz();
    isAudioPlaying = false;
    updateAudioUI(false);
  }
}

function startBeeBuzz() {
  if (!audioCtx) return;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.28, audioCtx.currentTime + 1.2);
  masterGain.connect(audioCtx.destination);

  // Multi-voice buzzing to emulate a busy apiary / hive
  const voices = [
    { freq: 205, gain: 0.35, detune: 0 },
    { freq: 218, gain: 0.3, detune: 7 },
    { freq: 195, gain: 0.25, detune: -5 },
    { freq: 410, gain: 0.12, detune: 2 }, // 2nd harmonic
    { freq: 615, gain: 0.08, detune: -4 } // 3rd harmonic
  ];

  beeAudioNodes = voices.map(v => {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth'; // Sawtooth waveform has organic wing buzz timbre
    osc.frequency.setValueAtTime(v.freq, audioCtx.currentTime);
    osc.detune.setValueAtTime(v.detune, audioCtx.currentTime);

    // Lowpass filter to soften the harshness into warm natural buzzing
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, audioCtx.currentTime);

    // LFO for wing fluttering rate fluctuation (15-20Hz)
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.setValueAtTime(14 + Math.random() * 8, audioCtx.currentTime);
    lfoGain.gain.setValueAtTime(18, audioCtx.currentTime);
    lfo.connect(osc.frequency);
    lfo.start();

    // Voice Gain
    const vGain = audioCtx.createGain();
    vGain.gain.setValueAtTime(v.gain, audioCtx.currentTime);

    osc.connect(filter);
    filter.connect(vGain);
    vGain.connect(masterGain);
    osc.start();

    return { osc, lfo, masterGain };
  });
}

function stopBeeBuzz() {
  if (!audioCtx || beeAudioNodes.length === 0) return;
  
  beeAudioNodes.forEach(node => {
    node.masterGain.gain.setValueAtTime(node.masterGain.gain.value, audioCtx.currentTime);
    node.masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
    setTimeout(() => {
      try {
        node.osc.stop();
        node.lfo.stop();
      } catch (e) {}
    }, 700);
  });
  beeAudioNodes = [];
}

function updateAudioUI(playing) {
  const btns = [document.getElementById('nav-sound-toggle'), document.getElementById('hero-sound-toggle'), document.getElementById('box-sound-toggle')];
  const sensoryBox = document.querySelector('.sensory-interactive');

  btns.forEach(btn => {
    if (!btn) return;
    if (playing) {
      btn.classList.add('playing');
      btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> 蜜蜂振翅聲（播放中）';
    } else {
      btn.classList.remove('playing');
      btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> 蜜蜂飛行原音';
    }
  });

  if (sensoryBox) {
    if (playing) sensoryBox.classList.add('playing');
    else sensoryBox.classList.remove('playing');
  }
}

/* ==========================================================================
   3. LEAFLET INTERACTIVE MAP - RADOVLJICA BEEKEEPING TRAIL
   ========================================================================== */
function initLeafletMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // Make sure Leaflet is available
  if (typeof L === 'undefined') {
    console.warn('Leaflet is not loaded yet, retrying...');
    setTimeout(initLeafletMap, 300);
    return;
  }

  // Radovljica Old Town Center coordinates
  const radovljicaCoords = [46.3444, 14.1750];
  const map = L.map('map', {
    center: radovljicaCoords,
    zoom: 15,
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: false
  });

  // Esri World Topo Map (Clear Alpine terrain, zero API key watermarks)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18
  }).addTo(map);

  // Force Leaflet to recalculate container size
  setTimeout(() => {
    map.invalidateSize();
  }, 400);

  window.addEventListener('resize', () => {
    map.invalidateSize();
  });

  // Trigger resize when scrolling into view
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          map.invalidateSize();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(mapElement);
  }

  // Custom Gold Honey Marker Icon
  const createHoneyIcon = (iconClass) => L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background: #be7d22; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #fff;"><i class="${iconClass}" style="font-size: 15px;"></i></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });

  const locations = [
    {
      id: 'poi-museum',
      name: '養蜂博物館 (Čebelarski muzej)',
      coords: [46.3442, 14.1748],
      icon: 'fa-solid fa-building-columns',
      desc: '位於拉多夫利察巴洛克宮殿內，珍藏數千件彩繪蜂箱板原件與安東·揚夏手稿。',
      address: 'Linhartov trg 1, 4240 Radovljica'
    },
    {
      id: 'poi-lectar',
      name: '百年愛心薑餅工坊 (Lectarstvo)',
      coords: [46.3440, 14.1742],
      icon: 'fa-solid fa-heart',
      desc: '自 1766 年營運至今，親手製作融入純蜂蜜與愛心鏡面的斯洛維尼亞國寶薑餅。',
      address: 'Linhartov trg 2, 4240 Radovljica'
    },
    {
      id: 'poi-square',
      name: '林哈特廣場 (Linhartov trg)',
      coords: [46.3445, 14.1746],
      icon: 'fa-solid fa-tree-city',
      desc: '保存完整的中世紀古城心臟，每年四月在此舉辦斯洛維尼亞盛大巧克力與蜂蜜節。',
      address: 'Linhartov trg, 4240 Radovljica'
    },
    {
      id: 'poi-viewpoint',
      name: '薩瓦河谷眺望點 (Sava River Viewpoint)',
      coords: [46.3435, 14.1738],
      icon: 'fa-solid fa-mountain-sun',
      desc: '俯瞰薩瓦河谷與朱利安阿爾卑斯山，是山地採集冷杉蜜與百花蜜的天然生態帶。',
      address: 'Radovljica South Rampart'
    },
    {
      id: 'poi-jansa',
      name: '安東揚夏紀念蜂房 (Breznica Apiary)',
      coords: [46.3888, 14.1610],
      icon: 'fa-solid fa-hive',
      desc: '世界蜜蜂日之父安東·揚夏的出生故居與復刻古典木雕彩繪蜂房。',
      address: 'Breznica, Žirovnica'
    }
  ];

  const markers = {};

  locations.forEach(loc => {
    const marker = L.marker(loc.coords, { icon: createHoneyIcon(loc.icon) }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; padding: 4px;">
        <h4 style="margin: 0 0 6px 0; color: #42250e; font-size: 15px;">${loc.name}</h4>
        <p style="margin: 0 0 6px 0; color: #6d4e30; font-size: 13px; line-height: 1.5;">${loc.desc}</p>
        <span style="font-size: 11px; color: #be7d22; font-weight: bold;"><i class="fa-solid fa-location-dot"></i> ${loc.address}</span>
      </div>
    `);
    markers[loc.id] = marker;
  });

  // Connect Sidebar Item Click
  const poiItems = document.querySelectorAll('.poi-item');
  poiItems.forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const loc = locations.find(l => l.id === id);
      if (loc && markers[id]) {
        poiItems.forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        map.flyTo(loc.coords, 16, { duration: 1.2 });
        markers[id].openPopup();
      }
    });
  });
}

/* ==========================================================================
   4. MOBILE NAVIGATION TOGGLE
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      if (navLinks.classList.contains('open')) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '74px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = '#fefbf3';
        navLinks.style.padding = '1.5rem';
        navLinks.style.borderBottom = '1px solid #e8c067';
      } else {
        navLinks.style.display = '';
      }
    });
  }
}
