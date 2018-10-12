let app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http, {origins: '*.*'}),
    generator = require('readable-url'),
    rooms = {};


app.get('/', function (req, res) {

});

io.on('connection', function (socket) {

    let currentRoom = {},
        socket_id = socket.id,
        username = newUserName();

    console.log("user connected");

    socket.on('create room', function () {
        let room_name = newRoomName();

        currentRoom = {
            name: room_name,
            users: [],
            playlist: [],
            currentVideo: null,
            chat: []
        };

        socket.join(room_name);

        currentRoom['users'].push(socket.id);

        console.log('Creating a new room ' + room_name);

        rooms[room_name] = currentRoom;

        socket.emit('room created', currentRoom)
    });

    socket.on('chat message', function (data) {
        console.log('sending message to ', currentRoom);

        let msg = {
            from: username,
            message: data
        };

        socket.to(currentRoom.name).emit('chat message', msg)
    });

    socket.on('list users', function () {
        socket.$emit('debug', socket.rooms)
    });

    socket.on('switch video', function (videoId) {
        socket.to(currentRoom.name).emit('switch video', videoId);
    })

    socket.on('join room', function (room) {
        console.log('joined room ', currentRoom)

        console.log(socket.id + " joining " + room.room);

        // Check if room exists, if not throw them out
        if (room.room in rooms) {
            currentRoom = rooms[room.room];

            rooms[room.room]['users'].push(socket.id);

            socket.join(room.room);

            socket.broadcast.to(room.room).emit('chat message', {
                from: 'test',
                message: 'Just joined'
            })
        }
        else {
            socket.emit('room closed');
        }
    });

    socket.on('pause video', function () {
        console.log('sending pause to', currentRoom.name)
        socket.to(currentRoom.name).emit('pause video')
        // console.log('pause in room ', currentRoom)
    });

    socket.on('play video', function () {
        console.log('sending play to', currentRoom.name)
        socket.to(currentRoom.name).emit('play video')
        // console.log('play in room ', currentRoom)
    });

    socket.on('disconnect', function () {
        if (currentRoom.hasOwnProperty('users'))
            delete currentRoom.users[socket_id]
    })
});

http.listen(3000, '0.0.0.0', function () {
    console.log("listening on *:3000");
});

function newRoomName() {
    let name = new generator(5).generate();

    if (name in rooms)
        return newRoomName();

    return name;
}

function newUserName() {
    return new generator(4).generate();
}