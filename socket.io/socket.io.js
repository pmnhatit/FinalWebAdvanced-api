var userOnline=[];
module.exports = function (io, socket) {
  console.log("co ket noi",socket.id);
  socket.on('onlineUser', (name) => {
    var userItem={
      name:name,
      id:socket.id
    }
   
    console.log(userItem);
     userOnline.push(userItem);
     console.log(userOnline);
     io.sockets.emit("onlineUserServer",userOnline);
    
     
  });
  socket.on('disconnect', () => {
    
    for(var i = 0; i < userOnline.length; i++){
      if (userOnline[i].id === socket.id) { // nếu là sinh viên cần xóa
        userOnline.splice(i,1);
        break;
      }
  }
    // console.log(userOnline.indexOf(userOnlinesocket.id));
    // userOnline.splice(userOnline.indexOf(socket.id),1);
    io.sockets.emit("onlineUserServer",userOnline);
    console.log('user disconnected',socket.id);
  });

}