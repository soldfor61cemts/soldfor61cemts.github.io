
const socket = io('https://soldfor61cemts-github-io.onrender.com/')
// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create player ships
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player1 = new THREE.Mesh(geometry, material1);
const player2 = new THREE.Mesh(geometry, material2);
scene.add(player1);
scene.add(player2);

player1.position.z = -5;
player2.position.z = -5;

// Player movement and shooting logic
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': player1.position.y += 0.1; break;
        case 's': player1.position.y -= 0.1; break;
        case 'a': player1.position.x -= 0.1; break;
        case 'd': player1.position.x += 0.1; break;
        case ' ': socket.emit('playerShoot', { id: socket.id }); break;
    }
    socket.emit('playerMove', { id: socket.id, position: player1.position });
});

// Update other player's position based on data received from the server
socket.on('playerMove', (data) => {
    if (data.id !== socket.id) {
        player2.position.set(data.position.x, data.position.y, data.position.z);
    }
});

socket.on('playerShoot', (data) => {
    if (data.id !== socket.id) {
        console.log('Player 2 shot!');
    }
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
