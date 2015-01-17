var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/views'));

io.on('connection', function(socket) {
  console.log("a user has joined");
  socket.on("link submitted", function(link, terms) {
    if (link == "" || terms == "") {
      io.emit("missing link or terms");
      return;
    }
    console.log("Whee a link " + link);
    console.log("Whee some terms " + terms);
  });
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});
