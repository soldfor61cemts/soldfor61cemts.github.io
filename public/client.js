
const socket = io();
let myId;
const players = {};

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
    players[id] = { element: createBoxElement(), position };
}

function updatePlayerPosition(id, position) {
    players[id].position = position;
    updateBoxElement(players[id].element, position);
}

function removePlayer(id) {
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

function createBoxElement() {
    // Create 3D box element using Three.js
}

function createBullet(id, bullet) {
    // Render bullet in the game space
}

function updateBoxElement(element, position) {
    // Update 3D element's position in the scene
}
