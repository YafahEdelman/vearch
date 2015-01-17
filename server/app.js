var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/views/design'));

io.on('connection', function(socket) {
  console.log('a user has connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
