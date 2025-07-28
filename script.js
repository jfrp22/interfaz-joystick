// 1. Configuración de Three.js
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.7 / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
document.getElementById('3d-view').appendChild(renderer.domElement);

// 2. Iluminación
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(5, 10, 5);
scene.add(light1);
scene.add(new THREE.AmbientLight(0x404040));

// 3. Modelo de Antena Parabólica
const createAntenna = () => {
  const group = new THREE.Group();

  // Base (rotación Pan)
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 1, 32),
    new THREE.MeshPhongMaterial({ color: 0x333333 })
  );
  base.rotation.x = Math.PI / 2;
  group.add(base);

  // Soporte (rotación Tilt)
  const support = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 4, 0.5),
    new THREE.MeshPhongMaterial({ color: 0x555555 })
  );
  support.position.y = 2;
  group.add(support);

  // Plato parabólico
  const dishGeometry = new THREE.ParametricGeometry((u, v, target) => {
    u = u * Math.PI * 0.5;
    v = v * Math.PI * 2;
    const radius = 3;
    const depth = 1.5;
    target.set(
      Math.sin(u) * Math.cos(v) * radius,
      Math.cos(u) * depth + 5,
      Math.sin(u) * Math.sin(v) * radius
    );
  }, 32, 32);

  const dish = new THREE.Mesh(
    dishGeometry,
    new THREE.MeshPhongMaterial({ 
      color: 0x4CAF50,
      side: THREE.DoubleSide,
      specular: 0x111111,
      shininess: 50
    })
  );
  dish.position.y = 4;
  dish.rotation.x = -Math.PI / 4;
  group.add(dish);

  return { group, dish };
};

const { group, dish } = createAntenna();
scene.add(group);

camera.position.set(0, 8, 12);
camera.lookAt(0, 4, 0);

// 4. Joystick Virtual
const joystick = nipplejs.create({
  zone: document.getElementById('joystick'),
  mode: 'static',
  position: { left: '50%', top: '50%' },
  color: '#4CAF50'
});

joystick.on('move', (evt, data) => {
  const panSpeed = 0.02;
  const tiltSpeed = 0.01;
  
  // Pan (horizontal)
  group.rotation.y -= data.vector.x * panSpeed;
  
  // Tilt (vertical con límites)
  dish.rotation.x = THREE.MathUtils.clamp(
    dish.rotation.x - data.vector.y * tiltSpeed,
    -Math.PI / 2,
    0
  );
  
  updateUI();
});

// 5. Sliders
const panSlider = document.getElementById('pan');
const tiltSlider = document.getElementById('tilt');

panSlider.addEventListener('input', () => {
  group.rotation.y = (parseInt(panSlider.value) - 180) * (Math.PI / 180);
  updateUI();
});

tiltSlider.addEventListener('input', () => {
  dish.rotation.x = -parseInt(tiltSlider.value) * (Math.PI / 180);
  updateUI();
});

// 6. Actualizar UI
function updateUI() {
  document.getElementById('pan-angle').textContent = `${Math.round((group.rotation.y * (180 / Math.PI) + 180) % 360)}°`;
  document.getElementById('tilt-angle').textContent = `${Math.round(-dish.rotation.x * (180 / Math.PI))}°`;
  panSlider.value = (group.rotation.y * (180 / Math.PI) + 180) % 360;
  tiltSlider.value = -dish.rotation.x * (180 / Math.PI);
}

// 7. Reset
document.getElementById('reset').addEventListener('click', () => {
  group.rotation.y = 0;
  dish.rotation.x = -Math.PI / 4;
  updateUI();
});

// 8. Animación
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 9. Responsive
window.addEventListener('resize', () => {
  camera.aspect = (window.innerWidth * 0.7) / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
});
