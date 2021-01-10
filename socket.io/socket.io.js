const historyModel = require("../model/history/history.model");
const userClick = require('../services/checkwin/checkwin')
const clock=require('../services/countdown/countdown')
const userService=require('../model/user/user.model')
const moment = require('moment');
const timestamp = require('time-stamp');
var userOnline = [];
var listRooms = [];
let listPlay = [];
let listWait = [];
const { addUser, removeUser, getUser, getUsersInRoom } = require('../users');


module.exports = function (io, socket) {
  console.log("co ket noi", socket.id);
  socket.on('remove_time',(data)=>{
    const roomInfo=data;
    clock.countdown(roomInfo.time,io,socket,roomInfo.history.length,roomInfo,"yes");
  })
  socket.on('tableonline', () => {
    io.sockets.emit("tableonline_play", listPlay);
    io.sockets.emit("tableonline_wait", listWait);
  })
  socket.on('reconcile', () => {
    socket.to(socket.room).emit('reconcile');
  })
  socket.on('reconcile_agree', () => {
    for (var i = 0; i < listPlay.length; i++) {
      if (listPlay[i] === socket.room) {
        listPlay.splice(i, 1);
        io.sockets.emit("tableonline_play", listPlay);
        io.sockets.emit("tableonline_wait", listWait);
        break;
      }
    }
    console.log("list rooms chua bi huy",listRooms)
    socket.to(socket.room).emit('reconcile_agree',socket.data.name);
  })
  socket.on('reconcile_disagree', () => {
    socket.to(socket.room).emit('reconcile_disagree');
  })
  socket.on('surrender', () => {
    //********************************************* */
    //load cup cua thang thua
    const loser_cup=20
    //load cup thang thang
    const winner_cup=20
    // tru so cup thang thua, cong so cup thang thang
    const res_loser_cup=loser_cup-10;
    const res_winner_cup=winner_cup-10;
    // update lai so cup 2 thang
    // 
    //
    const name=socket.data.name;
    console.log("name kansknaksn ", name);
    socket.to(socket.room).emit('surrender',name);
    console.log(socket.data);
  })
  socket.on('ready', (data) => {
    for (let i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === data.idroom) {

        if (data.name === listRooms[i].playerX) {
          io.in(listRooms[i].id).emit('readyX');
        }
        if (data.name === listRooms[i].playerO) {
          io.in(listRooms[i].id).emit('readyO');
        }
      }
      break;
    }
  })
  socket.on('onlineUser', (data) => {

    if (data === undefined) {
      console.log(userOnline)
      io.sockets.emit("onlineUserServer", userOnline);
      return;
    }
    for (let i = 0; i < userOnline.length; i++) {
      if (userOnline[i].id_player === data.id_player) {
        io.sockets.emit("onlineUserServer", userOnline);
        return;
      }
    }
    var userItem = {
      name: data.name,
      idsocket: socket.id,
      id_player: data.id_player
    }
    userOnline.push(userItem);

    io.sockets.emit("onlineUserServer", userOnline);

  });


  socket.on('move', function (data) {

  
    let squares;
    for (let i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === socket.room && (listRooms[i].winner == null)) {
      
        clock.countdown(listRooms[i].time,io,socket,listRooms[i].history.length,listRooms[i],"no");
        for(let j=0;j<listRooms[i].history.length;j++){
          if(data.i===listRooms[i].history[j])
          {
            return;
          }
        }
        listRooms[i].history.push(data.i);
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
  socket.on('accept', (data) => {
    console.log(data);
    socket.data = data;

    // find an empty room
    for (var i = 0; i < listRooms.length; i++) {
      // it's empty when there is no second player
      if (listRooms[i].pass === data.pass && listRooms[i].id === data.id_sender) {
        if (listRooms[i].playerO === null) {
          listRooms[i].playerO = data.name;
          listRooms[i].idplayerO = data.id_player;
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

  socket.on('cancelroom', (data) => {
  
  if(data !== '1'){
    for (var i = 0; i < listPlay.length; i++) {
      if (listPlay[i] === data.id) {
        listPlay.splice(i, 1);
        break;
      }
    }
   
    for (var i = 0; i < listWait.length; i++) {
      if (listWait[i] === data.id) {
        listWait.splice(i, 1);
        break;
      }
    }
    socket.to(data.id).emit('timeout')
    io.sockets.emit("tableonline_play", listPlay);
    io.sockets.emit("tableonline_wait", listWait);
    // xoa phong khi co nguoi thoat ra (ngau nhien)
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === data.id) {
        listRooms.splice(i, 1);
        break;
      }

    }
  }
  else{
    for (var i = 0; i < listPlay.length; i++) {
      if (listPlay[i] === socket.room) {
        listPlay.splice(i, 1);
        break;
      }
    }
    console.log(listWait);
    for (var i = 0; i < listWait.length; i++) {
      if (listWait[i] === socket.room) {
        listWait.splice(i, 1);
        break;
      }
    }
    // socket.to(socket.room).emit('timeout')
    socket.to(socket.room).emit('outroom');
    io.sockets.emit("tableonline_play", listPlay);
    io.sockets.emit("tableonline_wait", listWait);
    // xoa phong khi co nguoi thoat ra (ngau nhien)
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === socket.room) {
        listRooms.splice(i, 1);
        break;
      }

    }
  }
   console.log('list room cuoi cung ',listRooms);
  });

  // let timerequest = 5;
  socket.on('request', function (data) {
    socket.data = data;
  
    const _data = {
      name: data.name,
      idsocket_sender: socket.id,
      idsender: data.id_send,
      pass: data.id_send
    }
    var room = {
      id: data.id_send,
      playerX: data.name,
      idplayerX: data.id_send,
      playerO: null,
      idplayerO: null,
      pass: data.id_send,
      viewer: [],
      time:data.time,
      squares: Array(20 * 20).fill(null),
      winner: null,
      history: [],
      chat:[]
    }
    listRooms.push(room);
    // add this client to the room
    socket.room = room.id;
    socket.history = room.squares;
    socket.join(socket.room);
    //them ban choi vao danh sach cho 
    listWait.push(room.id);
    console.log('Room [' + socket.room + '] created');
    // let timerequest = 10;
    // function createTimer() {
    //   interval = setInterval(() => {
    //     console.log(timerequest);
    //     timerequest--;

    //    if (timerequest ===0) {
    //     console.log("da dung");
    //       socket.emit("timeout");
    //       clearInterval(interval);
    //     }
    //   }, 1000);
    // }
    // createTimer();
    console.log('data ',_data);
    socket.to(data.idsocket_receive).emit('invite', _data);
  });
  socket.on('undo-result', function (data) {
    socket.to(socket.room).emit('undo-result', data);
  });
  socket.on('createroom', (data) => {
    console.log("create room ",data);
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
      time:data.time,
      viewer: [],
      squares: Array(20 * 20).fill(null),
      winner: null,
      history: [],
      chat:[]
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
    console.log("list room ",listRooms);
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
      if (listRooms[i].playerX === "DISCONNECTED" && listRooms[i].idplayerX === data.id_player) {
        listRooms[i].playerX = data.name;
        socket.room = listRooms[i].id;
        socket.join(socket.room);
        io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
        io.in(listRooms[i].id).emit('re_reconnect', listRooms[i].history);
        return;
      }
      if (listRooms[i].playerO === "DISCONNECTED" && listRooms[i].idplayerO === data.id_player) {
        listRooms[i].playerO = data.name;
        socket.room = listRooms[i].id;
        socket.join(socket.room);
        io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
        io.in(listRooms[i].id).emit('re_reconnect', listRooms[i].history);
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
      time:data.time,
      squares: Array(20 * 20).fill(null),
      winner: null,
      history: [],
      chat:[]
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
    console.log(data);
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === data.id_room && listRooms[i].pass === data.pass) {
        if (listRooms[i].playerX === "DISCONNECTED" && listRooms[i].idplayerX === data.id_player) {

          listRooms[i].playerX = data.name;
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
          io.in(listRooms[i].id).emit('re_reconnect', listRooms[i].history);
          return;
        }
        if (listRooms[i].playerO === "DISCONNECTED" && listRooms[i].idplayerO === data.id_player) {
          listRooms[i].playerO = data.name;
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
          io.in(listRooms[i].id).emit('re_reconnect', listRooms[i].history);
          return;
        }
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
        else {
          console
          listRooms[i].viewer.push(data);
          socket.room = listRooms[i].id;
          socket.join(socket.room);
          io.in(listRooms[i].id).emit('joinroom-success', listRooms[i]);
        
          io.to(socket.id).emit('loadhistory', listRooms[i].history);
          return;

        }

      }
    }
    socket.emit('no-room', "ok");
    // create new room if there is no empty one

  });
  socket.on('infoWinnerNotification',({data,roomInfo})=>{
    const namewinner=(data.winner==='X') ? roomInfo.playerX:roomInfo.playerO;
    clock.countdown(roomInfo.time,io,socket,roomInfo.history.length,roomInfo,"yes");
    socket.emit('infoWinnerNotification',namewinner);
  })
  socket.on('infoWinner', (data) => {
    console.log("winner winner chicken dinner " ,data);
    io.to(socket.room).emit('outroom');
    for (var i = 0; i < listRooms.length; i++) {

      // it's empty when there is no second player
      if (listRooms[i].id === data.roomInfo && (listRooms[i].winner != null)) {
        const player1 = data.winner === 'X' ? listRooms[i].idplayerX : listRooms[i].idplayerO;
        const player2 = data.winner === 'X' ? listRooms[i].idplayerO : listRooms[i].idplayerX;
        const date = timestamp('DD/MM/YYYY HH:mm:ss');
        console.log("ok");
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
  socket.on('join_chat', ({ name, room,roomInfo }, callback) => {
    
    name = name.slice(1, name.length - 1);

    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.` });
    for(let i=0;i<listRooms.length;i++){
      if(listRooms[i].id===roomInfo.id){
        socket.emit('oldchat',roomInfo.chat);
      }
    }
   
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });
  socket.on('sendMessage', ({message,roomInfo}, callback) => {
    const user = getUser(socket.id);
    const usermessage={
      user: user.name, 
      text: message 
    }
    for(let i=0;i<listRooms.length;i++){
      if(listRooms[i].id===roomInfo.id){
        listRooms[i].chat.push(usermessage);
      }
    }
   
    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });
  socket.on('go_back', (data) => {
    socket.removeAllListeners();

    // xoa user chat
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
    // xoa phong khi co nguoi thoat ra (ngau nhien)
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === socket.room) {
        if (listRooms[i].playerO === null) {
          listRooms.splice(i, 1);
          console.log('Room [' + socket.room + '] destroyed');
        }
        else {
          if (listRooms[i].playerO === socket.data.name) {
            listRooms[i].playerO = 'GOBACK';
          }
          if (listRooms[i].playerX === socket.data.name) {
            listRooms[i].playerX = 'GOBACK';
          }
          // inform the other
        
          if (listRooms[i].playerX === 'GOBACK' && listRooms[i].playerO === 'GOBACK') {
         
            for(let j=0;j<listPlay.length;j++){
              if(listPlay[j]===listRooms[i].id)
              listPlay.splice(j, 1);
            }
            for(let e=0;e<listWait.length;e++){
              if(listWait[e]===listRooms[i].id)
              listWait.splice(e, 1);
            }
            listRooms.splice(i, 1);
          
           
            io.sockets.emit("tableonline_play", listPlay);
            io.sockets.emit("tableonline_wait", listWait);
            console.log("play ",listPlay);
            console.log('wait ',listWait);
            console.log('room ',listRooms);
          }
        }
        break;
      }
    }
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
      if (userOnline[i].idsocket === socket.id) { // nếu là sinh viên cần xóa
        userOnline.splice(i, 1);
        break;
      }
    }
    io.sockets.emit("onlineUserServer", userOnline);
    console.log('user disconnected', socket.id);
    socket.leave(socket.room);




    //xoa phong choi/cho khi nguoi do thoat
    // for (var i = 0; i < listPlay.length; i++) {
    //   if (listPlay[i] === socket.room) {
    //     if(listRooms[i].playerO===null){
    //       listPlay.splice(i, 1);
    //       break;
    //     }
    //   }
    // }
    // for (var i = 0; i < listWait.length; i++) {
    //   if (listWait[i] === socket.room) {
    //     listWait.splice(i, 1);
    //     break;
    //   }
    // }
    io.sockets.emit("tableonline_play", listPlay);
    io.sockets.emit("tableonline_wait", listWait);
    // xoa phong khi co nguoi thoat ra (ngau nhien)
    for (var i = 0; i < listRooms.length; i++) {
      if (listRooms[i].id === socket.room) {
        if (listRooms[i].playerO === null) {
          listRooms.splice(i, 1);
          console.log('Room [' + socket.room + '] destroyed');
        }
        else {
          if (listRooms[i].playerO === socket.data.name) {
            listRooms[i].playerO = 'DISCONNECTED';
          }
          if (listRooms[i].playerX === socket.data.name) {
            listRooms[i].playerX = 'DISCONNECTED';
          }
          // inform the other
        
          io.to(listRooms[i].id).emit('disconnected', listRooms[i]);
          console.log('Player [' + socket.data.name + '] leave room [' + socket.room + ']');
          if (listRooms[i].playerX === 'DISCONNECTED' && listRooms[i].playerO === 'DISCONNECTED') {
            
            for(let j=0;j<listPlay.length;j++){
              if(listPlay[j]===listRooms[i].id)
              listPlay.splice(j, 1);
            }
            for(let e=0;e<listWait.length;e++){
              if(listWait[e]===listRooms[i].id)
              listWait.splice(e, 1);
            }
            listRooms.splice(i, 1);
            console.log('palyroom ',listPlay);
            console.log('wait room ',listWait);
            console.log(' room ',listRooms);
            io.sockets.emit("tableonline_play", listPlay);
            io.sockets.emit("tableonline_wait", listWait);
            console.log('Room [' + socket.room + '] destroyed');
          }
        }
        break;
      }
    }
  });


}