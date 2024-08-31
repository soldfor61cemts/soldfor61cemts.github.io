
const socket = io();
let myId;
const players = {};

let scene, camera, renderer;
let playerObjects = {};
let bullets = [];

// Initialize Three.js scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Position camera
    camera.position.z = 5;

    // Add stars for space visualization
    addStars();

    animate();
}

// Add stars to the background
function addStars() {
    for (let i = 0; i < 1000; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 24, 24);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(geometry, material);

        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
        star.position.set(x, y, z);
        scene.add(star);
    }
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Socket events
socket.on('initialize', (data) => {
    myId = data.id;
    Object.keys(data.players).forEach((id) => {
        if (id !== myId) {
            createPlayer(id, data.players[id]);
        }
    });
});

socket.on('newPlayer', (data) => {
    if (data.id !== myId) {
        createPlayer(data.id, { x: 0, y: 0, z: 0 });
    }
});

socket.on('playerMoved', (data) => {
    if (players[data.id]) {
        updatePlayerPosition(data.id, data.position);
    }
});

socket.on('playerShot', (data) => {
    createBullet(data.id, data.bullet);
});

socket.on('playerDisconnected', (data) => {
    removePlayer(data.id);
});

function createPlayer(id, position) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const player = new THREE.Mesh(geometry, material);
    player.position.set(position.x, position.y, position.z);
    scene.add(player);
    playerObjects[id] = player;
    players[id] = { position };
}

function updatePlayerPosition(id, position) {
    players[id].position = position;
    if (playerObjects[id]) {
        playerObjects[id].position.set(position.x, position.y, position.z);
    }
}

function removePlayer(id) {
    scene.remove(playerObjects[id]);
    delete playerObjects[id];
    delete players[id];
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        const bulletPosition = { x: players[myId].position.x, y: players[myId].position.y, z: players[myId].position.z };
        socket.emit('shoot', { position: bulletPosition });
    } else {
        const newPosition = { x: players[myId].position.x, y: players[myId].position.y, z: players[myId].position.z };
        socket.emit('move', { position: newPosition });
    }
});

function createBullet(id, bullet) {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bulletMesh = new THREE.Mesh(geometry, material);
    bulletMesh.position.set(bullet.x, bullet.y, bullet.z);
    scene.add(bulletMesh);
    bullets.push(bulletMesh);
}

init();
