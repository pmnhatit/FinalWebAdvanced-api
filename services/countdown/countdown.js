module.exports.countdown =  (timerequest,io,socket,n,listRoom)=>{
  if(n!==0){
    clearInterval(interval);
    interval = setInterval(() => {
    
      io.in(socket.room).emit('time',timerequest);
      timerequest--;

     if (timerequest ===-1) {
       let nameTimeOut=null;
       let id_player_winner=null;
       let id_player_loser=null;
       if(socket.data.name===listRoom.playerX)
       {
         nameTimeOut=listRoom.playerO;
         id_player_winner=listRoom.idplayerX;
       }
       if(socket.data.name===listRoom.playerO)
       {
          nameTimeOut=listRoom.playerX;
          id_player_loser=listRoom.playerO;
       }
       //===================================================
       //***********load so cup 2 thang dua vao id
      // const loser_cup= /* code vao day */
      //const winner_cup= /* code vao day */
      // ************tinh toan lai so cup moi thang
      // const res_loser_cup=loser_cup-10;
      // const res_winner_cup=winner_cup-10;
      //************update lai so cup moi thang
      /*code o day */
         io.in(socket.room).emit("timing_out",nameTimeOut);
        clearInterval(interval);
      }
    }, 1000);
  }
  else{
    interval = setInterval(() => {
      io.in(socket.room).emit('time',timerequest);
      timerequest--;

     if (timerequest ===-1) {
     
      let nameTimeOut=null;
      let id_player_winner=null;
      let id_player_loser=null;
      if(socket.data.name===listRoom.playerX)
      {
        nameTimeOut=listRoom.playerO;
        id_player_winner=listRoom.idplayerX;
      }
      if(socket.data.name===listRoom.playerO)
      {
         nameTimeOut=listRoom.playerX;
         id_player_loser=listRoom.playerO;
      }
      //===================================================
      //***********load so cup 2 thang dua vao id
     // const loser_cup= /* code vao day */
     //const winner_cup= /* code vao day */
     // ************tinh toan lai so cup moi thang
     // const res_loser_cup=loser_cup-10;
     // const res_winner_cup=winner_cup-10;
     //************update lai so cup moi thang
     /*code o day */
        io.in(socket.room).emit("timing_out",nameTimeOut);
       clearInterval(interval);
      }
    }, 1000);
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