import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 10;
camera.position.z = 20;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 20, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Cubes
const cubes = new THREE.Group();
scene.add(cubes);

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

for (let i = 0; i < 20; i++) {
    const boxMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    const cube = new THREE.Mesh(boxGeometry, boxMaterial);
    cube.position.set(
        Math.random() * 50 - 25,
        Math.random() * 10 + 0.5,
        Math.random() * 50 - 25
    );
    cube.castShadow = true;
    cube.receiveShadow = true;
    cubes.add(cube);
}

// Player
const player = {
    height: 1.8,
    speed: 0.1,
    turnSpeed: 0.05,
    jumpHeight: 0.5,
    velocity: new THREE.Vector3(),
    onGround: false
};

camera.position.y = player.height;

// Controls
const controls = new PointerLockControls(camera, renderer.domElement);
document.addEventListener('click', () => {
    controls.lock();
});

const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Raycaster for block interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return;

    mouse.x = 0; // Center of the screen
    mouse.y = 0; // Center of the screen

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubes.children);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (event.button === 0) { // Left click to destroy
            if (intersect.object !== ground) {
                cubes.remove(intersect.object);
            }
        } else if (event.button === 2) { // Right click to place
            const newCube = new THREE.Mesh(boxGeometry, new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }));
            newCube.position.copy(intersect.object.position).add(intersect.face.normal);
            newCube.castShadow = true;
            newCube.receiveShadow = true;
            cubes.add(newCube);
        }
    }
});


function update() {
    if (controls.isLocked) {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        if (keys['KeyW']) {
            controls.moveForward(player.speed);
        }
        if (keys['KeyS']) {
            controls.moveForward(-player.speed);
        }
        if (keys['KeyA']) {
            controls.moveRight(-player.speed);
        }
        if (keys['KeyD']) {
            controls.moveRight(player.speed);
        }
        if (keys['Space'] && player.onGround) {
            player.velocity.y = player.jumpHeight;
            player.onGround = false;
        }
    }

    // Gravity
    player.velocity.y -= 0.01;
    camera.position.y += player.velocity.y;

    // Collision detection
    if (camera.position.y < player.height) {
        camera.position.y = player.height;
        player.velocity.y = 0;
        player.onGround = true;
    }
}


function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
