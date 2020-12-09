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
    userOnline.splice(userOnline.indexOf(socket.id),1);
    io.sockets.emit("onlineUserServer",userOnline);
    console.log('user disconnected',socket.id);
  });

}