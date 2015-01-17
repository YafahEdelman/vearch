var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var python = require('node-python');

app.use(express.static(__dirname + '/views'));

io.on('connection', function(socket) {
  
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});

//interop with the python program
var image_search = python.import('image_search.image_search');
