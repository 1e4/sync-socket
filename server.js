let app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    generator = require('readable-url'),
    rooms = {};


app.get('/', function (req, res) {

});

io.on('connection', function (socket) {

    console.log("user connected");


    socket.on('create room', function () {
        let name = newName(),
            currentRoom = {
                name: name,
                users: [],
                playlist: [],
                currentVideo: null
            };

        socket.join(name);

        currentRoom['users'].push(socket.id);

        console.log('Creating a new room ' + name);

        rooms[name] = currentRoom;

        socket.emit('room created', currentRoom)
    });

    socket.on('list users', function () {
        socket.$emit('debug', socket.rooms)
    });

    socket.on('join room', function (room) {
        console.log(socket.id + " joining " + room.room);

        if(room.room in rooms)
            rooms[room.room]['users'].push(socket.id)
        else
            socket.emit('room closed');
    })
});

http.listen(3000, function () {
    console.log("listening on *:3000");
});

function newName() {
    let name = new generator(5).generate();

    if (name in rooms)
        return newName();

    return name;
}