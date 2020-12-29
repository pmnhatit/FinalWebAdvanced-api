module.exports.handleClick =  (i,history,nextMove)=>{
  
  
   const squares = history;
        if ( squares[i] === null) {
            squares[i] = nextMove ? "X" : "O";
            const XorO = nextMove ? "X" : "O";
            const winCells = checkWin(i, XorO, squares);
            // return squares;
          
            return{
                winCells,
                squares
    
            }
        }
}


const size=5;
function  checkWin(i, user,history){
    
 
      
        const current = history;
        // console.log("current ",current);
        const squares = current;
    
        // Get coordinates
        const col =  i % size;
        const row =  Math.floor(i / size);
      
        let coorX = row;
        let coorY = col;
    
        let countCol = 1;
        let countRow = 1;
        let countMainDiagonal = 1;
        let countSkewDiagonal = 1;
        let isBlock;
        const rival = (user) ? "O" : "X";
        
        // Check col
        isBlock = true;
        let winCells = [];
        coorX -= 1;
       
        let t=coorX * size + coorY;
        while(coorX >= 0 && squares[t] === user) {
            countCol += 1;
             t=coorX * size + coorY;
            winCells.push(t);
            coorX -= 1;
            t=coorX * size + coorY;
        }
        t=coorX * size + coorY;
        if (coorX >= 0 && squares[t] !== rival) {
            isBlock = false;
        }
        coorX = row;
         t=coorX * size + coorY;
        winCells.push(t);
        coorX += 1;
        t=coorX * size + coorY;
        while(coorX <= size - 1 && squares[t] === user) {
            countCol += 1;
             t=coorX * size + coorY;
            winCells.push(t);
            coorX += 1;
            t=coorX * size + coorY;
        }
        t=coorX * size + coorY;
        if (coorX <= size - 1 && squares[t] !== rival) {
            isBlock = false;
        }
        coorX = row;
        if (isBlock === false && countCol >= 4) 
        return {
            winCells,
            user
        };
    
        // Check row
        isBlock = true;
        winCells = [];
        coorY -= 1;
        t=coorX * size + coorY;
        while(coorY >= 0 && squares[t] === user) {
            countRow += 1;
             t=coorX * size + coorY;
            winCells.push(t);
            coorY -= 1;
            t=coorX * size + coorY;
        }
        t=coorX * size + coorY;
        if (coorY >= 0 && squares[t] !== rival) {
            isBlock = false;
        }
        coorY = col;
         t=coorX * size + coorY;
        winCells.push(t);
        coorY += 1;
        t=coorX * size + coorY;
        while(coorY <= size - 1 && squares[t] === user) {
            countRow += 1;
             t=coorX * size + coorY;
            winCells.push(t);
            coorY += 1;
            t=coorX * size + coorY;
        }
        t=coorX * size + coorY;
        if (coorY <= size - 1 && squares[t] !== rival) {
            isBlock = false;
        }
        coorY = col;
       
        if (isBlock === false && countRow >= 4) 
        return {
            winCells,
            user
        };
    
        // Check main diagonal
        isBlock = true;
        winCells = [];
        coorX -= 1;
        coorY -= 1;
        t=coorX * size + coorY;
        while(coorX >= 0 && coorY >= 0 && squares[t] === user) {
            countMainDiagonal += 1;
             t=coorX * size + coorY;
            winCells.push(t);
            coorX -= 1;
            coorY -= 1;
            t=coorX * size + coorY;
        }
        t=coorX * size + coorY;
        if (coorX >= 0 && coorY >= 0 && squares[t] !== rival) {
            isBlock = false;
        }
        coorX = row;
        coorY = col;
        t=coorX * size + coorY;
        winCells.push(t);
        coorX += 1;
        coorY += 1;
        t=coorX * size + coorY;
        while(coorX <= size - 1 && coorY <= size - 1 && squares[t] === user) {
            countMainDiagonal += 1;
             t=coorX * size + coorY;
            winCells.push(t);
            coorX += 1;
            coorY += 1;
            t=coorX * size + coorY;
        }
        t=coorX * size + coorY;
        if (coorX <= size - 1 && coorY <= size - 1 && squares[t] !== rival) {
            isBlock = false;
        }
        coorX = row;
        coorY = col;
        if (isBlock === false && countMainDiagonal >= 4) 
        return {
            winCells,
            user
        };
    
        // Check skew diagonal
        isBlock = true;
        winCells = [];
        coorX -= 1;
        coorY += 1;
        t=coorX * size + coorY;
        while(coorX >= 0 && coorY >= 0 && squares[t] === user) {
            countSkewDiagonal += 1;
             t=coorX * size + coorY;
            winCells.push(t);
            coorX -= 1;
            coorY += 1;
            t=coorX * size + coorY;
        }
        t=coorX * size + coorY;
        if (coorX >= 0 && coorY >= 0 && squares[t] !== rival) {
            isBlock = false;
        }
        coorX = row;
        coorY = col;
         t=coorX * size + coorY;
        winCells.push(t);
        coorX += 1;
        coorY -= 1;
        t=coorX * size + coorY;
        while(coorX <= size - 1 && coorY <= size - 1 && squares[t] === user) {
            countSkewDiagonal += 1;
             t=coorX * size + coorY;
            winCells.push(t);
            coorX += 1;
            coorY -= 1;
            t=coorX * size + coorY;
        }
        t=coorX * size + coorY;
        if (coorX <= size - 1 && coorY <= size - 1 && squares[t] !== rival) {
            isBlock = false;
        }
        if (isBlock === false && countSkewDiagonal >= 4) 
        return {
            winCells,
            user
        };
    
        return {
            winCells:null,
            user:null
        };
    
}