const timestamp = require('time-stamp');
const historyModel = require("../../model/history/history.model");
const userService=require('../../model/user/user.model')
module.exports.update = (idwinner, idloser, draw,historymove ,chat) => {
    const date = timestamp('DD/MM/YYYY HH:mm:ss');
    const newHistory = historyModel.createHistory(
        idwinner,
        idloser,
        date,
        0,
        draw,
        historymove,
        chat
      );
      userService.editTrophies(idwinner,idloser,false);
  }
  