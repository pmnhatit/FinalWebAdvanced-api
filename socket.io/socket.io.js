const historyModel = require("../model/history/history.model");

const moment = require('moment');
const timestamp = require('time-stamp');
var userOnline=[];
var listRooms = [];
var listRooms_frined=[];
const { addUser, removeUser, getUser, getUsersInRoom } = require('../users');

module.exports = function (io, socket) {
  console.log("co ket noi",socket.id);
  
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
    console.log('Room [' + socket.room + '] created');
  });
  socket.on('joinroom_friend', function (data) {
  
    // save data
    socket.data = data;

    // find an empty room
    for (var i = 0; i < listRooms_frined.length; i++) {

      // it's empty when there is no second player
      if (listRooms_frined[i].id == data.id) {

        // fill empty seat and join room
        listRooms[i].playerO = data.name;
        listRooms[i].idplayerO=data.id;
        socket.room = listRooms_frined[i].id;
        socket.join(socket.room);
        //moi them chat
        socket.emit('message', { user: 'admin', text: `${data.name}, welcome to room ${room.id}.`});
        socket.broadcast.to(socket.room).emit('message', { user: 'admin', text: `${data.name} has joined!` });
        // send successful message to both
        io.in(listRooms_frined[i].id).emit('joinroom-success', listRooms_frined[i]);

        console.log('Room [' + socket.room + '] played');
        return;
      }
    }

    // create new room if there is no empty one
    var room = {
      id: data +" "+Date.now(),
      playerX: data.name,
      idplayerX: data.id,
      playerO: null,
      idplayerO:null
    }
    listRooms_frined.push(room);

    // add this client to the room
    socket.room = room.id;
    socket.join(socket.room);
    //moi them chat
    socket.emit('message', { user: 'admin', text: `${data.name}, welcome to room ${socket.room}.`});
    socket.broadcast.to(socket.room).emit('message', { user: 'admin', text: `${data.name} has joined!` });
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



    for(var i = 0; i < userOnline.length; i++){
      if (userOnline[i].id === socket.id) { // nếu là sinh viên cần xóa
        userOnline.splice(i,1);
        break;
      }
  }
    io.sockets.emit("onlineUserServer",userOnline);
    console.log('user disconnected',socket.id);
    socket.leave(socket.room);




    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id == socket.room) {
        listRooms.splice(i, 1);
        // destroy it when the room just created, second player hasn't enter yet
        // if (socket.withBot || listRooms[i].playerO == null) {
        //   listRooms.splice(i, 1);
        //   console.log('Room [' + socket.room + '] destroyed');
        // }
        // // mark the room empty by set flag DISCONNECTED for the one left 
        // else {

        //   if (listRooms[i].playerO === socket.data.fullname) {
        //     listRooms[i].playerO = 'DISCONNECTED';
        //   }
        //   else {
        //     listRooms[i].playerX = 'DISCONNECTED';
        //   }

        //   // check if both is disconnect
        //   if (listRooms[i].playerO === 'DISCONNECTED' && listRooms[i].playerX === 'DISCONNECTED') {

        //     // destroy the room
        //     listRooms.splice(i, 1);
        //     console.log('Room [' + socket.room + '] destroyed');
        //   } else {
          
        //     // inform the other
        //     io.to(listRooms[i].id).emit('disconnect', listRooms[i]);
        //     console.log('Player [' + socket.data.username + '] leave room [' + socket.room + ']');
        //   }
        // }
        
        break;
      }
      
    }
    for (var i = 0; i < listRooms_frined.length; i++) {
      if (listRooms_frined[i].id == socket.room) {
        listRooms_frined.splice(i, 1);
        break;
      }
    }
  });

}