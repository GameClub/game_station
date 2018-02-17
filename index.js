var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];
var morgan = require('morgan');
const PORT = process.env.PORT || 5000

app.use(morgan('dev'));

app.get('/', function(req, res) {
    //res.send("hello");
    res.sendFile(__dirname+"/home.html");
});

app.get('/home.css', function(req, res) {
    res.sendFile(__dirname+"/home.css");
});

// routes for game lost pixels 

app.get('/games/lostpixels', function(req, res) {
    res.sendFile(__dirname+"/games/lostpixels/index.html");
});
app.get('/games/original.png', function(req, res) {
    res.sendFile(__dirname+"/games/lostpixels/original.png");
});
app.get('/games/5-2-arrow-transparent.png', function(req, res) {
    res.sendFile(__dirname+"/games/lostpixels/5-2-arrow-transparent.png");
});
app.get('/games/lost.png', function(req, res) {
    res.sendFile(__dirname+"/games/lostpixels/lost.png");
});

// routes for game tic tac toe

app.get('/games/tictactoe', function(req, res) {
    res.sendFile(__dirname+"/games/tictactoe/chat.html");
});
app.get('/games/jquery', function(req, res) {
    res.sendFile(__dirname+"/games/tictactoe/jquery.js");
});
app.get('/games/tictac.png', function(req, res) {
    res.sendFile(__dirname+"/games/tictactoe/tictac.png");
});

// routes for game six dots

app.get('/games/sixdots', function(req, res) {
    res.sendFile(__dirname+"/games/sixdots/sixdots.html");
});
app.get('/games/jquery', function(req, res) {
    res.sendFile(__dirname+"/games/sixdots/jquery.js");
});
app.get('/games/sixdots.png', function(req, res) {
    res.sendFile(__dirname+"/games/sixdots/sixdots.png");
});


// server side code for six dots
function makeidforSD() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
}

var countersd = 0;
var roomnamesd = makeidforSD();
var usersSD = [];

var nsp = io.of('/sdots');
nsp.on('connection', function(socket) {
    console.log('new player for sixdots.. :)');

    socket.on('new user', function(data, callback) {
        if (usersSD.indexOf(data) != -1) {
            callback(false, 1);
        } else {
            //callback(true);
            usersSD.push(data);
            socket.username = data;

            if (countersd%2 == 1) {
                socket.room = roomnamesd;
                socket.join(roomnamesd);
                console.log("rom full");
                callback(true, 2);
                //socket.to(roomname).emit('start game', 1);
                countersd++;
            } else {
                roomnamesd = makeidforSD();
                socket.room = roomnamesd;
                socket.join(roomnamesd);
                callback(true, 3);
                console.log("waiting...");
                countersd++;
            }

            socket.emit('room name', roomnamesd);
        }
    });

    socket.on('blue line clicked', function(data) {
        socket.to(data.roomID).emit('update red', data.id)
    });

    socket.on('personal', function(data) {
        var message = data.msg;
        var roomId = data.roomID;
        socket.to(roomId).emit('recieve personal', {msg: message, usr: socket.username});
    });

    socket.on('say loose', function(room) {
        socket.to(room).emit('you win');
    });

    socket.on('disconnect', function() {
        socket.to(socket.room).emit('player left', {username: socket.username, roomname: socket.room});
        usersSD.pop(socket.username);
        console.log('one went from sixdots.. :(');
    });
});


// server side code for tic tac toe
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
}

var counter = 0;
var roomname = makeid();
var users = [];

var nsp2 = io.of('/ttt');
nsp2.on('connection', function(socket) {

    //console.log(users);
    socket.on('new user', function(data, callback) {
        if (users.indexOf(data) != -1) {
            callback(false, 1);
        } else {
            //callback(true);
            users.push(data);
            socket.username = data;

            if (counter%2 == 1) {
                socket.room = roomname;
                socket.join(roomname);
                console.log("rom full");
                callback(true, 2);
                //socket.to(roomname).emit('start game', 1);
                counter++;
            } else {
                roomname = makeid();
                socket.room = roomname;
                socket.join(roomname);
                callback(true, 3);
                console.log("waiting...");
                counter++;
            }

            socket.emit('room name', roomname);
        }
    });

    socket.on('clicked check', function(data) {
        var room = data.roomID;
        var id = data.id;

        socket.to(room).emit('oposite check', id);
    });

    socket.on('say loose', function(data) {
        socket.to(data.roomID).emit('loose', data.id);
    });

    socket.on('personal', function(data) {
        var message = data.msg;
        var roomId = data.roomID;
        socket.to(roomId).emit('recieve personal', {msg: message, usr: socket.username});
    });

    socket.on('draw', function(data) {
        socket.to(data.room).emit('say draw', data.id);
    });

    console.log("a user connected: " + socket.id);

    socket.on('disconnect', function() {
        socket.to(socket.room).emit('player left', {username: socket.username, roomname: socket.room});
        users.pop(socket.username);
        console.log(socket.username + " disconnected from " + socket.room);
    });
});

http.listen(PORT, function(err) {
    if (err)
        console.log(err);
    else 
        console.log(`server running on port ${PORT}`);
});
