var express = require('express');
var app = express();
var http = require('http').Server(app);
var pg = require ('pg');
var io = require('socket.io')(http);
//Added this to be able to load the static js files for the AngularJs controllers
app.use(express.static('front'));
var pgConString = "pg://node:node@localhost:5432/test"
var  insert = null;
var update = null;
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
	socket.on('insertRow', function(data){
		insert(data);
	});
	
	socket.on('updateRow', function(data){
		update(data);
	});
	
	socket.on('disconnect', function() {
		console.log('Got disconnect!');
		if(io.sockets.connected.length>0){
		 	var i = io.sockets.connected.indexOf(socket);
      		delete io.sockets.connected[i];
		}
	client._events = {};
	});
	var client = new pg.Client(pgConString);
	for(i=0;i<io.sockets.connected.length;i++){
		console.log("connected: ",io.sockets.connected[i].id);
		io.sockets.connected[i].emit("init");
	}
	client.connect(function(err, done) {
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
						while(payload[3].indexOf('"') !== -1){
							payload[3] = payload[3].replace('"', '');
						}						
						io.sockets.connected[socket.id].emit('delete', payload[3]);
					}
					else if(payload[1] == 'UPDATE'){
						while(payload[3].indexOf('"') !== -1){
							payload[3] = payload[3].replace('"', '');
						}
						io.sockets.connected[socket.id].emit('update', payload[3]);
					}
					else if(payload[1] == 'INSERT'){
						while(payload[3].indexOf('"') !== -1){
							payload[3] = payload[3].replace('"', '');
						}
						io.sockets.connected[socket.id].emit('insert', payload[3]);
					}
				});
			}
			var listener = client.query("LISTEN watchers");
			insert = function(data) {
				//let's pretend we have a user table with the 'id' as the auto-incrementing primary key
				var queryText = 'INSERT INTO test(name) VALUES($1) RETURNING id'
				client.query(queryText, [data], function(err, result) {
					if(err){
						console.log("err", err);	
					} 
					else {
						console.log("id:", result.rows[0].id);
					}
				});
			}
			
			update = function(data) {
				//let's pretend we have a user table with the 'id' as the auto-incrementing primary key
				var queryText = 'UPDATE test set name = $1 WHERE id= $2 RETURNING id'
				client.query(queryText, [data.value, data.id], function(err, result) {
					if(err){
						console.log("err", err);	
					} 
					else {
						console.log("id:", result.rows[0].id);
					}
				});
			}
		}
	});
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});