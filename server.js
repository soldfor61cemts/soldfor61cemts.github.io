
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const players = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    players[socket.id] = { x: 0, y: 0, z: 0, bullets: [] };

    socket.emit('initialize', { id: socket.id, players });

    socket.broadcast.emit('newPlayer', { id: socket.id });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.position.x;
            players[socket.id].y = data.position.y;
            players[socket.id].z = data.position.z;
            io.emit('playerMoved', { id: socket.id, position: data.position });
        }
    });

    socket.on('shoot', (data) => {
        if (players[socket.id]) {
            const bullet = { x: data.position.x, y: data.position.y, z: data.position.z };
            players[socket.id].bullets.push(bullet);
            io.emit('playerShot', { id: socket.id, bullet });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnected', { id: socket.id });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
