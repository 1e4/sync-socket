let app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http, {origins: '*:*'}),
    generator = require('readable-url'),
    rooms = {};

app.get('/', function (req, res) {
    res.redirect('https://sync.stream')
});

io.on('connection', function (socket) {

    let currentRoom = {},
        socket_id = socket.id,
        username = newUserName();

    socket.emit('client id', socket_id)

    console.log("user connected", socket_id);

    socket.on('create room', function () {
        // Create a new random name
        let room_name = newRoomName();

        // Setup the new room
        currentRoom = {
            name: room_name,
            users: [],
            playlist: [],
            currentVideo: null,
            chat: [],
            owner: socket.id,
            isPlayingNow: false
        };

        console.log('Creating a new room ' + room_name);

        rooms[room_name] = currentRoom;

        socket.emit('room created', currentRoom)
    });

    socket.on('chat message', function (data) {
        console.log('sending message to ', currentRoom);

        let msg = {
            from: username,
            message: data,
            from_id: socket_id
        };

        socket.to(currentRoom.name).emit('chat message', msg)
    });

    socket.on('switch video', function (videoId) {
        currentRoom.currentVideo = videoId;
        currentRoom.isPlayingNow = false;
        console.log("Playing video", videoId)
        socket.to(currentRoom.name).emit('switch video', videoId);
        io.sockets.in(currentRoom.name).emit('room meta', {
            key: 'currentVideo',
            value: videoId
        })
    });

    socket.on('join room', (room) => {
        // Check if room exists, if not throw them out
        if (room.room in rooms) {
            console.log('found room', rooms[room.room])
            currentRoom = rooms[room.room];

            rooms[room.room]['users'][socket_id] = {
                socket_id: socket.id,
                ready: false,
            };

            socket.join(room.room);

            socket.emit('load room', rooms[room.room]);

            socket.to(room.room).emit('chat message', {
                from: 'Server',
                message: username + ' just joined'
            });

            console.log(socket.id + " joining", room);
        }
        else {
            console.log('room closed', rooms);
            socket.emit('room closed');
        }
    });

    socket.on('pause video', function () {
        console.log('sending pause to', currentRoom.name)
        socket.to(currentRoom.name).emit('pause video')
    });

    socket.on('play video', function () {
        console.log('sending play to', currentRoom.name)
        socket.to(currentRoom.name).emit('play video')
    });

    // When a video is first played from a room it first needs to be buffered before we can sync it up as
    // buffering can take an abnormal amount of time
    socket.on('waiting to buffer', function() {
        // Set the user to not ready
        currentRoom['users'][socket_id]['ready'] = false;

        // Emit to the room that
        io.sockets.in(currentRoom.name).emit('buffer video')
    });

    // When the video is buffered update their status
    // If everyone is ready then send the play event
    socket.on('ready to play video', function() {
        let isReady = true;

        currentRoom['users'][socket_id]['ready'] = true;

        console.log('user is ready');

        // Check if everyone else is ready and we are the last person
        for(let u in currentRoom['users'])
        {
            console.log(`Looping users to check if ready`, u, currentRoom['users'][u]['ready']);
            if(currentRoom['users'][u]['ready'] !== true)
                isReady = false;
        }

        // If everyone is ready then play the video
        if(isReady && !currentRoom.isPlayingNow)
        {
            // console.log('sending to ', currentRoom, socket);

            currentRoom.isPlayingNow = true;
            io.sockets.in(currentRoom.name).emit('chat message', {
                from: 'Server',
                message: 'Syncing complete, playing video'
            });
            io.sockets.in(currentRoom.name).emit('play video');
        }
    });

    socket.on('disconnect', () => {
        //Clean out temp users
        if(!currentRoom.hasOwnProperty('users'))
            return;

        console.log("Current room before disconnect", currentRoom)

        if (currentRoom.hasOwnProperty('users'))
            delete currentRoom.users[socket_id];

        console.log("Current room before disconnect after removal of current user", currentRoom, Object.keys(currentRoom['users']).length)

        // Clean up temporary rooms
        if(Object.keys(currentRoom['users']).length === 0)
            delete rooms[currentRoom.name]
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