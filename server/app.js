var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
<<<<<<< HEAD
var python = require('node-python');
=======
//var python = require('node-python');
>>>>>>> cd456e356ca5a6fa7c7f2d979962267b6a05e45f

app.use(express.static(__dirname + '/views'));

io.on('connection', function(socket) {
  
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});

//interop with the python program
var image_search = python.import('image_search.image_search');
