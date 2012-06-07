importScripts('binCpu.js')

var showProcess = false

var boardPosition, 
  whosTurn, enPassantHistory, castleHistory, castleCheckBlack, castleCheckWhite,
  checkHistory, checkWhite, checkBlack, checkmateW, checkmateB, moveCount,
  side, depth

self.addEventListener('message', function(e) {

  var data = e.data;
  
   boardPosition = JSON.parse(data.boardPosition)
   WB = JSON.parse(data.WB)
   WB90 = JSON.parse(data.WB90)
   WB45cl = JSON.parse(data.WB45cl)
   WB45cc = JSON.parse(data.WB45cc)
   P = JSON.parse(data.P)
   BB = JSON.parse(data.BB)
   BB90 = JSON.parse(data.BB90)
   BB45cl = JSON.parse(data.BB45cl)
   BB45cc = JSON.parse(data.BB45cc)
   p = JSON.parse(data.p)
   whosTurn = data.whosTurn
   enPassantHistory = JSON.parse(data.enPassantHistory)
   castleHistory = JSON.parse(data.castleHistory)
   checkHistory = JSON.parse(data.checkHistory)
   castleCheckBlack = JSON.parse(data.castleCheckBlack)
   castleCheckWhite = JSON.parse(data.castleCheckWhite)
   checkWhite = JSON.parse(data.checkWhite)
   checkBlack = JSON.parse(data.checkBlack)
   checkmateW = data.checkmateW
   checkmateB = data.checkmateB
   moveCount = data.moveCount
   side = JSON.parse(data.side)
   depth = JSON.parse(data.depth)
   eg = data.eg
   
   cpu( side,depth, eg )
            
}, false);


function search( init_side, side, init_depth, depth, alpha, beta, eg, quiesce, sorting )
{  
  var z1, z2, z3,
  best_score = -Infinity, move_score, score, static_score=0, opponentside,
  best_move = [], alpha_move = [],
  position, count = 0, stalemate=0
  
  switch (side)
  {
    case 1:
      z1 = 0
      z2 = 2
      z3 = 3 // opponents moves - for calculating stalemate
      break
    case 0:
      z1 = 1
      z2 = 3
      z3 = 2 // opponents moves - for calculating stalemate
      break
  }
  
  position = az()[z2]
  
  //LIMIT MOVES SEARCHED (FOR DEBUG)
  var limitSearch = false
  
  if ( init_depth && limitSearch )
  {
    var testMoves = [ 'c3d5', 'h1d1' ], testFrom = [], testArr = []
    
    //convert moves to board positions
    for (var test in testMoves)
    {
      testArr[ boardPositionNames.indexOf( testMoves[test].substr(0,2) ) ] = boardPositionNames.indexOf( testMoves[test].substr(-2) )
      testFrom.push( boardPositionNames.indexOf( testMoves[test].substr(0,2) ) )
    }
    
    //remove all other moves from position
    for (var test=position.length-1; test>=0; test--)
    {
      if ( testFrom.indexOf( test ) == -1 ) position[ test ] = []
      else
      {
        for (var test1=position[ test ].length-1; test1>=0; test1--)
        {
          if ( position[ test ][ test1 ] != testArr[ test ] ) position[ test ].splice( test1, 1 )
        }
      }
    }
    
    self.postMessage({'alert': 'spliced position: ' + JSON.stringify( position ) })
  }
  //END LIMIT SEARCHED MOVES
  
  //sort
  var moves = []
  
  for (var f in position)
  {
    for (var g=position[f].length-1; g>=0; g--)
    {
      var moveTo = Number( position[ f ][ g ] ),
          moveFrom = Number( f ),
          move = {}
      
      move.flag = 0
      move.adj = 0
      move.order = 4
      
      if( Math.abs( boardPosition[ moveTo ] ) == 1 )
      {
        self.postMessage({ 'alert': 'debug king attack:\n' + 
              'depth: ' + depth + '\n' +
              'side: ' + side + '\n' + 
              f + '-' + position[f][g] })
        position[f].splice(g,1)
      }
      else
      {
        switch( boardPosition[ f ] )
        {
          case 6:
            if ( moveTo < 8 ) // promotion
            {
              move.from = moveFrom
              move.to = moveTo
              move.frompc = 6
              move.promote = 2
              move.type = 'pawn'
              move.order = 2
              move.flag = 'promote'
              if ( boardPosition[ moveTo ] )
              {
                move.topc = Number( boardPosition[ moveTo ] )
                move.type = 'capture'
                move.order = 1
              }
            }
            else if ( position[f]['e'] && g == position[ f ].length-1 ) // en passant
            {
              move.ep = move.to+8
              move.from = moveFrom
              move.to = moveTo
              move.frompc = 6
              move.topc = -6
              move.type = 'capture'
              move.order = 1
              move.flag = 'ep'
            }
            else if ( boardPosition[ moveTo ] )
            {
              move.from = moveFrom
              move.to = moveTo
              move.frompc = 6
              move.topc = Number( boardPosition[ moveTo ] )
              move.type = 'capture'
              move.order = 1
            }
            else
            {
              move.from = moveFrom
              move.to = moveTo
              move.frompc = 6
              move.type = 'pawn'
              move.order = 2
              if ( moveFrom - moveTo == 16 ) enPassantHistory[moveCount] = moveFrom
            }
            
            moves.push( move )
            
            break
          case -6:
            if ( moveTo > 55 ) // promotion
            {
              move.from = moveFrom
              move.to = moveTo
              move.frompc = -6
              move.promote = -2
              move.type = 'pawn'
              move.order = 2
              move.flag = 'promote'
              if ( boardPosition[ moveTo ] )
              {
                move.topc = Number( boardPosition[ moveTo ] )
                move.type = 'capture'
                move.order = 1
              }
            }
            else if ( position[f]['e'] && g == position[ f ].length-1 ) // en passant
            {
              move.ep = move.to-8
              move.from = moveFrom
              move.to = moveTo
              move.frompc = -6
              move.topc = 6
              move.type = 'capture'
              move.order = 1
              move.flag = 'ep'
            }
            else if ( boardPosition[ moveTo ] )
            {
              move.from = moveFrom
              move.to = moveTo
              move.frompc = -6
              move.topc = Number( boardPosition[ moveTo ] )
              move.type = 'capture'
              move.order = 1
            }
            else
            {
              move.from = moveFrom
              move.to = moveTo
              move.frompc = -6
              move.type = 'pawn'
              move.order = 2
              if ( moveTo - moveFrom == 16 ) enPassantHistory[moveCount] = moveFrom
            }
            
            moves.push( move )
            
            break
          case 3:
            move.from = moveFrom
            move.to = moveTo
            move.frompc = 3
            if ( boardPosition[ moveTo ] )
            {
              move.topc = Number( boardPosition[ moveTo ] )
              move.type = 'capture'
              move.order = 1
            }
            castleHistory[moveCount] = moveFrom
            if ( castleHistory.indexOf( 60 ) == -1 ) move.adj = -100 //penalty for losing castling privilege
            
            moves.push( move )
            
            break
          case -3:
            move.from = moveFrom
            move.to = moveTo
            move.frompc = -3
            if ( boardPosition[ moveTo ] )
            {
              move.topc = Number( boardPosition[ moveTo ] )
              move.type = 'capture'
              move.order = 1
            }
            castleHistory[moveCount] = moveFrom
            if ( castleHistory.indexOf( 4 ) == -1 ) move.adj = -100 //penalty for losing castling privilege
            
            moves.push( move )
            
            break
          case 1:
            move.from = moveFrom
            move.to = moveTo
            move.frompc = 1
            if ( boardPosition[ moveTo ] )
            {
              move.topc = Number( boardPosition[ moveTo ] )
              move.type = 'capture'
            }
            if ( move.from == 60 && move.to == 62 )
            {
              move.flag = 'castle'
              move.rook = {'from': 63, 'to': 61, 'pc': 3}
              move.adj = 100 //encourage castling
            }
            if ( move.from == 60 && move.to == 58 )
            {
              move.flag = 'castle'
              move.rook = {'from': 56, 'to': 59, 'pc': 3}
              move.adj = 100 //encourage castling
            }
            if ( castleHistory.indexOf( 60 ) == -1 )
            {
              castleHistory[moveCount] = 60
              move.adj = -100 //penalty for losing castling privilege
            }
            
            moves.push( move )
            
            break
          case -1:
            move.from = moveFrom
            move.to = moveTo
            move.frompc = -1
            if ( boardPosition[ moveTo ] )
            {
              move.topc = Number( boardPosition[ moveTo ] )
              move.type = 'capture'
              move.order = 1
            }
            if ( move.from == 4 && move.to == 6 )
            {
              move.flag = 'castle'
              move.rook = {'from': 7, 'to': 5, 'pc': -3}
              move.adj = 100 //encourage castling
            }
            if ( move.from == 4 && move.to == 2 )
            {
              move.flag = 'castle'
              move.rook = {'from': 0, 'to': 3, 'pc': -3}
              move.adj = 100 //encourage castling
            }
            if ( castleHistory.indexOf( 4 ) == -1 )
            {
              castleHistory[moveCount] = 4
              move.adj = -100 //penalty for losing castling privilege
            }
            
            moves.push( move )
            
            break
          case 2:
          case -2:
            move.from = moveFrom
            move.to = moveTo
            move.frompc = Number( boardPosition[ moveFrom ] )
            if ( boardPosition[ moveTo ] )
            {
              move.topc = Number( boardPosition[ moveTo ] )
              move.type = 'capture'
              move.order = 1
            }
            if ( moveCount < 12 ) move.adj = -96 //discourage early queen moves
            
            moves.push( move )
            
            break
          case 4:
          case -4:
          case 5:
          case -5:
            move.from = moveFrom
            move.to = moveTo
            move.frompc = Number( boardPosition[ moveFrom ] )
            if ( boardPosition[ moveTo ] )
            {
              move.topc = Number( boardPosition[ moveTo ] )
              move.type = 'capture'
              move.order = 1
            }
            
            moves.push( move )
            
            break
        }
      }
    }
  }
  
  if ( init_depth ) self.postMessage({ 'total': moves.length*2 })
  
  //Sort moves for root by score for depth 1 search
  if ( init_depth )
  {
    for (var b=0; b<moves.length; b++)
    {  
      moveCount++
  
      make( moves[b] )
      
      score = az()
      static_score = score[z1]
      
      //add move type 'check'  
      if ( side ? checkBlack.length > 0 : checkWhite > 0 )
      {
        moves[b].type = 'check'
        moves[b].order = 3
      }
      
      if ( eg && !( side ? checkmateB : checkmateW ) ) // evaluate stalemate
      {
        stalemate = 1
        
        for ( var w in score[z3] )
        {
          if ( score[z3][w].length > 0 ) stalemate = 0
        }
        
        if ( stalemate ) static_score -= 30000
      }
      
      opponentside = ( side == 1 ? 0 : 1 )
      
      if ( side ? checkmateB : checkmateW ) move_score = static_score
      else move_score = -search( init_side, opponentside, 0, 0, -beta, -alpha, eg, quiesce, 1 )[0]

      move_score += moves[b].adj //adjustment
      
      moves[b].score = move_score
      
      moveCount--
      
      unmake( moves[b] )
      
      checkBlack = []
      checkWhite = []
      checkmateW = 0
      checkmateB = 0
      
      self.postMessage ({ 'count': ++count })
    }
    
    moves.sort( function(a,b){ return b.score - a.score } )
  }
  else moves.sort( function(a,b){ return a.order - b.order } ) //order moves for tree by captures, pawn pushes, checks and rest of moves
    
  //SEARCH
  for (var b=0; b<moves.length; b++)
  {  
    moveCount++
  
    make( moves[b] )
    
    score = az()
    static_score = score[z1]
  
    if ( eg && !( side ? checkmateB : checkmateW ) ) // evaluate stalemate
    {
      stalemate = 1
      
      for ( var w in score[z3] )
      {
        if ( score[z3][w].length > 0 ) stalemate = 0
      }
      
      if ( stalemate ) static_score -= 30000
    }
    
    //search deeper if check
    switch( quiesce )
    {
      case 0:
        if ( eg && depth == 0 && !sorting && side != init_side && ( side ? checkBlack.length > 0 : checkWhite.length > 0 ) )
        {
          quiesce = 1
          depth = 1
        }
        break
    }
    
    opponentside = (side == 1) ? 0 : 1
    
    if ( depth == 0 || ( side ? checkmateB : checkmateW ) ) move_score = static_score
    else move_score = -search( init_side, opponentside, 0, depth-1, -beta, -alpha, eg, quiesce, 0 )[0]
    
    move_score += moves[b].adj //adjustment
    
    moveCount--
    
    unmake( moves[b] )
    
    checkBlack = []
    checkWhite = []
    checkmateW = 0
    checkmateB = 0
    
    if ( init_depth ) self.postMessage ({ 'count': ++count })
    
    if (move_score > best_score) 
    {
      best_score = move_score
      best_move = [moves[b].from, moves[b].to]
    }
    if (best_score > alpha) 
    {
      alpha = best_score
      alpha_move = best_move.slice(0)
    }
    
    //send back move info
    if ( showProcess ) self.postMessage({ 'msg': {'depth':depth, 'piece': moves[b].frompc, 'pieceTaken': moves[b].topc, 'from': moves[b].from, 'to': moves[b].to, 'type': moves[b].flag, 'score': move_score, 'bstscore': best_score, 'alpha': alpha, 'beta': beta, 'cutoff': (alpha>beta?'*':'')} })
    
    if ( alpha >= beta && !stalemate ) return [alpha, alpha_move]
  }
  
  return [best_score, best_move]
}

function make( move )
{
  switch( move.flag )
  {
    case 0:
      boardPosition[ move.to ] = move.frompc
      boardPosition[ move.from ] = 0
      updateBoards( move.from, move.to, move.frompc )
      if ( move.topc ) updateBoards( move.to, move.to, move.topc )
      break
    case 'ep':
      boardPosition[ move.to ] = move.frompc
      boardPosition[ move.from ] = 0
      boardPosition[ move.ep ] = 0
      updateBoards( move.from, move.to, move.frompc )
      updateBoards( move.ep, move.ep, move.topc )
      break
    case 'promote':
      boardPosition[ move.to ] = move.promote
      boardPosition[ move.from ] = 0
      updateBoards( move.from, move.to, move.frompc )
      if ( move.topc ) updateBoards( move.to, move.to, move.topc ) 
      break
    case 'castle':
      boardPosition[ move.to ] = move.frompc
      boardPosition[ move.from ] = 0
      boardPosition[ move.rook.to ] = move.rook.pc
      boardPosition[ move.rook.from ] = 0
      updateBoards( move.from, move.to, move.frompc )
      updateBoards( move.rook.from, move.rook.to, move.rook.pc )
      break
  }
}

function unmake( move )
{
  switch( move.flag )
  {
    case 0:
      boardPosition[ move.from ] = move.frompc
      boardPosition[ move.to ] = ( move.topc ) ? move.topc : 0
      updateBoards( move.to, move.from, move.frompc )
      if ( move.topc ) updateBoards( move.to, move.to, move.topc )
      break
    case 'ep':
      boardPosition[ move.from ] = move.frompc
      boardPosition[ move.to ] = 0
      boardPosition[ move.ep ] = move.topc
      updateBoards( move.to, move.from, move.frompc )
      updateBoards( move.ep, move.ep, move.topc )
      break
    case 'promote':
      boardPosition[ move.from ] = move.frompc
      boardPosition[ move.to ] = ( move.topc ) ? move.topc : 0
      updateBoards( move.to, move.from, move.frompc )
      if ( move.topc ) updateBoards( move.to, move.to, move.topc ) 
      break
    case 'castle':
      boardPosition[ move.from ] = move.frompc
      boardPosition[ move.to ] = 0
      boardPosition[ move.rook.from ] = move.rook.pc
      boardPosition[ move.rook.to ] = 0
      updateBoards( move.to, move.from, move.frompc )
      updateBoards( move.rook.to, move.rook.from, move.rook.pc )
      break
  }
}

function cpu( side, depth, eg )
{
  var alpha = -Infinity, 
    beta = Infinity,
    init_depth = depth,
    init_side = side
  
  var answer = search( init_side, side, init_depth, depth, alpha, beta, eg, 0, 0 )
  
  if (answer) self.postMessage({ 'move': answer[1] })
}