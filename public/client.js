
const socket = io('https://soldfor61cemts-github-io.onrender.com/')
// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
rendererody.appendChild(renderer.domElement);

// Create player ships
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player1 = new THREE.Mesh(geometry, material1);
const player2 = new THREE.Mesh(geometry, material2);
scene.add(player1);.setSize(window.innerWidth, window.innerHeight);
document.b
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

let myId;
const players = {}; // Object to keep track of players

socket.on('initialize', (data) => {
    myId = data.id; // Assign the player's ID
    Object.keys(data.players).forEach((id) => {
        if (id !== myId) {
            createPlayer(id, data.players[id]); // Create existing players
        }
    });
});

socket.on('newPlayer', (data) => {
    if (data.id !== myId) {
        createPlayer(data.id, { x: 0, y: 0, z: 0 }); // Create a new player
    }
});

socket.on('playerMoved', (data) => {
    if (players[data.id]) {
        updatePlayerPosition(data.id, data.position);
    }
});

socket.on('playerDisconnected', (data) => {
    removePlayer(data.id);
});

function createPlayer(id, position) {
    // Create a new player element with a unique ID
    players[id] = { element: createBoxElement(), position };
}

function updatePlayerPosition(id, position) {
    // Update the player element's position
    players[id].position = position;
    updateBoxElement(players[id].element, position);
}

function removePlayer(id) {
    // Remove the player element
    delete players[id];
}

document.addEventListener('keydown', (event) => {
    const newPosition = { x: players[myId].position.x, y: players[myId].position.y, z: players[myId].position.z };
    // Update newPosition based on key input
    // Example: newPosition.x += 1;
    socket.emit('move', { position: newPosition });
});
