const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const players = {}; // Object to keep track of players

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    players[socket.id] = { x: 0, y: 0, z: 0 }; // Initial position for each player

    // Send the new player their ID and the list of current players
    socket.emit('initialize', { id: socket.id, players });

    // Notify other players about the new player
    socket.broadcast.emit('newPlayer', { id: socket.id });

    socket.on('move', (data) => {
        // Update the position of the player who moved
        if (players[socket.id]) {
            players[socket.id] = data.position;
            // Broadcast the updated position to all other players
            socket.broadcast.emit('playerMoved', { id: socket.id, position: data.position });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id]; // Remove from the players object
        // Notify all players that someone disconnected
        socket.broadcast.emit('playerDisconnected', { id: socket.id });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
