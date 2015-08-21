var app = require('express')();
var http = require('http').Server(app);
var pg = require ('pg');
var io = require('socket.io')(http);

var pgConString = "pg://node:node@localhost:5432/test"

var socketP = null;

io.on('connection', function(socket){
   console.log("connected", socket.id);
	socket.on('insert', function(msg){
		io.emit('insert', msg);
	});
		
	socket.on('update', function(msg){
		io.emit('update', msg);
	});
	socket.on('delete', function(msg){
		io.emit('delete', msg);
	});
	
	
	socket.on('disconnect', function() {
		console.log('Got disconnect!');
		if(io.sockets.connected.length>0){
		 	var i = io.sockets.connected.indexOf(socket);
      		delete io.sockets.connected[i];
		}
	});
	for(i=0;i<io.sockets.connected.length;i++){
		console.log("connected: ",io.sockets.connected[i].id);
		io.sockets.connected[i].emit("init");
	}
	pg.connect(pgConString, function(err, client, done) {
		if(err) {
			console.log(err);
		}
		else{
			var query = client.query("SELECT id, name FROM test ORDER BY id");
			query.on("row", function (row, result) {
				result.addRow(row);
			});
			query.on("end", function (result) {
				io.sockets.connected[socket.id].emit('init', JSON.stringify(result.rows));
			});
			if(!client._events.notification){
				client.on('notification', function(msg) {
					var payload = msg.payload.split('|');
					if(payload[1] == 'DELETE'){
						io.emit('delete', payload[3]);
					}
					else if(payload[1] == 'UPDATE'){
						io.emit('update', payload[3]);
					}
					else if(payload[1] == 'INSERT'){
						io.emit('insert', payload[3]);
					}
				});
			}
			var listener = client.query("LISTEN watchers");
		}
	});
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});