var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var python = require('python').shell;
var exec   = require('child_process').exec;
var fs = require('fs');

app.use(express.static(__dirname + '/views'));

io.on('connection', function(socket) {
  console.log("Connection opened.");
  socket.on("data.submit", function(link, search_string) {
    search_string = search_string.replace(/[^a-zA-Z0-9 ]/g,"");
    if (link == "" || search_string == "") {
      io.emit("data.missing");
      return;
    }
    io.emit("data.submit.success");
    console.log("Got link: " + link);
    console.log("Got search terms: " + search_string);
    get_video(link, search_string, socket);
  });
});

function get_video(url, search_string, socket) {
	var id = url.slice(url.indexOf("v=") + 2);
	if (id.indexOf("&") >= 0) {
		id = id.slice(0, id.indexOf("&"));
	}
	if (!fs.existsSync("videos")) {
		exec("mkdir videos");
	}
	if (fs.existsSync("videos/" + id)) {
		analyze(id);
		console.log('Video cached.')
		return;
	}
	exec("youtube-dl --max-filesize 40m -f 18 --id https://www.youtube.com/watch?v=" + id, function () {
		if (fs.existsSync(id + ".mp4")) {
			console.log("Downloaded video.");
			exec("mkdir videos/" + id);
			exec("avconv -i " + id + ".mp4 -r 1 -s 640x360 -f image2 videos/" + id + "/%03d.jpeg", function() {
				console.log("Split video into frames.");
				exec("rm " + id + ".mp4");
				analyze(id, search_string, socket);
				return;
			});
		} else {
			console.log("Download failed.");
		}
	});
}

function analyze(id, search_string, socket) {
  get_data(id,search_string, function(data){
    var best_image_name = ".jpeg";
    var prob = -1;
    for (video_name in data) {
      var video_prob = data[video_name];
      if (video_prob > prob) {
        prob = video_prob;
        best_image_name = video_name
      }
    }
    var best_frame_num = parseInt(best_image_name.split(0, -5));
    if (best_frame_num === NaN){
      socket.emit("data.malformed");    
    } else {
      socket.emit("video_searched", {video_id: id, second_found: best_frame_num});
    }
  });
}

function get_data(folder_name, words_to_search, callback) {
  python('image_search.word_probs("' + folder_name + '", "' + words_to_search + '")', function(err, data){
    if (err) throw err;
    each_image_data = data.split("\n").slice(0, -1);
    final_data = {};
    for (i in each_image_data) {
      var image_data = each_image_data[i];
      var split_image_data = image_data.split(" ");
      var file_name = split_image_data[0];
      var prob = parseFloat(split_image_data[1]);
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

python('import image_search', function(err, data) {
  if (err) throw err;
  // get_data("../caffe/examples/images", "cat cycle", console.log);
  http.listen(3000, function() {
    console.log('Listening on *:3000.');
  });
});
