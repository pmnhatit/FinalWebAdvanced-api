const userService=require('../../model/user/user.model');
const saveUpdate=require('../saveupdate/saveupdate')
const timestamp = require('time-stamp');
module.exports.countdown = (timerequest, io, socket, n, listRoom,stop) => {

  if(stop==='no'){
    if (n !== 0) {
      clearInterval(interval);
      interval = setInterval(() => {
  
        io.in(socket.room).emit('time', timerequest);
        timerequest--;
  
        if (timerequest === -1) {
          let nameTimeOut = null;
          let id_player_winner = null;
          let id_player_loser = null;
          if (socket.data.name === listRoom.playerX) {
            nameTimeOut = listRoom.playerO;
            id_player_winner = listRoom.idplayerX;
            id_player_loser=listRoom.idplayerO;
          }
          if (socket.data.name === listRoom.playerO) {
            nameTimeOut = listRoom.playerX;
            id_player_winner = listRoom.idplayerO;
            id_player_loser=listRoom.idplayerX;
          }
          
          saveUpdate.update(id_player_winner,id_player_loser,false,listRoom.history,listRoom.chat);
          io.in(socket.room).emit("timing_out", nameTimeOut);
          clearInterval(interval);
        }
      }, 1000);
    }
    else {
      interval = setInterval(() => {
        io.in(socket.room).emit('time', timerequest);
        timerequest--;
  
        if (timerequest === -1) {
  
          let _nameTimeOut = null;
          let _id_player_winner = null;
          let _id_player_loser = null;
  
          if (socket.data.name === listRoom.playerX) {
            _nameTimeOut = listRoom.playerO;
            _id_player_winner = listRoom.idplayerX;
            _id_player_loser= listRoom.idplayerO;
          }
          if (socket.data.name === listRoom.playerO) {
            _nameTimeOut = listRoom.playerX;
            _id_player_winner = listRoom.idplayerO;
            _id_player_loser = listRoom.idplayerX;
          }
          saveUpdate.update(_id_player_winner,_id_player_loser,false,listRoom.history,listRoom.chat);
        
          io.in(socket.room).emit("timing_out", _nameTimeOut);
          clearInterval(interval);
        }
      }, 1000);
    }
  
  }
  if(stop==='yes'){
    clearInterval(interval);
  }
  
}


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