const historyModel = require("../model/history/history.model");

const moment = require('moment');
const timestamp = require('time-stamp');
var userOnline = [];
var listRooms = [];
let listPlay = [];
let listWait = [];
const { addUser, removeUser, getUser, getUsersInRoom } = require('../users');

module.exports = function (io, socket) {
  console.log("co ket noi", socket.id);
  socket.on('tableonline', () => {
    io.sockets.emit("tableonline_play", listPlay);
    io.sockets.emit("tableonline_wait", listWait);
  })
  socket.on('onlineUser', (name) => {
    if(name===undefined){
      io.sockets.emit("onlineUserServer", userOnline);
    }
    else{
      var userItem = {
        name: name,
        id: socket.id
      }
      userOnline.push(userItem);
      console.log(userOnline);
      io.sockets.emit("onlineUserServer", userOnline);
    }
 


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
  socket.on('createroom', (data) => {
    socket.data = data;
    console.log("data", data);
    for(let i=0;i<listRooms.length;i++){
      if(listRooms[i].id===data.id){
        socket.emit('exist_room');
        return;
      }
    }
    var room = {
      id: data.id,
      playerX: data.name,
      idplayerX: data.id,
      playerO: null,
      idplayerO: null,
      pass: data.pass,
      viewer: []
    }
    listRooms.push(room);
    // add this client to the room
    socket.room = room.id;
    socket.join(socket.room);
    //them ban choi vao danh sach cho 
    listWait.push(room.id);
    console.log('Room [' + socket.room + '] created');
  })
  socket.on('joinroom_quick', function (data) {

    // save data
    socket.data = data;
    for (var i = 0; i < listRooms.length; i++) {
        if (listRooms[i].playerO == null) {
          listRooms[i].playerO = data.name;
          listRooms[i].idplayerO = data.id;
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          // send successful message to both
          io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
          for (var i = 0; i < listWait.length; i++) {
            if (listWait[i] === socket.room) {
              listWait.splice(i, 1);
              listPlay.push(socket.room);
            }
          }
          console.log('Room [' + socket.room + '] played');
          return;
        }
    }
    var room = {
      id: data.id,
      playerX: data.name,
      idplayerX: data.id,
      playerO: null,
      idplayerO: null,
      pass: data.pass,
      viewer: []
    }
    listRooms.push(room);
    // add this client to the room
    socket.room = room.id;
    socket.join(socket.room);
    //them ban choi vao danh sach cho 
    listWait.push(room.id);
    console.log('Room [' + socket.room + '] created');
    
  });
  socket.on('joinroom', function (data) {

    // save data
    socket.data = data;

    // find an empty room
    for (var i = 0; i < listRooms.length; i++) {
      // it's empty when there is no second player
      if (listRooms[i].pass === data.pass && listRooms[i].id === data.id) {
        console.log("ten  o ",listRooms[i].playerO);
        if (listRooms[i].playerO === null) {
          listRooms[i].playerO = data.name;
          listRooms[i].idplayerO = data.id;
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          // send successful message to both
          io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
          for (var i = 0; i < listWait.length; i++) {
            if (listWait[i] === socket.room) {
              listWait.splice(i, 1);
              listPlay.push(socket.room);
            }
          }
          console.log('Room [' + socket.room + '] played');
          return;
        }
        else{
          listRooms[i].viewer.push(data);
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
          return;
        }
      }
      // fill empty seat and join room

    }
    socket.emit('no-room', "ok");
    // create new room if there is no empty one

  });

  socket.on('infoWinner', (data) => {
    for (var i = 0; i < listRooms.length; i++) {

      // it's empty when there is no second player
      if (listRooms[i].id === data.roomInfo) {
        const player1 = data.winner === 'X' ? listRooms[i].idplayerX : listRooms[i].idplayerO;

        const player2 = data.winner === 'X' ? listRooms[i].idplayerO : listRooms[i].idplayerX;
        const date = timestamp('DD/MM/YYYY');

        const newHistory = historyModel.createHistory(
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
    // name = name.slice(1, name.length - 1);
    console.log(name,room);
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    console.log(message);
    console.log(user.room);
    console.log(socket.room);
    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });
  socket.on('disconnect', () => {
    console.log("disconnect");
    socket.removeAllListeners();
    // xoa user chat
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }


    // xoa nguoi dung dang online
    for (var i = 0; i < userOnline.length; i++) {
      if (userOnline[i].id === socket.id) { // nếu là sinh viên cần xóa
        userOnline.splice(i, 1);
        break;
      }
    }
    io.sockets.emit("onlineUserServer", userOnline);
    console.log('user disconnected', socket.id);
    socket.leave(socket.room);




    //xoa phong choi/cho khi nguoi do thoat
    for (var i = 0; i < listPlay.length; i++) {
      if (listPlay[i] === socket.room) {
        listPlay.splice(i, 1);
        break;
      }
    }
    for (var i = 0; i < listWait.length; i++) {
      if (listWait[i] === socket.room) {
        listWait.splice(i, 1);
        break;
      }
    }
    io.sockets.emit("tableonline_play", listPlay);
    io.sockets.emit("tableonline_wait", listWait);
    // xoa phong khi co nguoi thoat ra (ngau nhien)
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === socket.room) {
        listRooms.splice(i, 1);
        break;
      }

    }
  });


}