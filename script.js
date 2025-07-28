// 1. Configuración de Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth * 0.7 / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
document.getElementById('3d-view').appendChild(renderer.domElement);

// 2. Modelo 3D del brazo robótico (simplificado)
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(5, 5, 2, 32),
  new THREE.MeshBasicMaterial({ color: 0x888888 })
);
scene.add(base);

const arm = new THREE.Mesh(
  new THREE.BoxGeometry(1, 10, 1),
  new THREE.MeshBasicMaterial({ color: 0x4CAF50 })
);
arm.position.y = 5;
scene.add(arm);

camera.position.z = 30;
camera.position.y = 10;

// 3. Joystick Virtual (nippleJS)
const joystick = nipplejs.create({
  zone: document.getElementById('joystick'),
  mode: 'static',
  position: { left: '50%', top: '50%' },
  color: '#4CAF50'
});

joystick.on('move', (evt, data) => {
  const speed = 0.1;
  arm.position.x += data.vector.x * speed;
  arm.position.y -= data.vector.y * speed;
  updateSliders();
});

// 4. Sliders para controlar ejes
const xSlider = document.getElementById('x-axis');
const ySlider = document.getElementById('y-axis');
const zSlider = document.getElementById('z-axis');

[xSlider, ySlider, zSlider].forEach(slider => {
  slider.addEventListener('input', () => {
    arm.position.x = parseInt(xSlider.value) - 100;
    arm.position.y = parseInt(ySlider.value) - 100;
    arm.position.z = parseInt(zSlider.value) - 50;
  });
});

function updateSliders() {
  xSlider.value = arm.position.x + 100;
  ySlider.value = arm.position.y + 100;
  zSlider.value = arm.position.z + 50;
}

// 5. Botones de acción
document.getElementById('btn-home').addEventListener('click', () => {
  arm.position.set(0, 5, 0);
  updateSliders();
});

document.getElementById('btn-stop').addEventListener('click', () => {
  alert("Movimiento detenido");
});

// 6. Animación
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
