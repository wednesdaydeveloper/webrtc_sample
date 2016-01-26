var port = 9001;
var io = require('socket.io').listen(port);
console.log((new Date()) + " Server is listening on port " + port);

io.sockets.on('connection', function(socket) {
  // 入室
  socket.on('enter', function(roomname) {
    socket.set('roomname', roomname);
    socket.join(roomname);
  });
 
  socket.on('message', function(message) {
    // 送信元のidをメッセージに追加（相手が分かるように）
    message.from = socket.id;

    // 送信先が指定されているか？
    var target = message.sendto;
    if (target) {
	　　// 送信先が指定されていた場合は、その相手のみに送信
      io.sockets.socket(target).emit('message', message);
      return;
    }

	// 特に指定がなければ、ブロードキャスト
    emitMessage('message', message);
  });
 
  socket.on('disconnect', function() {
    emitMessage('user disconnected');
  });
 
  // 会議室名が指定されていたら、室内だけに通知
  function emitMessage(type, message) {
    var roomname;
    socket.get('roomname', function(err, _room) {  roomname = _room;  });
 
    if (roomname) {  socket.broadcast.to(roomname).emit(type, message);   }
    else {   socket.broadcast.emit(type, message);   }
  }
});