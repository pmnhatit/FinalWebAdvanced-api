const historyModel = require("../model/history/history.model");

const moment = require('moment');
const timestamp = require('time-stamp');
var userOnline=[];
var listRooms = [];
var listRooms_friend=[];
let listPlay=[];
let listWait=[];
const { addUser, removeUser, getUser, getUsersInRoom } = require('../users');

module.exports = function (io, socket) {
  console.log("co ket noi",socket.id);
  socket.on('tableonline',()=>{
    io.sockets.emit("tableonline_play",listPlay);
    io.sockets.emit("tableonline_wait",listWait);
  })
  socket.on('onlineUser', (name) => {
    var userItem={
      name:name,
      id:socket.id
    }
     userOnline.push(userItem);
     console.log(userOnline);
     io.sockets.emit("onlineUserServer",userOnline);
    
     
  });

  socket.on('move', function (data) {
  
      socket.to(socket.room).emit('move', data);
    
    
    // mark last move
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id == socket.room) {
        listRooms[i].lastMove = data;
      }
    }
  });

  socket.on('undo-request', function (data) {
      socket.to(socket.room).emit('undo-request', data);
    
  });
  socket.on('undo-result', function (data) {
    socket.to(socket.room).emit('undo-result', data);
  });

  socket.on('joinroom', function (data) {
  
    // save data
    socket.data = data;

    // find an empty room
    for (var i = 0; i < listRooms.length; i++) {

      // it's empty when there is no second player
      if (listRooms[i].playerO == null) {

        // fill empty seat and join room
        listRooms[i].playerO = data.name;
        listRooms[i].idplayerO=data.id;
        socket.room = listRooms[i].id;
        socket.join(socket.room);
        // send successful message to both
        io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
        for ( var i=0;i<listWait.length;i++){
          if(listWait[i]===socket.room){
            listWait.splice(i,1);
            listPlay.push(socket.room);
          }
        }
        console.log('Room [' + socket.room + '] played');
        return;
      }
    }

    // create new room if there is no empty one
    var room = {
      id: data.name +" "+Date.now(),
      playerX: data.name,
      idplayerX: data.id,
      playerO: null,
      idplayerO:null
    }
    listRooms.push(room);

    // add this client to the room
    socket.room = room.id;
    socket.join(socket.room);
    //them ban choi vao danh sach cho 
    listWait.push(room.id);
    console.log('Room [' + socket.room + '] created');
  });
  socket.on('joinroom_friend', function (data) {
  
    // save data
    socket.data = data;

    // find an empty room
    for (var i = 0; i < listRooms_friend.length; i++) {

      // it's empty when there is no second player
      if (listRooms_friend[i].id ===data.id ){

        // fill empty seat and join room
        listRooms_friend[i].playerO = data.name;
        listRooms_friend[i].idplayerO=data.id;
        socket.room = listRooms_friend[i].id;
        socket.join(socket.room);
        // send successful message to both
        io.in(listRooms_friend[i].id).emit('joinroom-success', listRooms_friend[i]);
        // xoa phong o danh sach cho them vao danh sach choi
        for ( var i=0;i<listWait.length;i++){
          if(listWait[i]===socket.room){
            listWait.splice(i,1);
            listPlay.push(socket.room);
          }
        }
        console.log('Room [' + socket.room + '] played');
        return;
      }
    }

    // create new room if there is no empty one
    var room = {
      id: data.id,
      playerX: data.name,
      idplayerX: data.id,
      playerO: null,
      idplayerO:null
    }
    listRooms_friend.push(room);

    // add this client to the room
    socket.room = room.id;
    socket.join(socket.room);
    //them ban choi vao danh sach cho 
    listWait.push(room.id);
    console.log('Room [' + socket.room + '] created');
  });
  socket.on('infoWinner',(data)=>{
    for (var i = 0; i < listRooms.length; i++) {

      // it's empty when there is no second player
      if (listRooms[i].id === data.roomInfo) {
          const player1 = data.winner==='X' ? listRooms[i].idplayerX : listRooms[i].idplayerO;
          
          const player2 = data.winner==='X' ? listRooms[i].idplayerO : listRooms[i].idplayerX;
          const date = timestamp('DD/MM/YYYY');

          const newHistory =  historyModel.createHistory(
            player1,
            player2,
            date,
            0
          );
        return;
      }
    }
  })
// chat
  socket.on('join_chat', ({ name, room }, callback) => {
    name = name.slice(1, name.length-1);
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    socket.join(user.room);

    // socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    // io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });
  socket.on('disconnect', () => {
    socket.removeAllListeners();
    // xoa user chat
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }


    // xoa nguoi dung dang online
    for(var i = 0; i < userOnline.length; i++){
      if (userOnline[i].id === socket.id) { // nếu là sinh viên cần xóa
        userOnline.splice(i,1);
        break;
      }
  }
    io.sockets.emit("onlineUserServer",userOnline);
    console.log('user disconnected',socket.id);
    socket.leave(socket.room);




      //xoa phong choi/cho khi nguoi do thoat
  for (var i=0;i<listPlay.length;i++)
  {
    if( listPlay[i]===socket.room)
    {
      listPlay.splice(i, 1);
      break;
    }
  }
  for (var i=0;i<listWait.length;i++)
  {
    if( listWait[i]===socket.room)
    {
      listWait.splice(i, 1);
      break;
    }
  }
  io.sockets.emit("tableonline_play",listPlay);
  io.sockets.emit("tableonline_wait",listWait);
// xoa phong khi co nguoi thoat ra (ngau nhien)
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === socket.room) {
        listRooms.splice(i, 1);
        break;
      }
      
    }
    // xoa phong khi co nguoi thoat ra (ban be)
    for (var i = 0; i < listRooms_friend.length; i++) {
      if (listRooms_friend[i].id === socket.room) {
        listRooms_friend.splice(i, 1);
        break;
      }
    }
  });


}