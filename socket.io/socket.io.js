const historyModel = require("../model/history/history.model");
const userClick = require('../services/checkwin/checkwin')
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
    if (name === undefined) {
      io.sockets.emit("onlineUserServer", userOnline);
    }
    else {
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
    let squares;
    for (let i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === socket.room && (listRooms[i].winner == null)) {
        squares = listRooms[i].squares;
        const history = userClick.handleClick(data.i, squares, data.nextMove);
        if (history.winCells.winCells != null) {
          listRooms[i].winner = history.winCells;
        }
        listRooms[i].squares = history.squares;
      }
      break;
    }
    // const history=userClick.handleClick(data,socket.history,XorO);
    socket.to(socket.room).emit('move', data);
    // mark last move
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id == socket.room) {
        listRooms[i].lastMove = data;
      }
    }
  });
  socket.on('accept',(data)=>{
    console.log(data);
    socket.data = data;

    // find an empty room
    for (var i = 0; i < listRooms.length; i++) {
      // it's empty when there is no second player
      if (listRooms[i].pass === data.pass && listRooms[i].id === data.id_sender) {
        if (listRooms[i].playerO === null) {
          listRooms[i].playerO = data.name_recieve;
          listRooms[i].idplayerO = data.id_recieve;
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          // send successful message to both
         
          socket.to(data.idsocket_sender).emit('already');
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
        else {
          listRooms[i].viewer.push(data);
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
          return;
        }
      }
     

    }
  })

  // let timerequest = 5;
  socket.on('request', function (data) {
    socket.data = data;
    const _data = {
      name: data.nameSender,
      idsocket_sender: socket.id,
      idsender:data.id_send,
      pass:data.id_send
    }
    var room = {
      id: data.id_send,
      playerX: data.nameSender,
      idplayerX: data.id_send,
      playerO: null,
      idplayerO: null,
      pass: data.id_send,
      viewer: [],
      squares: Array(5 * 5).fill(null),
      winner: null
    }
    listRooms.push(room);
    // add this client to the room
    socket.room = room.id;
    socket.history = room.squares;
    socket.join(socket.room);
    //them ban choi vao danh sach cho 
    listWait.push(room.id);
    console.log('Room [' + socket.room + '] created');
    let timerequest = 5;
    function createTimer() {
      interval = setInterval(() => {
        console.log(timerequest);
        timerequest--;
        
       if (timerequest ===0) {
        console.log("da dung");
          socket.emit("timeout");
          clearInterval(interval);
        }
      }, 1000);
    }
    createTimer();
    socket.to(data.idsocket_receive).emit('invite', _data);
  });
  socket.on('undo-result', function (data) {
    socket.to(socket.room).emit('undo-result', data);
  });
  socket.on('createroom', (data) => {
    socket.data = data;
    console.log("data", data);
    for (let i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === data.id_room) {
        socket.emit('exist_room');
        return;
      }
    }
    var room = {
      id: data.id_room,
      playerX: data.name,
      idplayerX: data.id_player,
      playerO: null,
      idplayerO: null,
      pass: data.pass,
      viewer: [],
      squares: Array(5 * 5).fill(null),
      winner: null
    }
    listRooms.push(room);
    // add this client to the room
    socket.room = room.id;
    socket.history = room.squares;
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
        listRooms[i].idplayerO = data.id_player;
        socket.room = listRooms[i].id;
        socket.history = listRooms[i].squares;
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
      id: data.id_room,
      playerX: data.name,
      idplayerX: data.id_player,
      playerO: null,
      idplayerO: null,
      pass: data.pass,
      viewer: [],
      squares: Array(5 * 5).fill(null),
      winner: null
    }
    listRooms.push(room);
    // add this client to the room
    socket.room = room.id;
    socket.history = room.squares;
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
      if (listRooms[i].pass === data.pass && listRooms[i].id === data.id_room) {
        if (listRooms[i].playerO === null) {
          listRooms[i].playerO = data.name;
          listRooms[i].idplayerO = data.id_player;
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
        else {
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
      if (listRooms[i].id === data.roomInfo && (listRooms[i].winner != null)) {
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
    console.log(name, room);
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

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