// 1. Escena, cámara y renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.7 / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
document.getElementById('3d-view').appendChild(renderer.domElement);

// 2. Luz para mejor visualización
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 3. Modelo de Antena/PTZ
const createAntenna = () => {
  const group = new THREE.Group();

  // Base (pan)
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 1, 32),
    new THREE.MeshPhongMaterial({ color: 0x555555 })
  );
  base.rotation.x = Math.PI / 2;
  group.add(base);

  // Soporte vertical (tilt)
  const support = new THREE.Mesh(
    new THREE.BoxGeometry(1, 5, 1),
    new THREE.MeshPhongMaterial({ color: 0x888888 })
  );
  support.position.y = 2.5;
  group.add(support);

  // Antena/cámara (plato parabólico o cámara)
  const antenna = new THREE.Mesh(
    new THREE.ParametricGeometry((u, v, target) => {
      u = u * Math.PI;
      v = v * 2 * Math.PI;
      const radius = 3;
      target.set(
        Math.sin(u) * Math.cos(v) * radius,
        Math.cos(u) * radius + 6,
        Math.sin(u) * Math.sin(v) * radius
      );
    }, 32, 32),
    new THREE.MeshPhongMaterial({ 
      color: 0x4CAF50,
      side: THREE.DoubleSide,
      wireframe: false 
    })
  );
  group.add(antenna);

  return group;
};

const antenna = createAntenna();
scene.add(antenna);

camera.position.set(0, 10, 15);
camera.lookAt(0, 5, 0);

// 4. Joystick para Pan/Tilt
const joystick = nipplejs.create({
  zone: document.getElementById('joystick'),
  mode: 'static',
  position: { left: '50%', top: '50%' },
  color: '#4CAF50'
});

joystick.on('move', (evt, data) => {
  const speed = 0.03;
  antenna.rotation.y -= data.vector.x * speed; // Pan (horizontal)
  antenna.children[2].rotation.x = THREE.MathUtils.clamp(
    antenna.children[2].rotation.x + data.vector.y * speed,
    -Math.PI / 4,
    Math.PI / 4
  ); // Tilt (vertical, con límites)
  updateSliders();
});

// 5. Sliders para control manual
const panSlider = document.getElementById('x-axis');
const tiltSlider = document.getElementById('y-axis');
const zoomSlider = document.getElementById('z-axis');

panSlider.addEventListener('input', () => {
  antenna.rotation.y = (parseInt(panSlider.value) - 180) * (Math.PI / 180);
});

tiltSlider.addEventListener('input', () => {
  antenna.children[2].rotation.x = (parseInt(tiltSlider.value) - 90) * (Math.PI / 180);
});

zoomSlider.addEventListener('input', () => {
  camera.fov = 100 - parseInt(zoomSlider.value);
  camera.updateProjectionMatrix();
});

function updateSliders() {
  panSlider.value = (antenna.rotation.y * (180 / Math.PI)) + 180;
  tiltSlider.value = (antenna.children[2].rotation.x * (180 / Math.PI)) + 90;
}

// 6. Botones de acción
document.getElementById('btn-home').addEventListener('click', () => {
  antenna.rotation.set(0, 0, 0);
  antenna.children[2].rotation.set(0, 0, 0);
  updateSliders();
});

// 7. Animación
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 8. Ajuste responsive
window.addEventListener('resize', () => {
  camera.aspect = (window.innerWidth * 0.7) / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
});
