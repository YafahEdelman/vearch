var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var python = require('python').shell;
var exec   = require('child_process').exec;
var fs = require('fs');

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/videos'));

io.on('connection', function(socket) {
  console.log("Connection opened.");
  socket.on("data.submit", function(link, search_string) {
    search_string = search_string.replace(/[^a-zA-Z0-9 ]/g, "");
    if (link == "" || search_string == "") {
      socket.emit("data.missing");
      return;
    }
    socket.emit("data.submit.success");
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
                socket.emit("data.progress.analyzing");
		analyze(id, search_string, socket);
		console.log('Video cached.')
		return;
	}
        socket.emit("data.progress.download");
	exec("youtube-dl --max-filesize 40m -f 18 --id https://www.youtube.com/watch?v=" + id, function () {
		if (fs.existsSync(id + ".mp4")) {
			console.log("Downloaded video.");
			exec("mkdir videos/" + id);
                        socket.emit("data.progress.splitting");
			exec("avconv -i " + id + ".mp4 -r 1 -s 640x360 -f image2 videos/" + id + "/%03d.jpeg", function() {
				console.log("Split video into frames.");
				exec("rm " + id + ".mp4");
                                socket.emit("data.progress.analyzing");
				analyze(id, search_string, socket);
				return;
			});
		} else {
			console.log("Download failed.");
                        socket.emit("data.download.failed");
		}
	});
}

function analyze(id, search_string, socket) {
  get_data(id, search_string, function(data){
    var best_image_name = ".jpeg";
    var prob = -1;
    var frames = Object.keys(data);
    frames.sort( function(a, b){
      return data[b]-data[a];
    });
    best_few = frames.slice(0, 5).map(function(i){ return i.split("/").slice(-1)[0].slice(0, -5);});
    console.log(id, search_string, best_few);
    socket.emit("data.search.success", { video_id: id, best: best_few });
  });
}

function get_data(folder_name, words_to_search, callback) {
  console.log(folder_name,'image_search.word_probs("videos/' + folder_name + '", "' + words_to_search + '")');
  python('image_search.word_probs("videos/' + folder_name + '", "' + words_to_search + '")', function(err, data){
    console.log(data)
    if (err) throw err;
    each_image_data = data.split("\n").slice(0, -1);
    console.log(err,data);
    final_data = {};
    for (i in each_image_data) {
      var image_data = each_image_data[i];
      var split_image_data = image_data.split(" ");
      var file_name = split_image_data[0];
      var prob = parseFloat(split_image_data[1]);
      console.log(i,prob,file_name);
      if (!(isNaN(prob)|| prob<0.001)) {
        final_data[file_name] = prob;
      }
    }
    callback(final_data);
  });
}

python('import image_search', function(err, data) {
  if (err) throw err;
  // get_data("../caffe/examples/images", "cat cycle", console.log);
  console.log(data);
  console.log(err);
  http.listen(80, function() {
    console.log('Listening on *:3000.');
  });
});
