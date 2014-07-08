$(document).ready( function () {
  // Initial Setup
  var currentUser, socket = io.connect();
  $('#username').focus();

  // Method to focus on last appended message
  function focusLast() {
    $('.messages').scrollTop($('.messages').height());
  }

  // Emit new user joined event to server
  $('#username').on('keypress', function (e) {
    if(e.which == 13) {
      if($('#username').val() != '') {
        currentUser = $('#username').val();

        // Send new event to server
        socket.emit('newUser', {username: currentUser});

        $('.login').css('display', 'none');
        $('.chat').css('display', 'block');
        
        var entryMessage = "<div class='info'><strong>You just joined the chat!</strong></div>";
        var userMessageHead = "<div class='info'><strong>Online User</strong></div>";  
        $('.messages').append(entryMessage);
        $('.usersHead').append(userMessageHead);
          
        focusLast();
        $('#newMessage').focus();
        
      }
    }
  });

  // Handle new user joined event
  socket.on('newUserJoined', function(name) {
    var newUser = "<div class='info'><strong>" + name + " joined the chat!</strong></div>";
    $('.messages').append(newUser);
      
  });

  // Handles new message received
  socket.on('resMessage', function(data) {
    var sender = data.sender,
    message = data.message,
    className = (sender === currentUser) ? 'current-user' : 'other-user';
    
    var newMessage = "<div class='" + className + "'><span class='name'>" + sender + "</span> : <span class='message'>" + message + "</span></div>";
    $('.messages').append(newMessage);

    focusLast();
  });

  // Emit new message event to server
  $('#newMessage').on('keypress', function (e) {
    if(e.which == 13) {
      var message = $(this).val();
      if( message != '') {
        var messageObj = {
          sender: currentUser,
          message: message
        };
        socket.emit('sendMessage', messageObj);
        $(this).val('');
      }
    }
  });

  // Handles user left event emitted by server
  socket.on('userLeft', function(name) {
    var userLeft = "<div class='info'><strong>" + name + " has left the chat!</strong></div>";
    $('.messages').append(userLeft);
    focusLast();
  });

  // Handle Online User List 
  socket.on('signal', function(obj) {
    var templi = '';
    for(var temp in obj){
    	templi = templi+ "<li>" + obj[temp] + "</li>";    	
    }
    $('.userList').html(templi);    
  });
});