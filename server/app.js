var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var python = require('node-python');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//python test!
var math = python.import('math')
console.log(math.sqrt.toString());