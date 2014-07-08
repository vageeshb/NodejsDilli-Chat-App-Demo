// Module Dependencies
var express = require('express'),
app = express(),
path = require('path'),
server = app.listen(3000, function () {
  console.log('Server up and listening to port 3000');
}),
io = require('socket.io').listen(server);

// Middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger());
app.use(express.static(path.join(__dirname, 'public')));

// Route
app.get('/', function(req, res) {
  res.render('index.jade');
});

// Socket.IO
var connectedSockets = {};

io.sockets.on('connection', function (socket) {
  
  // Store Socket
  connectedSockets[socket.id] = null;

  
    
  // Handle New User Registrations
  socket.on('newUser', function(data) {
      
    // Save username
    connectedSockets[socket.id] = data.username;
      
    // Broadcast to other nodes
    socket.broadcast.emit('newUserJoined', data.username);
      
    // Send a signal to all users with the updated user list
    io.sockets.emit('signal', connectedSockets);
  });

  // Handle new message
  socket.on('sendMessage', function(data) {
    io.sockets.emit('resMessage', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', function() {
    // Find username of this socket
    var username = connectedSockets[socket.id];
    console.log('Socket disconnected: ' + username);
    delete connectedSockets[socket.id];
    // Broadcast user left event to other connected nodes
    socket.broadcast.emit('userLeft', username);
    // Send a signal to all users with the updated user list
    io.sockets.emit('signal', connectedSockets);
  });

});
