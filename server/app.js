var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var python = require('node-python');

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

function get_data(folder_name, words_to_search, callback) {
  python( 'image_search.word_probs("' + folder_name + '", "' + words_to_search + '")', function(err, data){
    if (err) throw err;
    console.log(data);
    each_image_data = data.split("\n").slice(0,-1);
    final_data=[];
    for (i in each_image_data) {
      var image_data = each_image_data[i];
      var split_image_data = image_data.split(" ");
      var file_name = split_image_data[0];
      var prob = parseFloat(split_image_data[1]);// BAD BAD BAD
      console.log(prob, split_image_data[1], file_name);
      if (prob === NaN ) {
        /* Some weird "START COMMAND\n" stuff was at the start of the data
        sometimes, so I'll just ignore the data when it's bad rather than
        throwing an error */

        // throw "Probability is not a number.";
      } else {
        final_data[file_name] = prob;
      }
    }
    callback(final_data);
  });
}
python('import image_search',function(err,data){
  if(err)throw err;
  get_data("../caffe/examples/images", "cat",console.log);
  http.listen(3000, function() {
    console.log('listening on *:3000');
  });
});

// interop with the python program
var image_search = python.import('image_search.image_search');
