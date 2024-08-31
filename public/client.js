
const socket = io('https://soldfor61cemts-github-io.onrender.com/')
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


