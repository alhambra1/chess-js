var logStats = {}

logStats.on = false
logStats.move = 'all'
logStats.square = 'all'
logStats.exchangeProcess = true

logStats.move = ( logStats.move == 'all' ) ? true : function(){ return ( moveCount == logStats.move ) }
logStats.square = ( logStats.square == 'all' ) ? true : function(){ return ( u == logStats.square ) }


//boards
var WB = [parseInt('00000000000000000000000000000000',2),
		  parseInt('00000000000000001111111111111111',2)],
	
	WB90 = [parseInt('11000000110000001100000011000000',2),
		  parseInt('11000000110000001100000011000000',2)],
	
	WB45cl = [parseInt('0000000000000000000001000000',2), parseInt('11000000',2),
			parseInt('1100000110000110001100110111',2)],
	
	WB45cc = [parseInt('0000000000000000000000000001',2), parseInt('00000011',2),
			parseInt('0000011000011000110011011111',2)],
	
	BB = [parseInt('11111111111111110000000000000000',2),
		  parseInt('00000000000000000000000000000000',2)],
		  
	BB90 = [parseInt('00000011000000110000001100000011',2),
		  parseInt('00000011000000110000001100000011',2)],
		  
	BB45cl = [parseInt('1110110011000110000110000011',2), parseInt('00000011',2),
			parseInt('0000001000000000000000000000',2)],
	
	BB45cc = [parseInt('1111101100110001100001100000',2), parseInt('11000000',2),
			parseInt('1000000000000000000000000000',2)],
	
	//white pawns
	P = [parseInt('00000000000000000000000000000000',2),
		  parseInt('00000000000000001111111100000000',2)],
	
	//black pawns
	p = [parseInt('00000000111111110000000000000000',2),
		  parseInt('00000000000000000000000000000000',2)],
	
	KM = [], //king move masks
	NM = [], //knight move masks
	
	M =[] // single bit masks
	
	for (var a=0; a<64; a++)
	{
		M[a] = [[],[]]
	}
	
	M[-1] = [0,0] //non move indexed as -1
	
	var M45 =[]
	
	for (var a=0; a<64; a++)
	{
		M45[a] = [[],[],[]]
	}
	
	//table shifts
	var tbL7 = [], tbL9 = [], tbR9 = [], tbR7 = []

	function mTbShifts()
	{
		for (var a=0; a<64; a++)
		{
			if ( ( a+1 )%8 != 0 && -1 < a-7 && a-7 < 64 ) tbL7[a] = a-7
			else tbL7[a] = -1
		}
		
		for (var a=0; a<64; a++)
		{
			if ( a%8 != 0 && -1 < a-9 && a-9 < 64 ) tbL9[a] = a-9
			else tbL9[a] = -1
		}
		
		for (var a=0; a<64; a++)
		{
			if ( ( a+1 )%8 != 0 && -1 < a+9 && a+9 < 64 ) tbR9[a] = a+9
			else tbR9[a] = -1
		}
		
		for (var a=0; a<64; a++)
		{
			if ( a%8 != 0 && -1 < a+7 && a+7 < 64 ) tbR7[a] = a+7
			else tbR7[a] = -1
		}
	}
	
	//not-rotated table: index0:quadrant, index1:half, index2:position in rank
	var tb = []
	
	for (var a=0; a<64; a++)
	{
		var half = Math.floor( a/32 ),
			modulo = (a < 32) ? a : a%32,
			pos = (a < 8) ? a : a%8,
			
			shift = ( 3-Math.floor(modulo/8) ) * 8
			
		tb[a] = [half, shift, pos]
	}
	
	var AMtb = [],
	
	//list of ids in the tables rotated 45, index = index in rotated table
	tb45cl =       [0,2,5,9,14,20,27,35,
			1,4,8,13,19,26,34,42,
			3,7,12,18,25,33,41,48,
			6,11,17,24,32,40,47,53,
			10,16,23,31,39,46,52,57,
			15,22,30,38,45,51,56,60,
			21,29,37,44,50,55,59,62,
			28,36,43,49,54,58,61,63],
			
	tb45cc =       [28,21,15,10,6,3,1,0,
			36,29,22,16,11,7,4,2,
			43,37,30,23,17,12,8,5,
			49,44,38,31,24,18,13,9,
			54,50,45,39,32,25,19,14,
			58,55,51,46,40,33,26,20,
			61,59,56,52,47,41,34,27,
			63,62,60,57,53,48,42,35],
				
	// quadrant, shift, position in (rotated) rank, length of rank -- location of ids in tables rotated 45, index = id
	rv45cl = [
			[0,20,0,1], [0,19,1,2], [0,17,2,3], [0,14,3,4], [0,10,4,5], [0,5,5,6], [0,-1,6,7], [1,0,7,8], 
			[0,19,0,2], [0,17,1,3], [0,14,2,4], [0,10,3,5], [0,5,4,6], [0,-1,5,7], [1,0,6,8], [2,20,6,7],
			[0,17,0,3], [0,14,1,4], [0,10,2,5], [0,5,3,6], [0,-1,4,7], [1,0,5,8], [2,20,5,7], [2,13,5,6],
			[0,14,0,4], [0,10,1,5], [0,5,2,6], [0,-1,3,7], [1,0,4,8], [2,20,4,7], [2,13,4,6], [2,7,4,5],
			[0,10,0,5], [0,5,1,6], [0,-1,2,7], [1,0,3,8], [2,20,3,7], [2,13,3,6], [2,7,3,5], [2,2,3,4],
			[0,5,0,6], [0,-1,1,7], [1,0,2,8], [2,20,2,7], [2,13,2,6], [2,7,2,5], [2,2,2,4], [2,-2,2,3],
			[0,-1,0,7], [1,0,1,8], [2,20,1,7], [2,13,1,6], [2,7,1,5], [2,2,1,4], [2,-2,1,3], [2,-5,1,2],
			[1,0,0,8], [2,20,0,7], [2,13,0,6], [2,7,0,5], [2,2,0,4], [2,-2,0,3], [2,-5,0,2], [2,-7,0,1]
		],
	
	rv45cc = [
			[1,0,0,8], [0,-1,0,7], [0,5,0,6], [0,10,0,5], [0,14,0,4], [0,17,0,3], [0,19,0,2], [0,20,0,1],
			[2,20,0,7], [1,0,1,8], [0,-1,1,7], [0,5,1,6], [0,10,1,5], [0,14,1,4], [0,17,1,3], [0,19,1,2],
			[2,13,0,6], [2,20,1,7], [1,0,2,8], [0,-1,2,7], [0,5,2,6], [0,10,2,5], [0,14,2,4], [0,17,2,3],
			[2,7,0,5], [2,13,1,6], [2,20,2,7], [1,0,3,8], [0,-1,3,7], [0,5,3,6], [0,10,3,5], [0,14,3,4],
			[2,2,0,4], [2,7,1,5], [2,13,2,6], [2,20,3,7], [1,0,4,8], [0,-1,4,7], [0,5,4,6], [0,10,4,5],
			[2,-2,0,3], [2,2,1,4], [2,7,2,5], [2,13,3,6], [2,20,4,7], [1,0,5,8], [0,-1,5,7], [0,5,5,6],
			[2,-5,0,2], [2,-2,1,3], [2,2,2,4], [2,7,3,5], [2,13,4,6], [2,20,5,7], [1,0,6,8], [0,-1,6,7],
			[2,-7,0,1], [2,-5,1,2], [2,-2,2,3], [2,2,3,4], [2,7,4,5], [2,13,5,6], [2,20,6,7], [1,0,7,8]
		],
	
	
	//list of ids in the table rotated 90 cl, index = index in rotated table
	tb90 = [7,15,23,31,39,47,55,63,
		6,14,22,30,38,46,54,62,
		5,13,21,29,37,45,53,61,
		4,12,20,28,36,44,52,60,
		3,11,19,27,35,43,51,59,
		2,10,18,26,34,42,50,58,
		1,9,17,25,33,41,49,57,
		0,8,16,24,32,40,48,56]
			
function mKM()
{
	var a = '1110000000101000000011100000000000000000000000000000000000000000000000000000000000000000000000000000'
	
	for (var b=0; b<64; b++)
	{
		KM[b] = [[],[]]
		var c0 = parseInt( ( a.substr(11,8) + a.substr(21,8) + a.substr(31,8) + a.substr(41,8) ), 2), 
			c1 = parseInt( ( a.substr(51,8) + a.substr(61,8) + a.substr(71,8) + a.substr(81,8) ), 2)
		
		KM[b][0].push(c0)
		KM[b][1].push(c1)
		
		if (b && (b+1)%8 == 0) a = '000' + a.substr(0,97)
		else a = '0' + a.substr(0,99)
	}
}

function mNM()
{
	var a = '010100000000100010000000000000000000100010000000010100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
	
	for (var b=0; b<64; b++)
	{
		NM[b] = [[],[],[],[]]
		var c0 = parseInt( ( a.substr(26,8) + a.substr(38,8) + a.substr(50,8) + a.substr(62,8) ), 2), 
			c1 = parseInt( ( a.substr(74,8) + a.substr(86,8) + a.substr(98,8) + a.substr(110,8) ), 2)
		
		NM[b][0].push(c0)
		NM[b][1].push(c1)
		
		if (b && (b+1)%8 == 0) a = '00000' + a.substr(0,139)
		else a = '0' + a.substr(0,143)
	}
}

function mM()
{
	var singleSetBit = 1
	
	var b = 0
	for (var a=63; a>=32; a--)
	{
		M[a][1].push( singleSetBit << b )
		M[a][0].push( 0 )
		b++
	}
	b = 0
	for (var a=31; a>=0; a--)
	{
		M[a][0].push( singleSetBit << b )
		M[a][1].push( 0 )
		b++
	}
}

function mM45()
{
	var singleSetBit = 1
	
	var b = 0
	for (var a=63; a>=36; a--)
	{
		M45[a][2].push( singleSetBit << b )
		M45[a][1].push( 0 )
		M45[a][0].push( 0 )
		b++
	}
	b = 0
	for (var a=35; a>=28; a--)
	{
		M45[a][1].push( singleSetBit << b )
		M45[a][2].push( 0 )
		M45[a][0].push( 0 )
		b++
	}
	b = 0
	for (var a=27; a>=0; a--)
	{
		M45[a][0].push( singleSetBit << b )
		M45[a][2].push( 0 )
		M45[a][1].push( 0 )
		b++
	}
}
//make available moves lookup table for sliding pieces
function mAMtb()
{
	var ab = []
	
	while (ab.length < 256)
	{
		var a = ''
		
		for (var b=0; b<8; b++)
		{
			var c = Math.round( Math.random() ) ? '1' : '0'
			a += c
		}
		
		if (ab.indexOf( a ) == -1) 
		{	
			ab.push( a )
			a = ''
		}
	}
	
	
	//AMtb[key][pos]['scm'] --same color mask
	//AMtb[key][pos]['dcm'] --different color mask
	//AMtb[key][pos][length of rank]: array of moves
	//AMtb[key][pos][length of rank]['n']: number of available moves
	//How to use: use the 8 relevant bits of the combined black and white board as the key twice, to look up the values for 'scm' & 'dcm' -
	//- since same color pieces cannot be captured. Create a key by binary 'and' of the two values ('scm' & 'dcm').
	//use this key in the table again with the desired position and length of rank to get the array of moves and/or the number of moves ('n'). 
	
	for (var x in ab)
	{
		var key = parseInt( ab[x],2 )
		AMtb[ key ] = []
		
		var length = 8
		
		for (var pos=0; pos<8; pos++)
		{
			//same color mask (scm)
			var scm = '0', block = 0
			
			for (var a=pos+1; a<length; a++)
			{
				if ( !Number( ab[x].charAt(a) ) && !block ) 
				{
					scm += '1'
				}
				else 
				{
					block = 1
					scm += '0'
				}
			}
			
			block = 0
			
			if (pos)
			{
				for (var a=pos-1; a>=0; a--)
				{
					if ( !Number( ab[x].charAt(a) ) && !block )
					{
						scm = '1' + scm
					}
					else 
					{
						block = 1
						scm = '0' + scm
					}
				}
			}
				
			AMtb[ key ][pos] = []
			AMtb[ key ][pos]['scm'] = parseInt(scm,2)
			
			//different color mask (dcm)
			var dcm = '0' 
			
			block = 0
			
			for (var a=pos+1; a<length; a++)
			{
				if ( !Number( ab[x].charAt(a) ) ) dcm += '1'
				else
				{
					dcm += '1'
					
					for (var b=1; b<length-a; b++)
					{
						dcm += '0'
					}
					break
				}
			}
				
			block = 0
				
			if (pos)
			{
				for (var a=pos-1; a>=0; a--)
				{
					if ( !Number( ab[x].charAt(a) ) ) dcm = '1' + dcm
					else
					{
						dcm = '1' + dcm
					
						for (var b=0; b<length-a; b++)
						{
							dcm = '0' + dcm
						}
						break
					}
				}
			}
			
			AMtb[ key ][pos]['dcm'] = parseInt(dcm,2)
			
			//make index=length of rank (for rotated tables), index 'n'=number of moves, and array of moves
			
			for (var l=1; l<=8; l++)
			{
				AMtb[ key ][pos][l] = []
				
				var n = 0
				
				for (var a=0; a<l; a++)
				{
					if ( Number( ab[x].charAt(a) ) )
					{
						n++
						AMtb[ key ][pos][l].push( a-pos )
					}
				}
				AMtb[ key ][pos][l]['n'] = n
			}
		}
	}
}

function IF(array)
{
	if ( array[0] | array[1] ) return true
	else return false
}

function scanBits(array)
{	
	var setBits = []
	
	for (var a=0; a<64; a++)
	{
		if ( IF( AND( M[a], array ) ) ) setBits.push( a ) 
	}
	
	return setBits
}

function LSHIFT7(array)
{
	var answer = []
	
	answer[1] = (array[1] & 0x1ffffff) << 7
	answer[0] = ( (array[0] & 0x1ffffff) << 7 ) | ( (array[1] & 0xfe000000) >>> 25 )
	
	return answer
}

function RSHIFT7(array)
{
	var answer = []
	
	answer[1] = ( (array[0] & 0xff) << 25 ) | ( (array[1] & 0xffffff80) >>> 7 )
	answer[0] = (array[0] & 0xffffff80) >>> 7
	
	return answer
}

function LSHIFT8(array)
{
	var answer = []
	
	answer[1] = (array[1] & 0xffffff) << 8
	answer[0] = ( (array[0] & 0xffffff) << 8 ) | ( (array[1] & 0xff000000) >>> 24 )
	
	return answer
}

function RSHIFT8(array)
{
	var answer = []
	
	answer[1] = ( (array[0] & 0xff) << 24 ) | ( (array[1] & 0xffffff00) >>> 8 )
	answer[0] = (array[0] & 0xffffff00) >>> 8
	
	return answer
}

function LSHIFT9(array)
{
	var answer = []
	
	answer[1] = (array[1] & 0x7fffff) << 9
	answer[0] = ( (array[0] & 0x7fffff) << 9 ) | ( (array[1] & 0xff800000) >>> 23 )
	
	return answer
}

function RSHIFT9(array)
{
	var answer = []
	
	answer[1] = ( (array[0] & 0x1ff) << 23 ) | ( (array[1] & 0xfffffe00) >>> 9 )
	answer[0] = (array[0] & 0xfffffe00) >>> 9
	
	return answer
}

function bit8to0(array)
{
	return [ (array[0] & 0xfefefefe), (array[1] & 0xfefefefe) ]
}

function bit0to0(array)
{
	return [ (array[0] & 0x7f7f7f7f), (array[1] & 0x7f7f7f7f) ]
}

function AND(array1, array2)
{
	var array3 = [[],[]]
	
	for (var a=0; a<2; a++)
	{
		array3[a] = array1[a] & array2[a]
	}
	return array3
}

function OR(array1, array2)
{
	var array3 = [[],[]]
	
	for (var a=0; a<2; a++)
	{
		array3[a] = array1[a] | array2[a]
	}
	return array3
}

function OR45(array1, array2)
{
	var array3 = [[],[],[]]
	
	for (var a=0; a<3; a++)
	{
		array3[a] = array1[a] | array2[a]
	}
	return array3
}

function XOR(array1, array2)
{
	var array3 = [[],[]]
	
	for (var a=0; a<2; a++)
	{
		array3[a] = array1[a] ^ array2[a]
	}
	return array3
}

function XOR45(array1, array2)
{
	var array3 = [[],[],[]]
	
	for (var a=0; a<3; a++)
	{
		array3[a] = array1[a] ^ array2[a]
	}
	return array3
}

function NOT(array)
{
	var array1 = [[],[]]
	
	for (var a=0; a<2; a++)
	{
		array1[a] = ~array[a]
	}
	return array1
}

function show(array)
{
    var b=1,
		c=[],
		answer=[]
    
    for(var d=0; d<32; d++)
    {
        c[d] = b
		b = b<<1
    } 
	
	for (var a=0; a<2; a++)
	{
		var str=''
		
		for (var d=31; d>=0; d--)
		{
			if ( c[d] & array[a] ) str += 'X'
			else str += '0'
			if ( d%8 == 0) str += '\n'
		}
		
		answer[a] = str
	}
	
	alert( answer[0] + answer[1] )
}

function show45(array)
{
    var b=1,
		c=[],
		answer=[]
    
    for(var d=0; d<32; d++)
    {
        c[d] = b
		b = b<<1
    } 
	
	for (var a=0; a<3; a++)
	{
		var str=''
		
		if (a == 0)
		{
			for (var d=27; d>=0; d--)
			{
				if ( c[d] & array[a] ) str += 'X'
				else str += '0'
				if ( d == 27 || d == 25 || d == 22 || d == 18 || d == 13 || d == 7 || d == 0) str += '\n'
			}
			answer[a] = str
		}
		else if (a == 1)
		{
			for (var d=7; d>=0; d--)
			{
				if ( c[d] & array[a] ) str += 'X'
				else str += '0'
				if ( d == 0) str += '\n'
			}
			answer[a] = str
		}
		else
		{
			for (var d=27; d>=0; d--)
			{
				if ( c[d] & array[a] ) str += 'X'
				else str += '0'
				if ( d == 21 || d == 15 || d == 10 || d == 6 || d == 3 || d == 1 || d == 0) str += '\n'
			}
			answer[a] = str
		}
	}
	
	alert( answer[0] + answer[1] + answer[2])
}

function updateBoards(fromId, toId, piece)
{
	var move = OR( M[fromId], M[toId] ),
		move90 = OR( M[ tb90[fromId] ], M[ tb90[toId] ] ),
		move45cl = OR45( M45[ tb45cl[fromId] ], M45[ tb45cl[toId] ] ),
		move45cc = OR45( M45[ tb45cc[fromId] ], M45[ tb45cc[toId] ] )
		
	if (piece > 0)
	{
		WB = XOR(WB, move)
		WB90 = XOR(WB90, move90)
		WB45cl = XOR45(WB45cl, move45cl)
		WB45cc = XOR45(WB45cc, move45cc)
		
		if (piece == 6) P = XOR(P, move)
	}
	
	if (piece < 0)
	{
		BB = XOR(BB, move)
		BB90 = XOR(BB90, move90)
		BB45cl = XOR45(BB45cl, move45cl)
		BB45cc = XOR45(BB45cc, move45cc)
		
		if (piece == -6) p = XOR(p, move)
	}
}

//calculate available moves
function KAM(position)
{
	return scanBits( AND( KM[position], NOT( WB ) ) )
}

function NAM(position)
{
	return scanBits( AND( NM[position], NOT( WB ) ) )
}

function kAM(position)
{
	return scanBits( AND( KM[position], NOT( BB ) ) )
}

function nAM(position)
{
	return scanBits( AND( NM[position], NOT( BB ) ) )
}

function PAM(position)
{
	var moves = [],
		initPos = [48,49,50,51,52,53,54,55],
		move7 = tbL7[ position ], move9 = tbL9[ position ]
		
	if ( IF( AND( M[position-8], NOT( OR(WB,BB) ) ) ) ) moves.push( position-8 )
	if ( initPos.indexOf( position ) != -1 && !boardPosition[ position-8 ] && !boardPosition[ position-16 ] ) moves.push( position-16 )
	if ( IF( AND( M[ move7 ], BB ) ) ) moves.push( move7 )
	if ( IF( AND( M[ move9 ], BB ) ) ) moves.push( move9 )
	
	/* En Passant White on Black */
	var bPawnsInitialPos = [15,14,13,12,11,10,9,8]
	
	for (var a=16;a<24;a++)
	{
		for (var b=0;b<8;b++)
		{
			if ( (a-8) == bPawnsInitialPos[b] && enPassantHistory[moveCount] == bPawnsInitialPos[b] )
			{
				if ( move9 != -1 && move9 == a ) 
				{
					moves.push(move9)
					moves['e'] = 1 //en passant flag
				}
				if ( move7 != -1 && move7 == a ) 
				{
					moves.push(move7)
					moves['e'] = 1 //en passant flag
				}
			}
		}
	}
	
	return moves
}

function PAMall()
{
	var moves = scanBits( AND( LSHIFT8(P), NOT( OR(WB,BB) ) ) ),
		capturesR = scanBits( AND( LSHIFT7( bit8to0(P) ), BB ) ),
		capturesL = scanBits( AND( LSHIFT9( bit0to0(P) ), BB ) )
		
	return moves.concat(capturesL).concat(capturesR)
}

function PAMcap() // shows potential captures even if the captured squares are now empty
{
	var R = scanBits( LSHIFT7( bit8to0(P) ) ), L = scanBits( LSHIFT9( bit0to0(P) ) )
	return R.concat(L)
}

function pAM(position)
{
	var moves = [],
		initPos = [8,9,10,11,12,13,14,15],
		move7 = tbR7[ position ], move9 = tbR9[ position ]
		
	if ( IF( AND( M[position+8], NOT( OR(WB,BB) ) ) ) ) moves.push( position+8 )
	if ( initPos.indexOf( position ) != -1 && !boardPosition[ position+8 ] && !boardPosition[ position+16 ] ) moves.push( position+16 )
	if ( IF( AND( M[ move9 ], WB ) ) ) moves.push( move9 )
	if ( IF( AND( M[ move7 ], WB ) ) ) moves.push( move7 )
	
	/* En Passant Black on White */
	var wPawnsInitialPos = [48,49,50,51,52,53,54,55]
	
	for (var a=40;a<48;a++)
	{
		for (var b=0;b<8;b++)
		{
			if ( (a+8) == wPawnsInitialPos[b] && enPassantHistory[moveCount] == wPawnsInitialPos[b] )
			{
				if ( move9 != -1 && move9 == a )
				{
					moves.push(move9)
					moves['e'] = 2 //en passant flag
				}
				if ( move7 != -1 && move7 == a )
				{
					moves.push(move7)
					moves['e'] = 2 //en passant flag
				}
			}
		}
	}
		
	return moves
}

function pAMall()
{
	var moves = scanBits( AND( RSHIFT8(p), NOT( OR(WB,BB) ) ) ),
		capturesR = scanBits( AND( RSHIFT9( bit8to0(p) ), WB ) ),
		capturesL = scanBits( AND( RSHIFT7( bit0to0(p) ), WB ) )
		
	return moves.concat(capturesL).concat(capturesR)
}

function pAMcap() //shows potential captures even if the captured squares are now empty
{
	var R = scanBits( RSHIFT9( bit8to0(p) ) ), L = scanBits( RSHIFT7( bit0to0(p) ) )
	return R.concat(L)
}

function RAM(position)
{
	var movesH, movesV, moves = [], keyB, keyW, mask, pos90 = tb90[position]
		
	//find horizontal moves
	keyB = ( BB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	keyW = ( WB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[position][2] ]['scm'] & AMtb[keyB][ tb[position][2] ]['dcm']
	movesH = AMtb[mask][ tb[position][2] ][8]
	
	//find vertical moves
	keyB = ( BB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	keyW = ( WB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[ pos90 ][2] ]['scm'] & AMtb[keyB][ tb[ pos90 ][2] ]['dcm']
	movesV = AMtb[mask][ tb[ pos90 ][2] ][8]
	
	for (var a=0; a<movesH.length; a++)
	{
		var x = position + movesH[a]
		moves.push(x)
	}
	
	for (var a=0; a<movesV.length; a++)
	{
		var x = position + (movesV[a] * -8)
		moves.push(x)
	}
		
	return moves
}

function rAM(position)
{
	var movesH, movesV, moves = [], keyB, keyW, mask, pos90 = tb90[position]
		
	//find horizontal moves
	keyB = ( BB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	keyW = ( WB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[position][2] ]['dcm'] & AMtb[keyB][ tb[position][2] ]['scm']
	movesH = AMtb[mask][ tb[position][2] ][8]
	
	//find vertical moves
	keyB = ( BB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	keyW = ( WB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[ pos90 ][2] ]['dcm'] & AMtb[keyB][ tb[ pos90 ][2] ]['scm']
	movesV = AMtb[mask][ tb[ pos90 ][2] ][8]
	
	for (var a=0; a<movesH.length; a++)
	{
		var x = position + movesH[a]
		moves.push(x)
	}
	
	for (var a=0; a<movesV.length; a++)
	{
		var x = position + (movesV[a] * -8)
		moves.push(x)
	}
		
	return moves
}

function BAM(position)
{
	var movesCL, movesCC, moves = [], keyB, keyW, mask, pos45cl = tb45cl[position], pos45cc = tb45cc[position]
		
	//find rotated-clockwise moves
	keyB = rv45cl[position][1] > 0 ? ( BB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( BB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	keyW = rv45cl[position][1] > 0 ? ( WB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( WB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cl[position][2] ]['scm'] & AMtb[keyB][ rv45cl[position][2] ]['dcm']
	movesCL = AMtb[mask][ rv45cl[position][2] ][ rv45cl[position][3] ]
	
	//find rotated-counter-clockwise moves
	keyB = rv45cc[position][1] > 0 ? ( BB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( BB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	keyW = rv45cc[position][1] > 0 ? ( WB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( WB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cc[position][2] ]['scm'] & AMtb[keyB][ rv45cc[position][2] ]['dcm']
	movesCC = AMtb[mask][ rv45cc[position][2] ][ rv45cc[position][3] ]
	
	for (var a=0; a<movesCL.length; a++)
	{
		var x = position + (movesCL[a] * -7)
		moves.push(x)
	}
	
	for (var a=0; a<movesCC.length; a++)
	{
		var x = position + (movesCC[a] * 9)
		moves.push(x)
	}
		
	return moves
}

function bAM(position)
{
	var movesCL, movesCC, moves = [], keyB, keyW, mask, pos45cl = tb45cl[position], pos45cc = tb45cc[position]
		
	//find rotated-clockwise moves
	keyB = rv45cl[position][1] > 0 ? ( BB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( BB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	keyW = rv45cl[position][1] > 0 ? ( WB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( WB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cl[position][2] ]['dcm'] & AMtb[keyB][ rv45cl[position][2] ]['scm']
	movesCL = AMtb[mask][ rv45cl[position][2] ][ rv45cl[position][3] ]

	//find rotated-counter-clockwise moves
	keyB = rv45cc[position][1] > 0 ? ( BB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( BB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	keyW = rv45cc[position][1] > 0 ? ( WB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( WB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cc[position][2] ]['dcm'] & AMtb[keyB][ rv45cc[position][2] ]['scm']
	movesCC = AMtb[mask][ rv45cc[position][2] ][ rv45cc[position][3] ]

	for (var a=0; a<movesCL.length; a++)
	{
		var x = position + (movesCL[a] * -7)
		moves.push(x)
	}
	
	for (var a=0; a<movesCC.length; a++)
	{
		var x = position + (movesCC[a] * 9)
		moves.push(x)
	}
		
	return moves
}

function QAM(position)
{
	var movesH, movesV, moves = [], keyB, keyW, mask, pos90 = tb90[position]
		
	//find horizontal moves
	keyB = ( BB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	keyW = ( WB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[position][2] ]['scm'] & AMtb[keyB][ tb[position][2] ]['dcm']
	movesH = AMtb[mask][ tb[position][2] ][8]
	
	//find vertical moves
	keyB = ( BB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	keyW = ( WB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[ pos90 ][2] ]['scm'] & AMtb[keyB][ tb[ pos90 ][2] ]['dcm']
	movesV = AMtb[mask][ tb[ pos90 ][2] ][8]
	
	for (var a=0; a<movesH.length; a++)
	{
		var x = position + movesH[a]
		moves.push(x)
	}
	
	for (var a=0; a<movesV.length; a++)
	{
		var x = position + (movesV[a] * -8)
		moves.push(x)
	}
	
	var movesCL, movesCC, pos45cl = tb45cl[position], pos45cc = tb45cc[position]
		
	//find rotated-clockwise moves
	keyB = rv45cl[position][1] > 0 ? ( BB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( BB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	keyW = rv45cl[position][1] > 0 ? ( WB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( WB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cl[position][2] ]['scm'] & AMtb[keyB][ rv45cl[position][2] ]['dcm']
	movesCL = AMtb[mask][ rv45cl[position][2] ][ rv45cl[position][3] ]
	
	//find rotated-counter-clockwise moves
	keyB = rv45cc[position][1] > 0 ? ( BB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( BB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	keyW = rv45cc[position][1] > 0 ? ( WB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( WB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cc[position][2] ]['scm'] & AMtb[keyB][ rv45cc[position][2] ]['dcm']
	movesCC = AMtb[mask][ rv45cc[position][2] ][ rv45cc[position][3] ]
	
	for (var a=0; a<movesCL.length; a++)
	{
		var x = position + (movesCL[a] * -7)
		moves.push(x)
	}
	
	for (var a=0; a<movesCC.length; a++)
	{
		var x = position + (movesCC[a] * 9)
		moves.push(x)
	}
	
	return moves
}

function qAM(position)
{
	var movesH, movesV, moves = [], keyB, keyW, mask, pos90 = tb90[position]
		
	//find horizontal moves
	keyB = ( BB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	keyW = ( WB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[position][2] ]['dcm'] & AMtb[keyB][ tb[position][2] ]['scm']
	movesH = AMtb[mask][ tb[position][2] ][8]
	
	//find vertical moves
	keyB = ( BB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	keyW = ( WB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[ pos90 ][2] ]['dcm'] & AMtb[keyB][ tb[ pos90 ][2] ]['scm']
	movesV = AMtb[mask][ tb[ pos90 ][2] ][8]
	
	for (var a=0; a<movesH.length; a++)
	{
		var x = position + movesH[a]
		moves.push(x)
	}
	
	for (var a=0; a<movesV.length; a++)
	{
		var x = position + (movesV[a] * -8)
		moves.push(x)
	}
	
	var movesCL, movesCC, pos45cl = tb45cl[position], pos45cc = tb45cc[position]
		
	//find rotated-clockwise moves
	keyB = rv45cl[position][1] > 0 ? ( BB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( BB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	keyW = rv45cl[position][1] > 0 ? ( WB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( WB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cl[position][2] ]['dcm'] & AMtb[keyB][ rv45cl[position][2] ]['scm']
	movesCL = AMtb[mask][ rv45cl[position][2] ][ rv45cl[position][3] ]

	//find rotated-counter-clockwise moves
	keyB = rv45cc[position][1] > 0 ? ( BB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( BB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	keyW = rv45cc[position][1] > 0 ? ( WB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( WB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cc[position][2] ]['dcm'] & AMtb[keyB][ rv45cc[position][2] ]['scm']
	movesCC = AMtb[mask][ rv45cc[position][2] ][ rv45cc[position][3] ]

	for (var a=0; a<movesCL.length; a++)
	{
		var x = position + (movesCL[a] * -7)
		moves.push(x)
	}
	
	for (var a=0; a<movesCC.length; a++)
	{
		var x = position + (movesCC[a] * 9)
		moves.push(x)
	}
	
	return moves
}

//attack sets
function PAS(position)
{
	var moves = [],
		move7 = tbL7[ position ], move9 = tbL9[ position ]
		
	if ( IF( M[ move7 ] ) ) moves.push( move7 )
	if ( IF( M[ move9 ] ) ) moves.push( move9 )
	
	/* En Passant White on Black */
	var bPawnsInitialPos = [15,14,13,12,11,10,9,8]
	
	for (var a=16;a<24;a++)
	{
		for (var b=0;b<8;b++)
		{
			if ( (a-8) == bPawnsInitialPos[b] && enPassantHistory[moveCount] == bPawnsInitialPos[b] )
			{
				if ( move9 != -1 && move9 == a ) 
				{
					moves.push(move9)
					moves['e'] = 1 //en passant flag
				}
				if ( move7 != -1 && move7 == a ) 
				{
					moves.push(move7)
					moves['e'] = 1 //en passant flag
				}
			}
		}
	}
	
	return moves
}

function pAS(position)
{
	var moves = [],
		move7 = tbR7[ position ], move9 = tbR9[ position ]
		
	if ( IF( M[ move9 ] ) ) moves.push( move9 )
	if ( IF( M[ move7 ] ) ) moves.push( move7 )
	
	/* En Passant Black on White */
	var wPawnsInitialPos = [48,49,50,51,52,53,54,55]
	
	for (var a=40;a<48;a++)
	{
		for (var b=0;b<8;b++)
		{
			if ( (a+8) == wPawnsInitialPos[b] && enPassantHistory[moveCount] == wPawnsInitialPos[b] )
			{
				if ( move9 != -1 && move9 == a )
				{
					moves.push(move9)
					moves['e'] = 2 //en passant flag
				}
				if ( move7 != -1 && move7 == a )
				{
					moves.push(move7)
					moves['e'] = 2 //en passant flag
				}
			}
		}
	}
		
	return moves
}
function KAS(position) // attack set
{
	return scanBits( KM[position] )
}

function NAS(position) // attack set - includes captures of friendly pieces for evaluating kings moves
{
	return scanBits( NM[position] )
}

function RAS(position) //attack set
{
	var movesH, movesV, moves = [], keyB, keyW, mask, pos90 = tb90[position]
		
	//find horizontal moves
	keyB = ( BB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	keyW = ( WB[ tb[position][0] ] >> tb[position][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[position][2] ]['dcm'] & AMtb[keyB][ tb[position][2] ]['dcm']
	movesH = AMtb[mask][ tb[position][2] ][8]
	
	//find vertical moves
	keyB = ( BB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	keyW = ( WB90[ tb[ pos90 ][0] ] >> tb[ pos90 ][1] ) & 0xff
	
	mask = AMtb[keyW][ tb[ pos90 ][2] ]['dcm'] & AMtb[keyB][ tb[ pos90 ][2] ]['dcm']
	movesV = AMtb[mask][ tb[ pos90 ][2] ][8]
	
	for (var a=0; a<movesH.length; a++)
	{
		var x = position + movesH[a]
		moves.push(x)
	}
	
	for (var a=0; a<movesV.length; a++)
	{
		var x = position + (movesV[a] * -8)
		moves.push(x)
	}
	
	return moves
}

function BAS(position) //attack set
{
	var movesCL, movesCC, moves = [], keyB, keyW, mask, pos45cl = tb45cl[position], pos45cc = tb45cc[position]
		
	//find rotated-clockwise moves
	keyB = rv45cl[position][1] > 0 ? ( BB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( BB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	keyW = rv45cl[position][1] > 0 ? ( WB45cl[ rv45cl[position][0] ] >> rv45cl[position][1] ) & 0xff : ( WB45cl[ rv45cl[position][0] ] << -rv45cl[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cl[position][2] ]['dcm'] & AMtb[keyB][ rv45cl[position][2] ]['dcm']
	movesCL = AMtb[mask][ rv45cl[position][2] ][ rv45cl[position][3] ]
	
	//find rotated-counter-clockwise moves
	keyB = rv45cc[position][1] > 0 ? ( BB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( BB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	keyW = rv45cc[position][1] > 0 ? ( WB45cc[ rv45cc[position][0] ] >> rv45cc[position][1] ) & 0xff : ( WB45cc[ rv45cc[position][0] ] << -rv45cc[position][1] ) & 0xff
	
	mask = AMtb[keyW][ rv45cc[position][2] ]['dcm'] & AMtb[keyB][ rv45cc[position][2] ]['dcm']
	movesCC = AMtb[mask][ rv45cc[position][2] ][ rv45cc[position][3] ]
	
	for (var a=0; a<movesCL.length; a++)
	{
		var x = position + (movesCL[a] * -7)
		moves.push(x)
	}
	
	for (var a=0; a<movesCC.length; a++)
	{
		var x = position + (movesCC[a] * 9)
		moves.push(x)
	}
		
	return moves
}

function QAS(position) // attack set
{
	var moves = BAS(position)
	
	return moves.concat( RAS(position) )
}


//position valuation

//Bishops, rooks, and queens gain up to 10 percent more value in open positions and lose up to 20 percent in closed positions. (wiki piece valuation by Hans Berliner)
//B = (x * .0230769231 - .2)
//R = (x * .02142857143 - .2) 
//Q = (x * .01111111111 - .2)
// x is available moves

//table for knight position penalty
var tbNpen = []

function mTbNpen()
{
	for( var a=0; a<64; a++ )
	{
		tbNpen[a] = 1.5*(8 - Number( NAS(a).length ) )
	}
}

function Ngain( pos )
{
	//Knights gain up to 50 percent in closed positions
	var gain=1 //percent
	
	for (var a=0; a<8; a++)
	{
		if ( tbNclsd[ pos ][ a ] && IF( AND( OR( WB,BB ), tbNclsd[ pos ][ a ] ) ) ) gain += .0625
	}
	
	return gain
}

//table for evaluating knight in closed position
var tbNclsd = []

function mTbNclsd()
{
	var x = [-9,-8,-7,-1,1,7,8,9]
	
	for (var a=0; a<64; a++)
	{
		tbNclsd[a] = []
		
		for (var b=0; b<x.length; b++)
		{
			if ( M[ a+x[b] ] && IF( AND( M[ a+x[b] ], KM[ a ] ) ) ) tbNclsd[a][b] = M[ a+x[b] ]
		}
	}
}

//board files
var tbFiles = []

function mTbFiles()
{
	var a = parseInt( '00000001000000010000000100000001', 2 )
	for (var b=7; b>=0; b--)
	{
		tbFiles[b] = []
		tbFiles[b][0] = a
		tbFiles[b][1] = a
		
		a <<= 1
	}
}

//doubled pawns
var tbPd = []

function mTbPd()
{
	var a = '0100000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000'
	
	for (var b=0; b<64; b++)
	{
		tbPd[b] = [[],[]]
		var c0 = parseInt( ( a.substr(11,8) + a.substr(21,8) + a.substr(31,8) + a.substr(41,8) ), 2), 
			c1 = parseInt( ( a.substr(51,8) + a.substr(61,8) + a.substr(71,8) + a.substr(81,8) ), 2)
		
		tbPd[b][0].push(c0)
		tbPd[b][1].push(c1)
		
		if (b && (b+1)%8 == 0) a = '000' + a.substr(0,97)
		else a = '0' + a.substr(0,99)
	}
}

//connected pawns
var tbPc = []

function mTbPc()
{
	var a = '1010000000101000000010100000000000000000000000000000000000000000000000000000000000000000000000000000'
	
	for (var b=0; b<64; b++)
	{
		tbPc[b] = [[],[]]
		var c0 = parseInt( ( a.substr(11,8) + a.substr(21,8) + a.substr(31,8) + a.substr(41,8) ), 2), 
			c1 = parseInt( ( a.substr(51,8) + a.substr(61,8) + a.substr(71,8) + a.substr(81,8) ), 2)
		
		tbPc[b][0].push(c0)
		tbPc[b][1].push(c1)
		
		if (b && (b+1)%8 == 0) a = '000' + a.substr(0,97)
		else a = '0' + a.substr(0,99)
	}
}

//isolated pawns
//same as KM

//passed pawns
//white passed pawns
var tbPp = []

function mTbPp()
{
	var a = '1110000000101000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
	
	for (var b=0; b<64; b++)
	{
		tbPp[b] = [[],[]]
		var c0 = parseInt( ( a.substr(11,8) + a.substr(21,8) + a.substr(31,8) + a.substr(41,8) ), 2), 
			c1 = parseInt( ( a.substr(51,8) + a.substr(61,8) + a.substr(71,8) + a.substr(81,8) ), 2)
		
		tbPp[b][0].push(c0)
		tbPp[b][1].push(c1)
		
		if (b && (b+1)%8 == 0) a = '111' + a.substr(0,97)
		else a = '0' + a.substr(0,99)
	}
}

//black passed pawns
var tbpp = []

function mTbpp()
{
	var a = '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000001010000000111'
	
	for (var b=63; b>=0; b--)
	{
		tbpp[b] = [[],[]]
		var c0 = parseInt( ( a.substr(11,8) + a.substr(21,8) + a.substr(31,8) + a.substr(41,8) ), 2), 
			c1 = parseInt( ( a.substr(51,8) + a.substr(61,8) + a.substr(71,8) + a.substr(81,8) ), 2)
		
		tbpp[b][0].push(c0)
		tbpp[b][1].push(c1)
		
		if (b && b%8 == 0) a = a.substr(3,100) + '111'
		else a = a.substr(1,100) + '0'
	}
}

//table for pawn valuation (from table by Hans Berliner in wikipedia)
//white pawn values

var tbPvl = [0,0,0,0,0,0,0,0,
	      10.6, 11.2, 12.5, 14, 14, 12.5, 11.2, 10.6,
	      9.7, 10.3, 11.7, 12.7, 12.7, 11.7, 10.3, 9.7,
	      9, 9.5, 11, 12, 12, 11, 9.5, 9,
	      9, 9.5, 10.5, 11.5, 11.5, 10.5, 9.5, 9,
	      9, 9.5, 10.5, 11, 11, 10.5, 9.5, 9,
	      10,10,10,10,10,10,10,10],

    tbPvlEg = [0,0,0,0,0,0,0,0,
		14.5, 12.9, 11.6, 10.5, 10.5, 11.6, 12.9, 14.5,
		13.3, 11.7, 10.7, 10, 10, 10.7, 11.7, 13.3,
    		12.5, 11, 10, 9.5, 9.5, 10, 11, 12.5,
    		12, 10.5, 9.5, 9, 9, 9.5, 10.5, 12,
    		12, 10.5, 9.5, 9, 9, 9.5, 10.5, 12,
    		10,10,10,10,10,10,10,10],

    //Value of pawn advances (multiplier of base amount) index=rank, i=isolated, c=connected, p=passed, pc=passed & connected
    tbPx = [0]
    tbPx[1] = {i: 1, c: 1, p: 1, pc: 1}
    tbPx[2] = {i: 1, c: 1, p: 1, pc: 1}
    tbPx[3] = {i: 1, c: 1, p: 1, pc: 1}
    tbPx[4] = {i: 1, c: 1, p: 1, pc: 1}
    tbPx[5] = {i: 1.05, c: 1.15, p: 1.3, pc: 1.55}
    tbPx[6] = {i: 1.3, c: 1.35, p: 1.55, pc: 2.3}
    tbPx[7] = {i: 2.1, c: 1.35, p: 1.55, pc: 3.5}

//black pawn values
var tbpvl = [0,0,0,0,0,0,0,0,
	      10, 10, 10, 10, 10, 10, 10, 10,
	      9, 9.5, 10.5, 11, 11, 10.5, 9.5, 9,
	      9, 9.5, 10.5, 11.5, 11.5, 10.5, 9.5, 9,
	      9, 9.5, 11, 12, 12, 11, 9.5, 9,
	      9.7, 10.3, 11.7, 12.7, 12.7, 11.7, 10.3, 9.7,
	      10.6, 11.2, 12.5, 14, 14, 12.5, 11.2, 10.6],

    tbpvlEg = [0,0,0,0,0,0,0,0,
   	        10, 10, 10, 10, 10, 10, 10, 10,
    		12, 10.5, 9.5, 9, 9, 9.5, 10.5, 12,
		12, 10.5, 9.5, 9, 9, 9.5, 10.5, 12,
		12.5, 11, 10, 9.5, 9.5, 10, 11, 12.5,
		13.3, 11.7, 10.7, 10, 10, 10.7, 11.7, 13.3,
		14.5, 12.9, 11.6, 10.5, 10.5, 11.6, 12.9, 14.5],

    //Value of pawn advances (multiplier of base amount) index=rank, i=isolated, c=connected, p=passed, pc=passed & connected
    tbpx = [0]
    tbpx[7] = {i: 1, c: 1, p: 1, pc: 1}
    tbpx[6] = {i: 1, c: 1, p: 1, pc: 1}
    tbpx[5] = {i: 1, c: 1, p: 1, pc: 1}
    tbpx[4] = {i: 1.05, c: 1.15, p: 1.3, pc: 1.55}
    tbpx[3] = {i: 1.3, c: 1.35, p: 1.55, pc: 2.3}
    tbpx[2] = {i: 2.1, c: 1.35, p: 1.55, pc: 3.5}

//rank table
var tbRank = [8,8,8,8,8,8,8,8,
	      7,7,7,7,7,7,7,7,
	      6,6,6,6,6,6,6,6,
	      5,5,5,5,5,5,5,5,
	      4,4,4,4,4,4,4,4,
	      3,3,3,3,3,3,3,3,
	      2,2,2,2,2,2,2,2,
	      1,1,1,1,1,1,1,1]
 
//i=isolated, c=connected, p=passed, pc=passed & connected
function Pval(pos)
{
	var type, c, dbl, val
	
	if ( !IF( AND( P, KM[ pos ] ) ) ) type = 'i'
	if ( IF( AND( P, tbPc[ pos ] ) ) ) 
	{
		type = 'c'
		c = 1
	}
	if ( !IF( AND( p, tbPp[ pos ] ) ) ) type = 'p'
	if (c && type == 'p') type = 'pc'
	
	if ( IF( AND( P, tbPd[ pos ] ) ) ) dbl = 1
	
	val = tbPvl[ pos ] * ( type ? tbPx[ tbRank[ pos ] ][ type ] : 1 )
	if ( dbl ) val *= .75
	
	return val
}

function pval(pos)
{
	var type, c, dbl, val
	
	if ( !IF( AND( p, KM[ pos ] ) ) ) type = 'i'
	if ( IF( AND( p, tbPc[ pos ] ) ) ) 
	{
		type = 'c'
		c = 1
	}
	if ( !IF( AND( P, tbpp[ pos ] ) ) ) type = 'p'
	if (c && type == 'p') type = 'pc'
	
	if ( IF( AND( p, tbPd[ pos ] ) ) ) dbl = 1
	
	val = tbpvl[ pos ] * ( type ? tbpx[ tbRank[ pos ] ][ type ] : 1 )
	if ( dbl ) val *= .75
	
	return val
}

//integration with main program
function upBin(fromId, toId, pieceToBag, moveType)
{
	switch( moveType )
	{
		case 'enPassant':
			var loc = boardPosition[fromId] > 0 ? toId+8 : toId-8
			updateBoards( fromId, toId, boardPosition[fromId] )
			updateBoards( loc, loc, pieceToBag )
			break
		case 'promote':
			var pr = document.getElementById('promoteTo').value
			updateBoards( toId, toId, ( boardPosition[fromId] > 0 ? pr : -pr ) )
			updateBoards( fromId, fromId, boardPosition[fromId] )
			if (pieceTaken) updateBoards(toId, toId, pieceToBag)
			break
		case 'kingside':
			if ( boardPosition[fromId] > 0 ) updateBoards( 63, 61, 3 )
			else updateBoards( 7, 5, -3 )
			updateBoards( fromId, toId, boardPosition[fromId] )
			break
		case 'queenside':
			if ( boardPosition[fromId] > 0 ) updateBoards( 56, 59, 3 )
			else updateBoards( 0, 3, -3 )
			updateBoards( fromId, toId, boardPosition[fromId] )
			break
		default:
			updateBoards( fromId, toId, boardPosition[fromId] )
			if (pieceTaken) updateBoards(toId, toId, pieceToBag)
			break
	}
}

var boardPositionNames = [
'a8','b8','c8','d8','e8','f8','g8','h8',
'a7','b7','c7','d7','e7','f7','g7','h7',
'a6','b6','c6','d6','e6','f6','g6','h6',
'a5','b5','c5','d5','e5','f5','g5','h5',
'a4','b4','c4','d4','e4','f4','g4','h4',
'a3','b3','c3','d3','e3','f3','g3','h3',
'a2','b2','c2','d2','e2','f2','g2','h2',
'a1','b1','c1','d1','e1','f1','g1','h1']

function listIdsBetween( id1, id2 ) //lists ids on diagonal and straight vectors, inclusive
{
	id1 = parseInt(id1)
	id2 = parseInt(id2)
	
	/* Convert ids to x,y */
	var Y1, X1, Y2, X2
	
	Y1 = Math.floor(id1/8)
	X1 = id1%8
			
	Y2 = Math.floor(id2/8)
	X2 = id2%8
	
	var board = [
	[0,1,2,3,4,5,6,7],
	[8,9,10,11,12,13,14,15],
	[16,17,18,19,20,21,22,23],
	[24,25,26,27,28,29,30,31],
	[32,33,34,35,36,37,38,39],
	[40,41,42,43,44,45,46,47],
	[48,49,50,51,52,53,54,55],
	[56,57,58,59,60,61,62,63]]
	
	var answer = []
	
	if ( Y2 == Y1)
	{
		for (var a=Math.min(X1,X2);a<=Math.max(X1,X2);a++)
		{
			answer.push(  board[Y2][a] )
		}
		return answer
	}
	if (Y2 != Y1 && X2 == X1)
	{
		for (var a=Math.min(Y1,Y2);a<=Math.max(Y1,Y2);a++)
		{
			answer.push( board[a][X2] )
		}
		return answer
	}
	if (Y2 != Y1 && X2 != X1 && Math.abs( Y2-Y1 ) == Math.abs( X2-X1 ) )
	{
		var b = (Y1 < Y2 ? X1 : X2)
		for (var a=Math.min(Y1,Y2); a<=Math.max(Y1,Y2); a++)
		{
			answer.push( board[a][b] )
			if (Y1 < Y2) X1 < X2 ? b++ : b--
			else X2 < X1 ? b++ : b-- 
		}
		return answer
	}
}

function listAxis( id1, id2 )
{
	var axis, outer1, outer2, index1, index2
	
	if ( tbVector[id1] && tbVector[id1][id2] ) index1 = tbVector[id1][id2].length-1
	else outer1 = id1
	
	if ( tbVector[id2] && tbVector[id2][id1] ) index2 = tbVector[id2][id1].length-1
	else outer2 = id2
	
	if ( index1 != undefined ) outer1 = tbVector[id1][id2][index1]
	if ( index2 != undefined ) outer2 = tbVector[id2][id1][index2]
	
	return boardPositionNames[ Math.max( outer1, outer2 ) ] + boardPositionNames[ Math.min( outer1, outer2 ) ]
}

//make table for ids between - index1:id1, index2: id2
var tbIdsBetween = []

function mIdsBetween()
{
	for ( var a=0; a<64; a++)
	{
		tbIdsBetween[a] = []
		for (var b=0; b<64; b++)
		{
			if (a != b)
			{ 
				tbIdsBetween[a][b] = listIdsBetween( a, b )
				if ( tbIdsBetween[a][b] ) tbIdsBetween[a][b]['x'] = listAxis( a, b )
			}
		}
	}
}

function listIdAfter( id1, id2 ) //lists one id after argument id2 on diagonal and straight vectors
{
	id1 = parseInt(id1)
	id2 = parseInt(id2)
	
	/* Convert ids to x,y */
	var Y1, X1, Y2, X2
	
	Y1 = Math.floor(id1/8)
	X1 = id1%8
			
	Y2 = Math.floor(id2/8)
	X2 = id2%8
	
	var board = [
	[0,1,2,3,4,5,6,7],
	[8,9,10,11,12,13,14,15],
	[16,17,18,19,20,21,22,23],
	[24,25,26,27,28,29,30,31],
	[32,33,34,35,36,37,38,39],
	[40,41,42,43,44,45,46,47],
	[48,49,50,51,52,53,54,55],
	[56,57,58,59,60,61,62,63]]
	
	var answer
	
	if ( Y2 == Y1 )
	{
		if ( X1 > X2 && board[Y2][X2-1] != undefined ) answer = board[Y2][X2-1]
		else if ( X1 < X2 && board[Y2][X2+1] != undefined ) answer = board[Y2][X2+1]
		else answer = undefined
		return answer
	}
	if ( Y2 != Y1 && X2 == X1 )
	{
		if ( Y1 > Y2 && board[Y2-1] != undefined ) answer = board[Y2-1][X2]
		else if ( Y1 < Y2 && board[Y2+1] != undefined ) answer = board[Y2+1][X2]
		else answer = undefined
		return answer
	}
	if ( Y2 != Y1 && X2 != X1 )
	{
		if (Y1 > Y2 && X1 > X2 && board[Y2-1] && board[Y2-1][X2-1] != undefined ) answer = board[Y2-1][X2-1]
		else if (Y1 > Y2 && X1 < X2 && board[Y2-1] && board[Y2-1][X2+1] != undefined ) answer = board[Y2-1][X2+1]
		else if (Y1 < Y2 && X1 < X2 && board[Y2+1] && board[Y2+1][X2+1] != undefined ) answer = board[Y2+1][X2+1]
		else if (Y1 < Y2 && X1 > X2 && board[Y2+1] && board[Y2+1][X2-1] != undefined ) answer = board[Y2+1][X2-1]
		else answer = undefined
		return answer
	}
}

//make table listing one id after piece (index1) attacked by sliding pieces - index1:id1, index2: id2
var tbIdAfter = []

function mIdAfter()
{
	for ( var a=0; a<64; a++)
	{
		tbIdAfter[a] = []
		for (var b=0; b<64; b++)
		{
			if (a != b)
			{ 
				tbIdAfter[a][b] = listIdAfter( a, b )
			}
		}
	}
}

function listVector( id1, id2 ) //lists ids on diagonal and straight vectors after id1, from the direction of id2
{
	id1 = parseInt(id1)
	id2 = parseInt(id2)
	
	/* Convert ids to x,y */
	var Y1, X1, Y2, X2
	
	Y1 = Math.floor(id1/8)
	X1 = id1%8
			
	Y2 = Math.floor(id2/8)
	X2 = id2%8
	
	var board = [
	[0,1,2,3,4,5,6,7],
	[8,9,10,11,12,13,14,15],
	[16,17,18,19,20,21,22,23],
	[24,25,26,27,28,29,30,31],
	[32,33,34,35,36,37,38,39],
	[40,41,42,43,44,45,46,47],
	[48,49,50,51,52,53,54,55],
	[56,57,58,59,60,61,62,63]]
	
	var answer = []
	
	if ( Y2 == Y1)
	{
		if (X1 < X2)
		{
			for (var a=X1-1; a>=0; a--)
			{
				if (board[Y2][a] != undefined) answer.push(  board[Y2][a] )
			}
			
			if (answer.length > 0  != undefined) return answer
			else return undefined
		}
		else if (X1 > X2)
		{
			for (var a=X1+1; a<8; a++)
			{
				if (board[Y2][a] != undefined) answer.push(  board[Y2][a] )
			}
			
			if (answer.length > 0) return answer
			else return undefined
		}
	}
	if (Y2 != Y1 && X2 == X1)
	{
		if (Y1 < Y2)
		{
			for (var a=Y1-1; a>=0; a--)
			{
				if (board[a][X2]  != undefined) answer.push(  board[a][X2] )
			}
			
			if (answer.length > 0) return answer
			else return undefined
		}
		else if (Y1 > Y2)
		{
			for (var a=Y1+1; a<8; a++)
			{
				if (board[a][X2]  != undefined) answer.push(  board[a][X2] )
			}
			
			if (answer.length > 0) return answer
			else return undefined
		}
	}
	if (Y2 != Y1 && X2 != X1)
	{
		answer['d'] = 1
		
		if (Y1 < Y2 && X1 < X2)
		{
			for (var a=Y1-1; a>=0; a--)
			{
				if (board[a][--X1]  != undefined) answer.push(  board[a][X1] )
			}
			
			if (answer.length > 0) return answer
			else return undefined
		}
		else if (Y1 > Y2 && X1 > X2)
		{
			for (var a=Y1+1; a<8; a++)
			{
				
				if (board[a][++X1]  != undefined) answer.push(  board[a][X1] )
			}
			
			if (answer.length > 0) return answer
			else return undefined
		}
		else if (Y1 > Y2 && X1 < X2)
		{
			for (var a=Y1+1; a<8; a++)
			{
				
				if (board[a][--X1]  != undefined) answer.push(  board[a][X1] )
			}
			
			if (answer.length > 0) return answer
			else return undefined
		}
		else if (Y1 < Y2 && X1 > X2)
		{
			for (var a=Y1-1; a>=0; a--)
			{
				
				if (board[a][++X1]  != undefined) answer.push(  board[a][X1] )
			}
			
			if (answer.length > 0) return answer
			else return undefined
		}
	}
}

//make table for vectors extending beyond id1 from direction of id2 - index1:id1, index2: id2
var tbVector = []

function mTbVector()
{
	for ( var a=0; a<64; a++)
	{
		tbVector[a] = []
		for (var b=0; b<64; b++)
		{
			if (a != b)
			{ 
				tbVector[a][b] = listVector( a, b )
			}
		}
	}
}

//king attack
var KAtkF3 = [] // front 3 squares white king

function mKAtkF3()
{
	var a = '0000000000000000000000000000000000000000000000000000000000000000000111000000000000000000000000000000'
	
	for (var b=63; b>=0; b--)
	{
		KAtkF3[b] = [[],[]]
		var c0 = parseInt( ( a.substr(11,8) + a.substr(21,8) + a.substr(31,8) + a.substr(41,8) ), 2), 
			c1 = parseInt( ( a.substr(51,8) + a.substr(61,8) + a.substr(71,8) + a.substr(81,8) ), 2)
		
		KAtkF3[b][0].push(c0)
		KAtkF3[b][1].push(c1)
		
		if (b && b%8 == 0) a = a.substr(3,100) + '000'
		else a = a.substr(1,100) + '0'
	}
}

var kAtkF3 = [] // front 3 squares black king

function mkAtkF3()
{
	var a = '0000000000000000000000000000001110000000000000000000000000000000000000000000000000000000000000000000'
	
	for (var b=0; b<64; b++)
	{
		kAtkF3[b] = [[],[]]
		var c0 = parseInt( ( a.substr(11,8) + a.substr(21,8) + a.substr(31,8) + a.substr(41,8) ), 2), 
			c1 = parseInt( ( a.substr(51,8) + a.substr(61,8) + a.substr(71,8) + a.substr(81,8) ), 2)
		
		kAtkF3[b][0].push(c0)
		kAtkF3[b][1].push(c1)
		
		if (b && (b+1)%8 == 0) a = '000' + a.substr(0,97)
		else a = '0' + a.substr(0,99)
	}
}

//center board control table
var tbCtr =    [0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0,
		0,0,1,1,1,1,0,0,
		0,0,1,1,1,1,0,0,
		0,0,1,1,1,1,0,0,
		0,0,1,1,1,1,0,0,
		0,0,1,1,1,1,0,0,
		0,0,1,1,1,1,0,0,
		0,0,0,0,0,0,0,0,
		0,0,0,0,0,0,0,0]

//piece values for board control
var tbPcVal = [0, 1024, 1000, 500, 325, 325, 100]
tbPcVal[-1] = 1024
tbPcVal[-2] = 1000
tbPcVal[-3] = 500
tbPcVal[-4] = 325
tbPcVal[-5] = 325
tbPcVal[-6] = 100

//analyze board 
function az()
{
	var scoreW = 0,
		scoreB = 0,
		bCountW=0, bCountB=0, //bishop count
		BasArr = [], //array of attack sets - include "attacks" on friendly pieces
		WasArr = []  //array of attack sets - include "attacks" on friendly pieces
	
	//black available moves
	var Bam = [], BamAS = [] //available moves, and attack set (includes friendly pieces to evaluate captures by king)
	
	for (var a in boardPosition)
	{
		a = parseInt(a)
		
		if (boardPosition[a] < 0)
		{
			switch (boardPosition[a])
			{
				case -1:
					Bam[ a ] = kAM( a )
					BasArr[ a ] = KAS( a )
					BamAS = BamAS.concat( BasArr[ a ] )
					break
				case -2:
					Bam[ a ] = qAM( a )
					BasArr[ a ] = QAS( a )
					BamAS = BamAS.concat( BasArr[ a ] )
					scoreB += 1000
					break
				case -3:
					Bam[ a ] = rAM( a ) 
					BasArr[ a ] = RAS( a )
					BamAS = BamAS.concat( BasArr[ a ] )
					scoreB += 500
					break
				case -4:
					Bam[ a ] = bAM( a )
					BasArr[ a ] = BAS( a )
					BamAS = BamAS.concat( BasArr[ a ] )
					scoreB += 325
					bCountB++
					break
				case -5:
					Bam[ a ] = nAM( a )
					BasArr[ a ] = NAS( a )
					BamAS = BamAS.concat( BasArr[ a ] )
					scoreB += 325
					break
				case -6:
					Bam[ a ] = pAM( a )
					BasArr[ a ] = pAS( a )
					scoreB += 100
					break
			}
		}
	}

//log board analysis
if ( logStats.on ) 
{
	console.log ('-------------------------------')
	console.log ( moveCount%2 == 0 ? 'white\'s turn' : 'black\'s turn' )
}

if ( logStats.on ) 
{
	var materialB = scoreB
	console.log ('material black: ' + materialB)
	console.log( (bCountB == 2) ? 'black bishop pair: +50' : 'bishop bonus: none' )
}

	//white available moves
	var Wam = [], WamAS = [], pcap = pAMcap()
	
	for (var a in boardPosition)
	{
		a = parseInt(a)
		
		if (boardPosition[a] > 0)
		{
			switch (boardPosition[a])
			{
				case 1:
					BamAS = BamAS.concat( pcap )
				
					Wam[ a ] = []
					var array = AND( KM[a], NOT( WB ) )
					
					for (var x=0; x<64; x++)
					{
						if ( IF( AND( M[x], array ) ) && BamAS.indexOf( x ) == -1) 
						{
							Wam[ a ].push( x )
						}
					}
					WasArr[ a ] = KAS( a )
					WamAS = WamAS.concat( WasArr[ a ] )
					break
				case 2:
					Wam[ a ] = QAM( a )
					WasArr[ a ] = QAS( a )
					WamAS = WamAS.concat( WasArr[ a ] )
					scoreW += 1000
					break
				case 3:
					Wam[ a ] = RAM( a )
					WasArr[ a ] = RAS( a )
					WamAS = WamAS.concat( WasArr[ a ] )
					scoreW += 500
					break
				case 4:
					Wam[ a ] = BAM( a )
					WasArr[ a ] = BAS( a )
					WamAS = WamAS.concat( WasArr[ a ] )
					scoreW += 325
					bCountW++
					break
				case 5:
					Wam[ a ] = NAM( a )
					WasArr[ a ] = NAS( a )
					WamAS = WamAS.concat( WasArr[ a ] )
					scoreW += 325
					break
				case 6:
					Wam[ a ] = PAM( a )
					WasArr[ a ] = PAS( a )
					scoreW += 100
					break
			}
		}
	}

//log board analysis
if ( logStats.on ) 
{
	var materialW = scoreW
	console.log ('material white: ' + materialW)
	console.log( (bCountW == 2) ? 'white bishop pair: +50' : 'bishop bonus: none' )
}

	checkBlack = []
	checkWhite = []
	castleCheckBlack = []
	castleCheckWhite = []
	
	var bkPos = boardPosition.indexOf( -1 ), wkPos = boardPosition.indexOf( 1 ),
		Pcap = PAMcap()
	
	//trim white
	for (var a in Wam)
	{
		//checks to black
		if (Wam[a].indexOf( bkPos ) != -1) checkBlack.push ( a )
		if (Wam[a].indexOf(1) != -1 || Wam[a].indexOf(2) != -1 || Wam[a].indexOf(3) != -1) castleCheckBlack.push( 'queenside' )
		if (Wam[a].indexOf(5) != -1 || Wam[a].indexOf(6) != -1) castleCheckBlack.push( 'kingside' )
	
		a = parseInt(a)
		
		if ( a != wkPos )
		{
			for (var b in Bam) 
			{
				b = parseInt(b)
				
				if ( Bam[b].indexOf(a) != -1 && tbIdsBetween[b][wkPos] && tbIdsBetween[b][wkPos].indexOf( a ) != -1 )
				{
					//test if no pieces behind protecting piece
					var idsBtn1 = tbIdsBetween[a][wkPos], t = 1
					
					for (var l=1; l<idsBtn1.length-1; l++)
					{
						if ( boardPosition[ idsBtn1[l] ] ) t = 0
					}
					
					if ( t )
					{
						var idsBtn2 = tbIdsBetween[b][wkPos]
						
						for (var c=Wam[a].length-1; c>=0; c--)
						{
							if ( idsBtn2.indexOf( Wam[a][c] ) == -1 )
							{
								if ( Wam[a]['e'] && c == Wam[a].length-1 ) Wam[a]['e'] = 0 // unset en passant flag
								Wam[a].splice(c, 1)
							}
						}
						
						Wam[a].p = idsBtn2.x  //flag that piece is pinned on this axis
					}
				}
			}
		}
	}
	
	//trim black
	
	WamAS = WamAS.concat( Pcap ) //white pawn captures
	
	//trim black king moves
	for (var a=Bam[ bkPos ].length; a>=0; a--)
	{
		if ( WamAS.indexOf( Bam[ bkPos ][a] ) != -1 ) 
		{
			Bam[ bkPos ].splice(a, 1)
		}
	}
	
	for (var a in Bam)
	{
		
		//checks to white
		if (Bam[a].indexOf( wkPos ) != -1) checkWhite.push ( a )
		if (Bam[a].indexOf(57) != -1 || Bam[a].indexOf(58) != -1 || Bam[a].indexOf(59) != -1) castleCheckWhite.push( 'queenside' )
		if (Bam[a].indexOf(61) != -1 || Bam[a].indexOf(62) != -1) castleCheckWhite.push( 'kingside' )
	
		a = parseInt(a)
		
		if ( a != bkPos )
		{
			for (var b in Wam) 
			{
				b = parseInt(b)
				
				if ( Wam[b].indexOf(a) != -1 && tbIdsBetween[b][bkPos] && tbIdsBetween[b][bkPos].indexOf( a ) != -1 )
				{
					//test if no pieces behind protecting piece
					var idsBtn1 = tbIdsBetween[a][bkPos], t = 1
					
					for (var l=1; l<idsBtn1.length-1; l++)
					{
						if ( boardPosition[ idsBtn1[l] ] ) t = 0
					}
					
					if ( t )
					{
						var idsBtn2 = tbIdsBetween[b][bkPos]
						
						for (var c=Bam[a].length-1; c>=0; c--)
						{
							if ( idsBtn2.indexOf( Bam[a][c] ) == -1 )
							{
								if ( Bam[a]['e'] && c == Bam[a].length-1 ) Bam[a]['e'] = 0 // unset en passant flag
								Bam[a].splice(c, 1)
							}
						}
						
						Bam[a].p = idsBtn2.x  //flag that piece is pinned on this axis
					}
				}
			}
		}
	}

	// Show Checkmate
	
	// black checking white
	if (checkWhite.length > 0 )
	{
		var saveWhiteKing = 0
		
		if ( boardPosition[ checkWhite[0] ] != -6 && boardPosition[ checkWhite[0] ] != -5 )
		{
			var idAft = tbIdAfter[ checkWhite[0] ][ wkPos ], idx = Wam[wkPos].indexOf( idAft )
				
			if ( idx != -1 ) 
			{
				Wam[wkPos].splice( idx, 1 )
			}
		}
		
		if ( checkWhite.length > 1 && Wam[wkPos].length == 0 ) checkmateW = 1
		else if ( checkWhite.length > 1 && Wam[wkPos].length > 0 )
		{
			for ( var h in Wam )
			{
				if ( Number( h ) != wkPos )
				{
					for (var i=Wam[h].length; i>=0; i--)
					{
						Wam[h].splice( i, 1 )
					}
				}
			}
		}
		else if (checkWhite.length == 1)
		{
			if ( boardPosition[ checkWhite[0] ] == -5 ) // black knight
			{
				if ( Wam[wkPos].length > 0 ) saveWhiteKing = 1
				for (var k in Wam)
				{
					if ( k != wkPos )
					{
						for (var j=Wam[k].length-1; j>=0; j--)
						{
							if ( Wam[k][j] != checkWhite[0] ) 
							{
								Wam[k].splice(j,1)
							}
							else saveWhiteKing = 1
						}
					}
				}
			}
			if ( boardPosition[ checkWhite[0] ] != -5 ) // checks by pieces other than knight
			{
				var idsBetween = tbIdsBetween[ boardPosition.indexOf( 1 ) ][ checkWhite[0] ]
				
				for (var k in Wam)
				{	
					for (var j=Wam[k].length-1; j>=0; j--)
					{
						if (boardPosition[k] == 1 && Wam[k].length > 0) saveWhiteKing = 1
						else if (idsBetween.indexOf( Wam[k][j] ) == -1)
						{
							if ( Wam[k]['e'] && j == Wam[k].length-1 ) Wam[k]['e'] = 0 // unset en passant flag
							Wam[k].splice(j,1)
						}
						else saveWhiteKing = 1
					}
				}
			}
			if (saveWhiteKing == 0) checkmateW = 1
		}
		else checkmateW = 0
	}
	
		
	// white is checking black
	if (checkBlack.length > 0 )
	{
		var saveBlackKing = 0
		
		if ( boardPosition[ checkBlack[0] ] != 6 && boardPosition[ checkBlack[0] ] != 5 )
		{
			var idAft = tbIdAfter[ checkBlack[0] ][ bkPos ], idx = Bam[bkPos].indexOf( idAft )
			
			if ( idx != -1 )
			{
				Bam[bkPos].splice( idx, 1 )
			}
		}
		
		if ( checkBlack.length > 1 && Bam[bkPos].length == 0 ) checkmateB = 1
		else if ( checkBlack.length > 1 && Bam[bkPos].length > 0 )
		{
			for ( var h in Bam )
			{
				if ( Number( h ) != bkPos )
				{
					for (var i=Bam[h].length; i>=0; i--)
					{
						Bam[h].splice( i, 1 )
					}
				}
			}
		}
		else if (checkBlack.length == 1)
		{
			if ( boardPosition[ checkBlack[0] ] == 5 ) // knight
			{
				if ( Bam[bkPos].length > 0 ) saveBlackKing = 1
				for (var k in Bam)
				{
					if ( k != bkPos )
					{
						for (var j=Bam[k].length-1; j>=0; j--)
						{
							if ( Bam[k][j] != checkBlack[0] ) 
							{
								Bam[k].splice(j,1)
							}
							else saveBlackKing = 1
						}
					}
					
					BasArr[k] = Bam[k].slice(0)
				}
			}
			if ( boardPosition[ checkBlack[0] ] != 5 ) // checks by pieces other than knight
			{
				var idsBetween = tbIdsBetween[ boardPosition.indexOf( -1 ) ][ checkBlack[0] ]
				
				for (var k in Bam)
				{
					for (var j=Bam[k].length-1; j>=0; j--)
					{
						if (boardPosition[k] == -1 && Bam[k].length > 0) saveBlackKing = 1
						else if (idsBetween.indexOf( Bam[k][j] ) == -1) 
						{
							if ( Bam[k]['e'] && j == Bam[k].length-1 ) Bam[k]['e'] = 0 // unset en passant flag
							Bam[k].splice(j,1)
						}
						else saveBlackKing = 1
					}
					
					BasArr[k] = Bam[k].slice(0)
				}
			}
			if (saveBlackKing == 0) checkmateB = 1
		}
		else checkmateB = 0
	}
	
	
	/* Add castling available moves */
	if ( boardPosition[4] == -1 && castleHistory.indexOf( 4 ) == -1 && checkBlack.length == 0 )
	{
		if ( !boardPosition[1] && !boardPosition[2] && !boardPosition[3] && castleHistory.indexOf( 0 ) == -1 && castleCheckBlack.indexOf('queenside') == -1 )
		{
			Bam[4].push(2)
		}
		
		if ( !boardPosition[5] && !boardPosition[6] && castleHistory.indexOf(7) == -1 && castleCheckBlack.indexOf('kingside') == -1)
		{
			Bam[4].push(6)
		}
	}
	
	if ( boardPosition[60] == 1 && castleHistory.indexOf(60) == -1 && checkWhite.length == 0 )
	{
		if ( !boardPosition[57] && !boardPosition[58] && !boardPosition[59] && castleHistory.indexOf(56) == -1 && castleCheckWhite.indexOf('queenside') == -1)
		{
			Wam[60].push(58)
		}
		
		if ( !boardPosition[61] && !boardPosition[62] && castleHistory.indexOf(63) == -1 && castleCheckWhite.indexOf('kingside') == -1)
		{
			Wam[60].push(62)
		}
	}
	
	// calculate score
	
	//board control (static exchange evaluation, see)

	if ( moveCount%2 == 0 )
	{
		var mobW = [] //mobility white
		
		for ( var w in Wam )
		{
			for ( var w1=0; w1<Wam[w].length; w1++ )
			{
				if ( mobW.indexOf( Wam[w][w1] ) == -1 ) mobW.push( Wam[w][w1] )
			}
		}
		
		//evaluate squares to which white can move
		for (var s in mobW)
		{
			var u = mobW[s],
				pc = [], //pieces: arrays including pieces behind
				firstMove = 1,
				epVar, epIndex, epScore //if set, compare two evaluations with and without en passant move
	
	//log board analysis			
	if (logStats.on && logStats.square) console.log('---------------\nsquare: ' + u)
	
			//get ids of attackers
			for (var x in Wam)
			{
				var wx = Wam[x].indexOf( u )
			
				if ( wx != -1 )
				{
					if ( boardPosition[x] != 6 && boardPosition[x] != 1 ) pc.push( [x] )
					if ( boardPosition[x] == 6 )
					{
						//add flag that first move must be this pawn
						if ( !( Wam[x].e && wx == Wam[x].length-1 )  ) // if not en passant
						{
							pc.push( [x,'p'] )
							firstMove = 'p'
						}
						else 
						{
							epIndex = pc.length // en passant eval set, equals index in pc of capturing and black pawns
							pc.push( [u+8] )
							pc.push( [x,'p'] )
							firstMove = 'p'
						}
					}
				}
			}
		
			for (var x in BasArr)
			{
				if ( BasArr[x].indexOf( u ) != -1 ) pc.push( [x] )
			}
		
			//add pawn captures
			if (epIndex == undefined)
			{
				if ( boardPosition[ tbR7[u] ] == 6 ) pc.push( [ tbR7[u] ] )
				if ( boardPosition[ tbR9[u] ] == 6 ) pc.push( [ tbR9[u] ] )
			}
			
			//add white king potential captures
			if ( WasArr[ wkPos ].indexOf( u ) != -1 ) pc.push( [wkPos] )
		
			//get sliding pieces behind attackers
			for (var x in pc)
			{
				var ids = tbVector[ pc[x][0] ][ u ]
				
				//diagonal vectors
				if (ids)
				{
					if ( ids.d )
					{
						var y = -1
						
						while ( y < ids.length )
						{
							y++
							
							if ( Math.abs( boardPosition[ pc[x][0] ] ) == 2 || Math.abs( boardPosition[ pc[x][0] ] ) == 4 || Math.abs( boardPosition[ pc[x][0] ] ) == 6 )
							{
								switch( boardPosition[ ids[y] ] )
								{
									case 0:
										break
									case 2:
									case 4:
										//test if piece is pinned
										if ( tbIdsBetween[u][ ids[y] ].x != Wam[ ids[y] ].p )
										{
											pc[x].push( ids[y] )
											break
										}
										else
										{
											y = ids.length
											break
										}
									case -2:
									case -4:
										//test if piece is pinned
										if ( tbIdsBetween[u][ ids[y] ].x != Bam[ ids[y] ].p )
										{
											pc[x].push( ids[y] )
											break
										}
										else
										{
											y = ids.length
											break
										}
									case 1:
									case -1:
									case 3:
									case -3:
									case 5:
									case -5:
									case 6:
									case -6:
										y = ids.length
										break
								}
							}
						}
					}
					else
					{
						var y = -1
						
						while ( y < ids.length )
						{
							y++
							
							if ( Math.abs( boardPosition[ pc[x][0] ] ) == 2 || Math.abs( boardPosition[ pc[x][0] ] ) == 3 || Math.abs( boardPosition[ pc[x][0] ] ) == 6 )
							{
								switch( boardPosition[ ids[y] ] )
								{
									case 0:
										break
									case 2:
									case 3:
										//test if piece is pinned
										if ( tbIdsBetween[u][ ids[y] ].x != Wam[ ids[y] ].p )
										{
											pc[x].push( ids[y] )
											break
										}
										else
										{
											y = ids.length
											break
										}
									case -2:
									case -3:
										//test if piece is pinned
										if ( tbIdsBetween[u][ ids[y] ].x != Bam[ ids[y] ].p )
										{
											pc[x].push( ids[y] )
											break
										}
										else
										{
											y = ids.length
											break
										}
									case 1:
									case -1:
									case 4:
									case -4:
									case 5:
									case -5:
									case 6:
									case -6:
										y = ids.length
										break
								}
							}
						}
					}
				}
			}
	 		
			var r = 1,
				tmpScW=0, tmpScB=0
			
			//evaluate score variation without the en passant move
			if ( epIndex != undefined )
			{	
				epVar = JSON.parse( JSON.stringify( pc ) )
			
				epVar[ epIndex+1 ].splice( 1, 1 ) //remove 'p' flag from capturing pawn to prevent it from being first move
				epVar.splice( epIndex, 1 ) //remove pieces behind black en passant pawn
				
	//log board analysis
	if (logStats.on && logStats.square) console.log('ep attackers locations: ' + epVar)
				
				//start loop
				epScore = 0
				
				while( r == 1 )
				{
					var tmpVal, lb = [2048], lw = [2048]
					
					//find lowest value white piece
					for (var z in epVar)
					{
						var piece = boardPosition[ epVar[z][0] ],
							tmpVal = tbPcVal[ piece ]
						
						if ( firstMove && piece == 6 && epVar[z][1] != 'p' ) continue // make sure pawn capture does not go first
						
						if ( piece > 0 )
						{
							if ( tmpVal < lw[0] ) lw = [ tmpVal, z ]
						}
						
					}
					
	 //log board analysis
	 if (logStats.on && logStats.square && logStats.exchangeProcess && epIndex != undefined) console.log('eplw: ' + lw)
	
					//stop loop if no white moves available
					if ( lw[0] == 2048 )
					{
						r = 0
					}
					else
					{
						if ( lw[0] != 1024 )
						{
							//white piece takes square
							if ( !firstMove )
							{
								tmpScW = lw[0]
								epVar[ lw[1] ].splice( 0,1 )
							}
							else if ( firstMove == 1 )
							{
								tmpScW = lw[0]
								epVar[ lw[1] ].splice( 0,1 )
							}
						
							//find lowest value black piece
							for (var z in epVar)
							{
								var piece = boardPosition[ epVar[z][0] ],
									tmpVal = tbPcVal[ piece ]
								
								if ( piece < 0 )
								{
									if ( tmpVal < lb[0] ) lb = [ tmpVal, z ]
								}
							}
	//log board analysis
	if (logStats.on && logStats.square && logStats.exchangeProcess && epIndex != undefined) console.log('eplb: ' + lb)
	 
							//(if black from previous cycle) white takes black
							epScore += tmpScB
							
							//stop loop if black is of lesser value or no black moves available
							if ( lb[0] < lw[0]-epScore )
							{
								epScore = -1
								r = 0
							}
							else if ( lb[0] == 2048 )
							{
								if ( firstMove )
								{
									epScore += 1
								}
								r = 0
							}
							else
							{
								if ( lb[0] != 1024)
								{
									if ( firstMove ) firstMove = 0
									
									//black takes white
									epScore -= tmpScW
									tmpScB = lb[0]
									epVar[ lb[1] ].splice( 0,1 )
								}
								else //make sure no white move available after black king move
								{
									var noW = 1
									
									//find black piece
									for (var z in epVar)
									{
										if( boardPosition[ epVar[z][0] ] > 0 ) noW = 0
									}
									
									if ( noW )
									{
										epScore -= tmpScW
										r = 0
									}
									else r = 0
								}
							}
						}
						else //make sure no black move available after white king move
						{
							var noB = 1
							
							//find black piece
							for (var z in epVar)
							{
								if( boardPosition[ epVar[z][0] ] < 0 ) noB = 0
							}
							
							if ( noB )
							{
								epScore += tmpScB
								r = 0
							}
							else r = 0
						}
					}
				}
			}
			
	//log board analysis
	if (logStats.on && logStats.square && epIndex != undefined) console.log('epScore: ' + epScore)
	if (logStats.on && logStats.square) console.log('attackers locations: ' + pc)
	
			//start loop (includes en passant move if possible)
			r = 1
			var xScore = 0
			tmpScW=0
			tmpScB=0
			
			while( r == 1 )
			{
				var tmpVal, lb = [2048], lw = [2048]
				
				//find lowest value white piece
				for (var z in pc)
				{
					var piece = boardPosition[ pc[z][0] ],
						tmpVal = tbPcVal[ piece ]
					
					if ( firstMove && piece == 6 && pc[z][1] != 'p' ) continue // make sure pawn capture does not go first
					
					if ( piece > 0 )
					{
						if ( tmpVal < lw[0] ) lw = [ tmpVal, z ]
					}
					
				}
				
				//white pawn promotion
				if ( lw[0] == 10 && u < 8 ) lw[0] = 100
				
				//test for en passant
				if ( firstMove == 'p')
				{
					var posEp = Number( pc[ lw[1] ][0] ) - 8 //empty square that capturing pawn takes
					
					if ( posEp-u == 8 && ( boardPosition[ tbL9[posEp] ] == -6 || boardPosition[ tbL7[posEp] ] == -6 ) )
					{
						scoreW -= 1
						lw[0] = 2048
					}
				}	
					
	//log board analysis
	if ( logStats.on && logStats.square && logStats.exchangeProcess ) console.log('lw: ' + lw)
	
				//stop loop if no white moves available
				if ( lw[0] == 2048 )
				{
					r = 0
				}
				else
				{
					if ( lw[0] != 1024 )
					{
						//white piece takes square
						if ( !firstMove )
						{
							tmpScW = lw[0]
							pc[ lw[1] ].splice( 0,1 )
						}
						else if ( firstMove == 1 )
						{
							tmpScW = lw[0]
							pc[ lw[1] ].splice( 0,1 )
							if ( boardPosition[u] ) xScore += tbPcVal[ boardPosition[u] ]
						}
						else if ( firstMove == 'p' )
						{
							tmpScW = lw[0]
							pc[ lw[1] ].splice( 0,2 )
							if ( epIndex != undefined ) xScore += 10 //en passant move
						}
					
						//find lowest value black piece
						for (var z in pc)
						{
							var piece = boardPosition[ pc[z][0] ],
								tmpVal = tbPcVal[ piece ]
							
							if ( piece < 0 )
							{
								if ( tmpVal < lb[0] ) lb = [ tmpVal, z ]
							}
						}
						
	//log board analysis
	if ( logStats.on && logStats.square && logStats.exchangeProcess ) console.log('lb: ' + lb)
	
						//black pawn promotion
						if ( lb[0] == 10 && u > 55 ) lb[0] = 100
		
						//white takes black
						xScore += tmpScB
						
						//stop loop if black is of lesser value or no black moves available
						if ( lb[0] < lw[0]-xScore )
						{
							xScore = -1
							r = 0
						}
						else if ( lb[0] == 2048 )
						{
							if ( firstMove ) 
							{
								xScore += boardPosition[u] ? 0 : 1
							}
							r = 0
						}
						else
						{
							if ( lb[0] != 1024)
							{
								if ( firstMove ) firstMove = 0
								
								//black takes white
								xScore -= tmpScW
								tmpScB = lb[0]
								pc[ lb[1] ].splice( 0,1 )
							}
							else //make sure no white move available after black king move
							{
								var noW = 1
								
								//find black piece
								for (var z in pc)
								{
									if( boardPosition[ pc[z][0] ] > 0 ) noW = 0
								}
								
								if ( noW )
								{
									xScore -= tmpScW
									r = 0
								}
								else r = 0
							}
						}
					}
					else //make sure no black move available after white king move
					{
						var noB = 1
						
						//find black piece
						for (var z in pc)
						{
							if( boardPosition[ pc[z][0] ] < 0 ) noB = 0
						}
						
						if ( noB )
						{
							if ( firstMove && boardPosition[u] ) xScore += tbPcVal[ boardPosition[u] ]
							xScore += tmpScB
							r = 0
						}
						else r = 0
					}
				}
			}
			
	//log board analysis
	if ( logStats.on && logStats.square ) console.log('xScore: ' + xScore)	
	
			if ( boardPosition[u] )
			{
				if ( xScore > 0 ) 
				{
					scoreW += Math.min( xScore, tbPcVal[ boardPosition[u] ] )
					if ( tbCtr[u] ) scoreW += 1
					
					//king attack
					var kAtk = 0
					if ( IF( AND( M[u], kAtkF3[ bkPos ] ) ) ) kAtk += 60
					if ( IF( AND( M[u], KM[ bkPos ] ) ) ) kAtk += 100
					
					scoreW += kAtk
	
	//log board analysis				
	if ( logStats.on && logStats.square && kAtk ) console.log( 'king attack: ' + kAtk )
					
				}
			}
			else
			{
				if ( epScore == undefined && xScore > 0 )
				{
					scoreW += 1
					if ( tbCtr[u] ) scoreW += 1
					
					//king attack
					var kAtk = 0
					if ( IF( AND( M[u], kAtkF3[ bkPos ] ) ) ) kAtk += 60
					if ( IF( AND( M[u], KM[ bkPos ] ) ) ) kAtk += 100
					
					scoreW += kAtk
	
	//log board analysis				
	if ( logStats.on && logStats.square && kAtk ) console.log( 'king attack: ' + kAtk )
					
				}
				else if ( epScore != undefined )
				{
					if ( xScore > 0 ) xScore = Math.min( 100, xScore )
					
					if ( epScore > 0 )
					{
						scoreW += Math.max( xScore, 1 )
						if ( tbCtr[u] ) scoreW += 1
						
						var kAtk = 0
						if ( IF( AND( M[u], kAtkF3[ bkPos ] ) ) ) kAtk += 60
						if ( IF( AND( M[u], KM[ bkPos ] ) ) ) kAtk += 100
						
						scoreW += kAtk
	
	//log board analysis				
	if ( logStats.on && logStats.square && kAtk ) console.log( 'king attack: ' + kAtk )
						
					}
					else if ( xScore > 0 ) 
					{
						scoreW += xScore
						if ( tbCtr[u] ) scoreW += 1
						
						var kAtk = 0
						if ( IF( AND( M[u], kAtkF3[ bkPos ] ) ) ) kAtk += 60
						if ( IF( AND( M[u], KM[ bkPos ] ) ) ) kAtk += 100
						
						scoreW += kAtk
	
	//log board analysis				
	if ( logStats.on && logStats.square && kAtk ) console.log( 'king attack: ' + kAtk )
						
					}
				}
			}
			
			epIndex = epVar = epScore = undefined
		}
	}
	else
	{
		var mobB = [] //mobility black
		
		for ( var w in Bam )
		{
			for ( var w1=0; w1<Bam[w].length; w1++ )
			{
				if ( mobB.indexOf( Bam[w][w1] ) == -1 ) mobB.push( Bam[w][w1] )
			}
		}
		
		//evaluate squares to which black can move
		for (var s in mobB)
		{
			var u = mobB[s],
				pc = [], //pieces: arrays including pieces behind
				firstMove = 1,
				epVar, epIndex, epScore //if set, compare two evaluations with and without en passant move
				
	//log board analysis
	if ( logStats.on && logStats.square ) console.log('square: ' + u)
	
			//get ids of attackers
			for (var x in Bam)
			{
				var wx = Bam[x].indexOf( u )
				
				if ( wx != -1 )
				{
					if ( boardPosition[x] != -6 && boardPosition[x] != -1 ) pc.push( [x] )
					if ( boardPosition[x] == -6 )
					{
						//add flag that first move must be this pawn
						if ( !( Bam[x].e && wx == Bam[x].length-1 )  ) // if not en passant
						{
							pc.push( [x,'p'] )
							firstMove = 'p'
						}
						else 
						{
							epIndex = pc.length // en passant eval set, equals index in pc of capturing and black pawns
							pc.push( [u+8] )
							pc.push( [x,'p'] )
							firstMove = 'p'
						}
					}
				}
			}
		
			for (var x in WasArr)
			{
				if ( WasArr[x].indexOf( u ) != -1 ) pc.push( [x] )
			}
		
			//add pawn captures
			if ( epIndex == undefined )
			{
				if ( boardPosition[ tbL7[u] ] == -6 ) pc.push( [ tbL7[u] ] )
				if ( boardPosition[ tbL9[u] ] == -6 ) pc.push( [ tbL9[u] ] )
			}
			
			//add white king potential captures
			if ( BasArr[ bkPos ].indexOf( u ) != -1 ) pc.push( [bkPos] )
		
			//get sliding pieces behind attackers
			for (var x in pc)
			{
				var ids = tbVector[ pc[x][0] ][ u ]
				
				//diagonal vectors
				if (ids)
				{
					if ( ids.d )
					{
						var y = -1
						
						while ( y < ids.length )
						{
							y++
							
							if ( Math.abs( boardPosition[ pc[x][0] ] ) == 2 || Math.abs( boardPosition[ pc[x][0] ] ) == 4 || Math.abs( boardPosition[ pc[x][0] ] ) == 6 )
							{
								switch( boardPosition[ ids[y] ] )
								{
									case 0:
										break
									case 2:
									case 4:
										//test if piece is pinned
										if ( tbIdsBetween[u][ ids[y] ].x != Wam[ ids[y] ].p )
										{
											pc[x].push( ids[y] )
											break
										}
										else
										{
											y = ids.length
											break
										}
									case -2:
									case -4:
										//test if piece is pinned
										if ( tbIdsBetween[u][ ids[y] ].x != Bam[ ids[y] ].p )
										{
											pc[x].push( ids[y] )
											break
										}
										else
										{
											y = ids.length
											break
										}
									case 1:
									case -1:
									case 3:
									case -3:
									case 5:
									case -5:
									case 6:
									case -6:
										y = ids.length
										break
								}
							}
						}
					}
					else
					{
						var y = -1
						
						while ( y < ids.length )
						{
							y++
							
							if ( Math.abs( boardPosition[ pc[x][0] ] ) == 2 || Math.abs( boardPosition[ pc[x][0] ] ) == 3 || Math.abs( boardPosition[ pc[x][0] ] ) == 6 )
							{
								switch( boardPosition[ ids[y] ] )
								{
									case 0:
										break
									case 2:
									case 3:
										//test if piece is pinned
										if ( tbIdsBetween[u][ ids[y] ].x != Wam[ ids[y] ].p )
										{
											pc[x].push( ids[y] )
											break
										}
										else
										{
											y = ids.length
											break
										}
									case -2:
									case -3:
										//test if piece is pinned
										if ( tbIdsBetween[u][ ids[y] ].x != Bam[ ids[y] ].p )
										{
											pc[x].push( ids[y] )
											break
										}
										else
										{
											y = ids.length
											break
										}
									case 1:
									case -1:
									case 4:
									case -4:
									case 5:
									case -5:
									case 6:
									case -6:
										y = ids.length
										break
								}
							}
						}
					}
				}
			}
	
			var r = 1,
			tmpScW=0, tmpScB=0
			
			//evaluate score variation without the en passant move
			if ( epIndex != undefined )
			{	
				epVar = JSON.parse( JSON.stringify( pc ) )
			
				epVar[ epIndex+1 ].splice( 1, 1 ) //remove 'p' flag from capturing pawn to prevent it from being first move
				epVar.splice( epIndex, 1 ) //remove pieces behind black en passant pawn
				
	//log board analysis
	if ( logStats.on && logStats.square ) console.log('ep attackers locations: ' + epVar)
				
				//start loop
				epScore = 0
				
				while( r == 1 )
				{
					var tmpVal, lb = [2048], lw = [2048]
					
					//find lowest value black piece
					for (var z in epVar)
					{
						var piece = boardPosition[ epVar[z][0] ],
							tmpVal = tbPcVal[ piece ]
						
						if ( firstMove && piece == -6 && epVar[z][1] != 'p' ) continue // make sure pawn capture does not go first
						
						if ( piece < 0 )
						{
							if ( tmpVal < lb[0] ) lb = [ tmpVal, z ]
						}
						
					}
					
	//log board analysis
	if ( logStats.on && logStats.square && logStats.exchangeProcess && epIndex != undefined ) console.log('eplb: ' + lb)
			
					//stop loop if no black moves available
					if ( lb[0] == 2048 )
					{
						r = 0
					}
					else
					{
						if ( lb[0] != 1024 )
						{
							//black piece takes square
							if ( !firstMove )
							{
								tmpScB = lb[0]
								epVar[ lb[1] ].splice( 0,1 )
							}
							else if ( firstMove == 1 )
							{
								tmpScB = lb[0]
								epVar[ lb[1] ].splice( 0,1 )
							}
						
							//find lowest value white piece
							for (var z in epVar)
							{
								var piece = boardPosition[ epVar[z][0] ],
									tmpVal = tbPcVal[ piece ]
								
								if ( piece > 0 )
								{
									if ( tmpVal < lw[0] ) lw = [ tmpVal, z ]
								}
							}
							
	//log board analysis
	if ( logStats.on && logStats.square && logStats.exchangeProcess && epIndex != undefined ) console.log('eplw: ' + lw)
					
							//black takes white
							epScore += tmpScW
							
							//stop loop if white is of lesser value or no white moves available
							if ( lw[0] < lb[0]-epScore )
							{
								epScore = -1
								r = 0
							}
							else if ( lw[0] == 2048 )
							{
								if ( firstMove ) 
								{
									epScore += 1
								}
								r = 0
							}
							else
							{
								if ( lw[0] != 1024)
								{
									if ( firstMove ) firstMove = 0
									
									//white takes black
									epScore -= tmpScB
									tmpScW = lw[0]
									epVar[ lw[1] ].splice( 0,1 )
								}
								else //make sure no black move available after white king move
								{
									var noB = 1
									
									//find black piece
									for (var z in epVar)
									{
										if( boardPosition[ epVar[z][0] ] < 0 ) noB = 0
									}
									
									if ( noB )
									{
										epScore -= tmpScB
										r = 0
									}
									else r = 0
								}
							}
						}
						else //make sure no white move available after black king move
						{
							var noW = 1
							
							//find black piece
							for (var z in epVar)
							{
								if( boardPosition[ epVar[z][0] ] > 0 ) noW = 0
							}
							
							if ( noW )
							{
								epScore += tmpScW
								r = 0
							}
							else r = 0
						}
					}
				}
				
				tmpScW=0
				tmpScB=0
				r = 1
			}
			
	//log board analysis
	if ( logStats.on && logStats.square && logStats.exchangeProcess && epIndex != undefined ) console.log('epScore: ' + epScore)
	if ( logStats.on && logStats.square ) console.log('attackers locations: ' + pc)
	
			//start loop (includes en passant move if possible)
			var xScore = 0
			
			while( r == 1 )
			{
				var tmpVal, lb = [2048], lw = [2048]
				
				//find lowest value black piece
				for (var z in pc)
				{
					var piece = boardPosition[ pc[z][0] ],
						tmpVal = tbPcVal[ piece ]
					
					if ( firstMove && piece == -6 && pc[z][1] != 'p' ) continue // make sure pawn capture does not go first
					
					if ( piece < 0 )
					{
						if ( tmpVal < lb[0] ) lb = [ tmpVal, z ]
					}
					
				}
				
				//black pawn promotion
				if ( lb[0] == 10 && u > 55 ) lb[0] = 100
				
				//test for en passant
				if ( firstMove == 'p')
				{
					var posEp = Number( pc[ lb[1] ][0] ) + 8 //empty square that capturing pawn takes
					
					if ( u-posEp == 8 && ( boardPosition[ tbR7[posEp] ] == 6 || boardPosition[ tbR9[posEp] ] == 6 ) )
					{
						scoreB -= 1
						lb[0] = 2048
					}
				}
				
	//log board analysis
	if ( logStats.on && logStats.square && logStats.exchangeProcess ) console.log('lb: ' + lb)
		
				//stop loop if no black moves available
				if ( lb[0] == 2048 )
				{
					r = 0
				}
				else
				{
					if ( lb[0] != 1024 )
					{
						//black piece takes square
						if ( !firstMove )
						{
							tmpScB = lb[0]
							pc[ lb[1] ].splice( 0,1 )
						}
						else if ( firstMove == 1 )
						{
							tmpScB = lb[0]
							pc[ lb[1] ].splice( 0,1 )
							if ( boardPosition[u] ) xScore += tbPcVal[ boardPosition[u] ]
						}
						else if ( firstMove == 'p' )
						{
							tmpScB = lb[0]
							pc[ lb[1] ].splice( 0,2 )
							if ( epIndex != undefined ) xScore += 10 //en passant move
						}
					
						//find lowest value white piece
						for (var z in pc)
						{
							var piece = boardPosition[ pc[z][0] ],
								tmpVal = tbPcVal[ piece ]
							
							if ( piece > 0 )
							{
								if ( tmpVal < lw[0] ) lw = [ tmpVal, z ]
							}
						}
						
						//white pawn promotion
						if ( lw[0] == 10 && u < 8 ) lw[0] = 100
						
	//log board analysis
	if ( logStats.on && logStats.square && logStats.exchangeProcess ) console.log('lw: ' + lw)
				
						//black takes white
						xScore += tmpScW
						
						//stop loop if white is of lesser value or no white moves available
						if ( lw[0] < lb[0]-xScore )
						{
							xScore = -1
							r = 0
						}
						else if ( lw[0] == 2048 )
						{
							if ( firstMove ) 
							{
								xScore += boardPosition[u] ? 0 : 1
							}
							r = 0
						}
						else
						{
							if ( lw[0] != 1024)
							{
								if ( firstMove ) firstMove = 0
								
								//white takes black
								xScore -= tmpScB
								tmpScW = lw[0]
								pc[ lw[1] ].splice( 0,1 )
							}
							else //make sure no black move available after white king move
							{
								var noB = 1
								
								//find black piece
								for (var z in pc)
								{
									if( boardPosition[ pc[z][0] ] < 0 ) noB = 0
								}
								
								if ( noB )
								{
									xScore -= tmpScB
									r = 0
								}
								else r = 0
							}
						}
					}
					else //make sure no white move available after black king move
					{
						var noW = 1
						
						//find black piece
						for (var z in pc)
						{
							if( boardPosition[ pc[z][0] ] > 0 ) noW = 0
						}
						
						if ( noW )
						{
							if ( firstMove && boardPosition[u] ) xScore += tbPcVal[ boardPosition[u] ]
							xScore += tmpScW
							r = 0
						}
						else r = 0
					}
				}
			}
			
	//log board analysis
	if ( logStats.on && logStats.square ) console.log('xScore: ' + xScore)
	
			if ( boardPosition[u] )
			{
				if ( xScore > 0 )
				{
					scoreB += Math.min( xScore, tbPcVal[ boardPosition[u] ] )
					if ( tbCtr[u] ) scoreB += 1
					
					//king attack
					var kAtk = 0
					if ( IF( AND( M[u], KAtkF3[ wkPos ] ) ) ) kAtk += 60
					if ( IF( AND( M[u], KM[ wkPos ] ) ) ) kAtk += 100
					
					scoreB += kAtk
	
	//log board analysis				
	if ( logStats.on && logStats.square && kAtk ) console.log( 'king attack: ' + kAtk )
					
				}
			}
			else
			{
				if ( epScore == undefined && xScore > 0 )
				{
					scoreB += 1
					if ( tbCtr[u] ) scoreB += 1
					
					//king attack
					var kAtk = 0
					if ( IF( AND( M[u], KAtkF3[ wkPos ] ) ) ) kAtk += 60
					if ( IF( AND( M[u], KM[ wkPos ] ) ) ) kAtk += 100
					
					scoreB += kAtk
	
	//log board analysis				
	if ( logStats.on && logStats.square && kAtk ) console.log( 'king attack: ' + kAtk )
					
				}
				else if ( epScore != undefined )
				{
					if ( xScore > 0 ) xScore = Math.min( 100, xScore )
					
					if ( epScore > 0 )
					{
						scoreB += Math.max( xScore, 1 )
						if ( tbCtr[u] ) scoreB += 1
						
						//king attack
						var kAtk = 0
						if ( IF( AND( M[u], KAtkF3[ wkPos ] ) ) ) kAtk += 60
						if ( IF( AND( M[u], KM[ wkPos ] ) ) ) kAtk += 100
						
						scoreB += kAtk
	
	//log board analysis				
	if ( logStats.on && logStats.square && kAtk ) console.log( 'king attack: ' + kAtk )
						
					}
					else if ( xScore > 0 ) 
					{
						scoreB += xScore
						if ( tbCtr[u] ) scoreB += 1
						
						//king attack
						var kAtk = 0
						if ( IF( AND( M[u], KAtkF3[ wkPos ] ) ) ) kAtk += 60
						if ( IF( AND( M[u], KM[ wkPos ] ) ) ) kAtk += 100
						
						scoreB += kAtk
	
	//log board analysis				
	if ( logStats.on && logStats.square && kAtk ) console.log( 'king attack: ' + kAtk )
						
					}
				}
			}
			
			epIndex = epVar = epScore = undefined
		}
	}
	
	//bishop pair
	if (bCountW == 2) scoreW += 50
	if (bCountB == 2) scoreB += 50
	
	if (checkmateB) scoreW += 30000
	if (checkmateW) scoreB += 30000
	
	var scoreWhite = scoreW - scoreB, scoreBlack = scoreB - scoreW
	
	return [scoreWhite, scoreBlack, Wam, Bam]
}

//function to update the boards with a set board position
function loadBoard(array)
{
	WB = [0,0]
	WB90 = [0,0]
	WB45cl = [0,0,0]
	WB45cc = [0,0,0]
	P = [0,0]
	
	BB = [0,0]
	BB90 = [0,0]
	BB45cl = [0,0,0]
	BB45cc = [0,0,0]
	p = [0,0]
	
	for (var a=0; a<64; a++)
	{
		if ( array[a] > 0 )
		{
			WB = OR( M[ a ], WB )
			WB90 = OR( M[ tb90[a] ], WB90 )
			WB45cl = OR45( M45[ tb45cl[a] ], WB45cl )
			WB45cc = OR45( M45[ tb45cc[a] ], WB45cc )
			
			if (array[a] == 6) P = OR(M[ a ], P)
		}
		
		if ( array[a] < 0)
		{
			BB = OR( M[ a ], BB )
			BB90 = OR( M[ tb90[a] ], BB90 )
			BB45cl = OR45( M45[ tb45cl[a] ], BB45cl )
			BB45cc = OR45( M45[ tb45cc[a] ], BB45cc )
			
			if (array[a] == -6) p = OR(M[ a ], p)
		}
	}
}

function countPieces(side)
{
	var count=0
	
	if ( !side )
	{
		for (var a=0; a<64; a++)
		{
			if ( boardPosition[a] ) count++
		}
	}
	else if ( side == 'w' )
	{
		for (var a=0; a<64; a++)
		{
			if ( boardPosition[a] > 0 ) count++
		}
	}
	else if ( side == 'b' )
	{
		for (var a=0; a<64; a++)
		{
			if ( boardPosition[a] < 0 ) count++
		}
	}
	
	return count
}

mTbShifts()
mKM()
mNM()
mM()
mM45()
mAMtb()
mTbVector()
mIdsBetween()
mIdAfter()
mTbFiles()
mTbNpen()
mTbPc()
mTbPd()
mTbPp()
mTbpp()
mTbNclsd()
mkAtkF3()
mKAtkF3()