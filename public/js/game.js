//game.js


var l = 0.1 ; 
//Core function to be call on init 
function GameStart () {
	window.scrollTo(0,1);
	//document.documentElement.requestFullscreen();
	main = {} ;
	//load Graphical Stuff
	webGlInit( main ) ; 
	//load Sounds stuff 
	soundInit( main ) ;

	

	startAGame( main )
	
}

function startAGame( main ) {

	createSpots( main ) ;  
	colorSpots( main ) ; 
	reveal( main, main.spots[0] )
	main.score = 0 
	main.lastT = 0 ; 
	main.timer = 60 ;
	main.currentMultiplier = 1 
	main.currentScore = 0 
	main.decayTimer = 0 
	main.change = true ;
	UiInit( main ) ; 

	tick.apply( main )	

}

function norm (x,y) { return Math.sqrt( x*x + y*y ) }
function UiInit ( main ) {

	main.ui = {} 
	main.ui.action = "none"
	main.ui.currentLine = [] ;
	main.ui.previousLine = [] ;
	var dragStart = function( e ) { 

		e.preventDefault();

		if ( event.type ==  "touchstart") {
			e = e.originalEvent.changedTouches[0]
		}
		if(e.offsetX==undefined)	 {
			e.offsetX = e.pageX-$(e.currentTarget||e.target).offset().left;
			e.offsetY = e.pageY-$(e.currentTarget||e.target).offset().top;
		}     

		x = 2 * e.offsetX / main.canvas.w - 1 ;
		y = 2 * e.offsetY / main.canvas.h - 1 ;
		main.ui.mousePosition = {x : x, y : y }
		if( main.ui.action == "none" ) {
			//check if 
			
			var spot = findSpot( main, x, y ) ; 
			if( spot ) {
				playSound( main, "cell" )
				spot.visited = true ; 
				main.ui.currentLine = [ spot ]
				main.ui.lastSpot = spot 
				reveal( main, spot )
				
				main.audio.ctx.listener.setPosition(main.audio.Mult  * x, main.audio.Mult  *  y, 0);
				
				dx = x - main.ui.lastSpot.x
				dy = y - main.ui.lastSpot.y
				var n = norm(dx,dy)
				dx/= n
				dy/= n
				//main.audio.ctx.listener.setOrientation( dx, 0, -dy, 0, -1 , 0);


				for( var i = 0 ; i < 6 ; i++ ) {
					if( spot.neighbourgs[i] && spot.neighbourgs[i].mine )
						playNote( main, spot.neighbourgs[i].x, spot.neighbourgs[i].y )
				}
				
				main.change = true ;
				main.ui.action = "drag" 

				main.currentScore = spot.countMine ; 
				main.currentMultiplier = 1 ;

			}
		}
	}
	, dragEnd = function( e ) { 
		main.ui.action = "none" 
		
		main.ui.previousLine.push( main.ui.currentLine )
		main.ui.currentLine = [] 
		
		//main.change = true ;
		main.score += Math.round( main.currentScore * main.currentMultiplier ) 
	}
	, dragMove = function( e ) { 

		e.preventDefault();
		if ( event.type ==  "touchmove") {
			e = e.originalEvent.changedTouches[0]
		}

		if(e.offsetX==undefined)	 {
			e.offsetX = e.pageX-$(e.currentTarget||e.target).offset().left;
			e.offsetY = e.pageY-$(e.currentTarget||e.target).offset().top;
		}   
		x = 2 * e.offsetX / main.canvas.w - 1 ;
		y = 2 * e.offsetY / main.canvas.h - 1 ;
		main.ui.mousePosition = {x : x, y : y }

		if( main.ui.action == "drag" ) {
			//check if 
			
			main.audio.ctx.listener.setPosition(main.audio.Mult  * x, main.audio.Mult  *  y, 0);
			
			dx = x - main.ui.lastSpot.x
			dy = y - main.ui.lastSpot.y
			var n = norm(dx,dy)
			dx/= n
			dy/= n
			//main.audio.ctx.listener.setOrientation( dx, 0, -dy, 0, -1 , 0);



			var spot = findSpot( main, x, y ) ; 
			if( spot ) {
				
				main.change = true ;
				main.ui.action = "drag" 

				if( spot != main.ui.lastSpot ) {
					playSound( main, "cell" )
					reveal( main, spot )
					
					if( spot.mine ) {
						playSound( main, "explosion" )
						main.currentScore /= 2 ; 
						return dragEnd() ;
					}

						for( var i = 0 ; i < 6 ; i++ ) {
							if( spot.neighbourgs[i] && spot.neighbourgs[i].mine )
								playNote( main, spot.neighbourgs[i].x, spot.neighbourgs[i].y )
						}
						if( spot.visited ) return 

						main.ui.lastSpot = spot 
						//verify if spot is in the list 
						for( var i = 0 ; i < main.ui.currentLine.length ; i++ ) {
							if( main.ui.currentLine[i] == spot ) {
								//if last of the list : remove
								if( i == main.ui.currentLine.length - 1 )
									 main.ui.currentLine.pop() ;

								return 						
							}					
						}
						spot.visited = true 
						//if not in the list : add to the list
						main.ui.currentLine.push( spot ) ;
						prevScore = main.currentScore * main.currentMultiplier
						main.currentScore += spot.countMine ; 
						main.currentMultiplier *= 1 + spot.countMine / 10  ;
					//	console.log( "+"+ main.currentScore * main.currentMultiplier  - prevScore )
					}
				}
			}
		}



		$(main.screen.canvas).mousedown( dragStart ) ;  
		$(main.screen.canvas).mousemove( dragMove ) ;  
		$(main.screen.canvas).mouseup( dragEnd ) ;  


		$(main.screen.canvas).on({ 'touchstart' : dragStart, 'touchmove' : dragMove,  'touchend' : dragEnd }) ;
		firstTime = true 
		
	}


	function findSpot( main, x, y ) {

		for( var i = 0 ; i < main.spots.length ; i++ ) {
			var spot = main.spots[i] ;
			if( (spot.x - x )*(spot.x - x ) + (spot.y - y )*(spot.y - y ) < l * l * 0.8) {

				return spot ; 
			}
		}
	}

	

function tick( t ) {

	var main = this ;

	//if( main.lastT == 0 ) main.lastT = t 

	var dt = t - main.lastT ; 
	dt = dt || 0 
	main.lastT = t
	
	main.timer -= dt/1000; ;

	if( main.timer < 0 ) {
		if( ! localStorage["bestScore"] ) localStorage["bestScore"] = 0 
		localStorage["bestScore"] = Math.max( localStorage["bestScore"],  main.score  ) 
		$("#GameScore").text(  main.score ) 
		$("#BestGameScore").text(  localStorage["bestScore"] ) 
		$('#myModal').modal()
		return 
	}
	main.decayTimer += dt

	if( main.decayTimer > 1000 ) {		
		main.currentMultiplier *= 0.95
		main.decayTimer = 0 
	}

	
	if( main.change )
		updateScreen( main ) ; 

	$("#timeRemaining").text( Math.round( main.timer ) + "s") 
	$("#currentLineScore").text( Math.round( main.currentScore * main.currentMultiplier )  ) 
	$("#score").text(  main.score ) 

	requestAnimationFrame( tick.bind( main  )) 
}

function webGlInit( main ) {


	
	main.screen = {}  ; 
	canvas = $('canvas')[0]
	main.canvas = {}
	main.canvas.w = $(canvas).width()  ; 
	main.canvas.h = $(canvas).height() ; 

	main.screen.w = 512 
	main.screen.h= 512 

	canvas.width  = main.screen.w;
	canvas.height = main.screen.h; 
	ctx = canvas.getContext("2d");
	main.screen.ctx = ctx ;
	main.screen.canvas = canvas ; 
	main.change = true ; 

	var imageObj = new Image();
	imageObj.onload = function() { 
		main.screen.pattern = main.screen.ctx.createPattern(imageObj, 'repeat'); 
		main.change = true ; 

	};
	imageObj.src = '/img/waves3.png';

	var imageObj2 = new Image();
	imageObj2.onload = function() {
		main.screen.pattern2 = main.screen.ctx.createPattern(imageObj2, 'repeat'); 
		main.change = true ; 
	};
	imageObj2.src = '/img/sand.png';


	var backgroundImage = new Image();
	backgroundImage.src = '/img/background.png';

	backgroundImage.onload = function() {
		backgroundImage.width = "600px"
		main.screen.backgroundPattern = main.screen.ctx.createPattern(backgroundImage, 'repeat'); 
		main.change = true ; 
	};
	

	main.colors = {
		yellow : "hsl(67, 66%, 62%)", yellowBright : "hsl(67, 96%, 72%)"
		,	blue :   "#34CFBE"
		,	green :  "hsl(96, 51%, 58%)", greenBright :  "hsl(96, 81%, 68%)"
		,   darkGreen :  "hsl(97, 50%, 39%)", darkGreenBright :  "hsl(97, 100%, 29%)"
		,   red :  "hsl(7, 50%, 39%)", redBright :  "hsl(7, 100%, 29%)"
	}
} 

distMult = 25 ;

function soundInit( main ) {
	var audio = {}
	
	//Check that AudioContext exist
	window.AudioContext = (
		window.AudioContext 
		||	window.webkitAudioContext 
		||	null
		);
	if ( !AudioContext ) {
		throw new Error( "AudioContext is not supported" ) ;
	}
	//Audio ctx
	audio.ctx = new AudioContext() ;
	//Main volume node 
	audio.mainVolume = audio.ctx.createGain() ;
	//All sound should connect to this node 
	audio.soundConnector = audio.ctx.createGain() ;
	var compressor = audio.ctx.createDynamicsCompressor();
	audio.mainVolume.connect(compressor ) ;
	compressor.connect(  audio.ctx.destination )
	audio.soundConnector.connect( audio.mainVolume ) ; 
	//Add stuff like compressor 
	audio.bufferLoader = new BufferLoader() ;  

	//Include audio in the main object 
	main.audio = audio ; 
	main.audio.Mult = 2 ;
	main.audio.music = ["G4", "C4", "E4", "A4"]
	main.audio.nextNote = 0

	main.audio.bufferLoader = new BufferLoader( main.audio.ctx
		,   [ {label : "explosion", url : "https://dl.dropboxusercontent.com/s/ts1nvjdbmgvwjal/MineExplosion.wav?dl=0"}
		   	,  {label : "cell", url : "https://dl.dropboxusercontent.com/s/eq0ulf6q6t5rwd2/enterCell.wav?dl=0"} ]
		, function (buffers ){

			main.audio.buffer =buffers 

		})
	main.audio.bufferLoader.load() ;
}

function playNote( main, x, y ) {
	//this.panner.setPosition( this.x * distMult , this.y * distMult  ,  -0.5 ) ;

	var panner = main.audio.ctx.createPanner();
	panner.setPosition( main.audio.Mult  * x  ,  main.audio.Mult  *  y , 0    ) ;
	panner.connect( main.audio.soundConnector  )

	createOscillator( main.audio.ctx
		, getNoteByName(main.audio.music[main.audio.nextNote])
		, main.audio.ctx.currentTime
		, 5000
		, panner ) 

	main.audio.nextNote = (main.audio.nextNote + 1) % main.audio.music.length ;

}
function playSound( main, bufferName ) {

  var source = main.audio.ctx.createBufferSource();
  var compressor = main.audio.ctx.createDynamicsCompressor();
  var gain = main.audio.ctx.createGain();
  gain.gain.value = 0.5;
  source.buffer = main.audio.buffer[bufferName];
  source.connect(gain);
  gain.connect(compressor);
  compressor.connect(main.audio.soundConnector );
  
  source.start( ) ;
}
function rd( max ) {
	return Math.floor( ( Math.random() * max ))  ; 
}





directions = []
directions2 = [] 
for( var i = 0 ; i < 6 ; i++ ) {
	directions[i] = { x : 2 * Math.cos( Math.PI / 3 * i )
		, y : 2 * Math.sin( Math.PI / 3 * i )
	};	
	directions2[i]  = { x :  1.17 * Math.cos( Math.PI / 6 + Math.PI / 3 * i )
		, y :    1.17 *  Math.sin( Math.PI / 6 + Math.PI / 3 * i )
	};
}
//
function hashFunc( x, y ) {
	hash = Math.round( x * 1000) + "." + Math.round( y * 1000) 
	return hash ; 
}



function createSpots( main ) {
	main.spots = [] ; 
	main.spotsHash = {} ; 

	main.spots.push( new Spot( 0,0, 200 ))
	main.spotsHash[ hashFunc( 0,0 ) ] = main.spots[ 0 ] ;
	main.spots[0].mine = false ; 
	miss = 0 
	while( main.spots.length < 300 ) {
		//select a random cell that has not 6 neighbours

		var i = rd( main.spots.length ) ; 
		var cell =  main.spots[ i ]; 


		while( cell.neighbourgsCount > 3 ) {
			i = rd( main.spots.length ) ; 
			cell = main.spots[ i ]
		}		
		//choose a direction 
		var d = rd( 6 ) 
		
		while( cell.neighbourgs[ d ] != undefined ) d = rd( 6 ) 

			var direction = directions[ d ] ;	
		var hash = hashFunc( cell.x + direction.x * l, cell.y + direction.y * l ) ;
		if( main.spotsHash[ hash ] !== undefined ) {
			console.error( "should not happen " ) ;
			cell.neighbourgs.push( main.spotsHash[ hash ] ) ;
			miss ++ 
			if( miss > 10 ) return 
				continue 
			continue ; 
		} else {	
			var x = cell.x + direction.x * l 
			,   y = cell.y + direction.y * l 



			if( x * x + y*y > 0.8  ) {
				miss ++ 
				if( miss > 10 ) return 
					continue 
			} 
			miss = 0
			var cell2 = new Spot( x, y , 240 ) ;
			//add new cell to the cell list
			main.spots.push( cell2 ) - 1 ;



			main.spotsHash[ hash ] = cell2 ; 

			//connect to each neighbourgs 
			for( var i = 0 ; i < 6 ; i++ ) {
				var n = { x : cell2.x + directions[i].x * l 
					, y : cell2.y + directions[i].y * l  }
					,  nh = hashFunc( n.x, n.y ) ;

					if( neighbourg = main.spotsHash[ nh ] ) {
						neighbourg.neighbourgs[  ( 6 + i - 3 ) % 6 ] = cell2  ;
						neighbourg.neighbourgsCount++ ;
						cell2.neighbourgs[ i ] = neighbourg ;
						cell2.neighbourgsCount ++ ;
					}

				}
			}
		}
	}



	function colorSpots( main ) {
		for( var i = 0 ; i < main.spots.length ; i++ ) {
			for( j = 0 ; j < 6 ; j++ ) if( main.spots[i].neighbourgs[j] && main.spots[i].neighbourgs[j].mine ) main.spots[i].countMine ++ 
		}

	for( var i = 0 ; i < main.spots.length ; i++ ) {
		if( main.spots[i].neighbourgsCount > 5 ) {
			main.spots[i].color = "green" ;
		}
	}

	for( var i = 0 ; i < main.spots.length ; i++ ) {
		if( main.spots[i].neighbourgsCount > 5 ) {
			var j = 0 
			for( j = 0 ; j < 6 ; j++ ) 
				if( main.spots[i].neighbourgs[j].color == "yellow" ) break ; 
			if( j == 6 ) main.spots[i].color ="darkGreen"
		}
}
} 

function Spot( x, y, freq ) {
	this.x = x ;
	this.y = y ; 
	this.freq = freq ; 
	this.panner = main.audio.ctx.createPanner();
	this.neighbourgs = [] ; 
	this.neighbourgsCount = 0 
	this.color = "yellow"
	this.mine = Math.random() > 0.7
	this.countMine = 0 ; 
	this.visible = false ;
}
Spot.prototype.play = function( main ) {

	this.panner.setPosition( this.x * distMult , this.y * distMult  ,  -0.5 ) ;
	this.panner.connect( main.audio.soundConnector  )
	var panner = this.panner ; 
	setInterval( function() { createOscillator( main.audio.ctx, 220, main.audio.ctx.currentTime, 200, panner ) }, Math.random() * 200 + 100 ) ;
}

function reveal( main, spot ) {
	if( spot.visible ) return 
		spot.visible = true ; 
	spot.color += "Bright"
	if( spot.mine ) {
		spot.color = "red" ;
	}

	if( spot.countMine == 0 || spot.countMine == spot.neighbourgsCount) {
		for( var i = 0 ; i < spot.neighbourgs.length ; i++ ) {
			if( spot.neighbourgs[i] ) reveal( main, spot.neighbourgs[i] ) ;
		}
	}

}

function updateScreen( main ) {
	
	main.change=false ; 
	ctx = main.screen.ctx ; 
	


	
	ctx.beginPath();
	ctx.rect(0, 0, main.screen.w, main.screen.h);
	ctx.fillStyle = "#009e8e";
	ctx.fill();

	ctx.globalCompositeOperation = "multiply"
	ctx.beginPath();
	ctx.globalAlpha = 0.2;
	ctx.rect(0, 0, main.screen.w, main.screen.h);
	ctx.fillStyle = main.screen.backgroundPattern ;
	ctx.fill();
	ctx.globalCompositeOperation = "source-over"

	ctx.globalAlpha = 0.5;
	for( var i = 0 ; i < main.spots.length ; i++ ) {
		ctx.fillStyle = "#30C0B0"; //"rgb("+c+","+c+",120)"
		
		ctx.beginPath();	
		ctx.moveTo( (1 + main.spots[i].x + directions2[5].x * l * 1.3 )/2 * main.screen.w  
			, (1 + main.spots[i].y + directions2[5].y * l * 1.3) /2 * main.screen.h)
		for( var j = 0 ; j < 6 ; j++ ) {

			ctx.lineTo( (1 + main.spots[i].x + directions2[j].x* l * 1.3)/2 * main.screen.w  
				, (1 + main.spots[i].y  + directions2[j].y * l* 1.3)/2 * main.screen.h)

		}
		ctx.closePath();
		ctx.fill();
	}	
	for( var i = 0 ; i < main.spots.length ; i++ ) {
		ctx.fillStyle = "#62DFC3"; //"rgb("+c+","+c+",120)"
		ctx.beginPath();	
		ctx.moveTo( (1 + main.spots[i].x + directions2[5].x * l * 1.2 )/2 * main.screen.w  
			, (1 + main.spots[i].y + directions2[5].y * l * 1.2) /2 * main.screen.h)
		for( var j = 0 ; j < 6 ; j++ ) {

			ctx.lineTo( (1 + main.spots[i].x + directions2[j].x* l * 1.2)/2 * main.screen.w  
				, (1 + main.spots[i].y  + directions2[j].y * l* 1.2)/2 * main.screen.h)

		}
		ctx.closePath();
		ctx.fill();
	}

	ctx.globalCompositeOperation = "darken"
	ctx.globalAlpha = 0.9;
	for( var i = 0 ; i < main.spots.length ; i++ ) {
		ctx.fillStyle = "#30C0B0"; //"rgb("+c+","+c+",120)"
		ctx.fillStyle = main.screen.pattern
		ctx.beginPath();	
		ctx.moveTo( (1 + main.spots[i].x + directions2[5].x * l * 2 )/2 * main.screen.w  
			, (1 + main.spots[i].y + directions2[5].y * l * 2) /2 * main.screen.h)
		for( var j = 0 ; j < 6 ; j++ ) {

			ctx.lineTo( (1 + main.spots[i].x + directions2[j].x* l * 2)/2 * main.screen.w  
				, (1 + main.spots[i].y  + directions2[j].y * l* 2)/2 * main.screen.h)

		}
		ctx.closePath();
		ctx.fill();
	}
	ctx.globalCompositeOperation = "source-over"


	ctx.globalAlpha = 1;
	for( var i = 0 ; i < main.spots.length ; i++ ) {
		//main.spots[i].play( main ) ;
		
		

		//Hexagone
		ctx.fillStyle = main.colors[ main.spots[i].color ]; //"rgb("+c+","+c+",120)"
		//ctx.fillStyle = main.screen.pattern
		ctx.beginPath();	
		ctx.moveTo( (1 + main.spots[i].x + directions2[5].x * l )/2 * main.screen.w  
			, (1 + main.spots[i].y + directions2[5].y * l) /2 * main.screen.h)
		for( var j = 0 ; j < 6 ; j++ ) {
			ctx.lineTo( (1 + main.spots[i].x + directions2[j].x* l )/2 * main.screen.w  , (1 + main.spots[i].y  + directions2[j].y * l)/2 * main.screen.h)
		}
		ctx.closePath();
		ctx.fill();


	//Mine
		ctx.fillStyle = "red" ; //"rgb("+c+","+c+",120)"
		ctx.beginPath();
		if( main.spots[i].visible && main.spots[i].mine )
			ctx.arc( (1 + main.spots[i].x )/2 * main.screen.w , (1 + main.spots[i].y )/2 * main.screen.h, 2, 0, Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();

		ctx.font = '8pt Arial';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		ctx.fillStyle = 'blue';



		if(  main.spots[i].visible && main.spots[i].countMine )
			ctx.fillText(main.spots[i].countMine, (1 + main.spots[i].x )/2 * main.screen.w , (1 + main.spots[i].y )/2 * main.screen.h);



	}
	ctx.globalCompositeOperation = "multiply"
	ctx.globalAlpha = 0.8;

	for( var i = 0 ; i < main.spots.length ; i++ ) {
		ctx.fillStyle = main.screen.pattern2
		ctx.beginPath();	
		ctx.moveTo( (1 + main.spots[i].x + directions2[5].x * l )/2 * main.screen.w  
			, (1 + main.spots[i].y + directions2[5].y * l) /2 * main.screen.h)
		for( var j = 0 ; j < 6 ; j++ ) {
			ctx.lineTo( (1 + main.spots[i].x + directions2[j].x* l )/2 * main.screen.w  , (1 + main.spots[i].y  + directions2[j].y * l)/2 * main.screen.h)
		}
		ctx.closePath();
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'hsla(0,0%,0%,0.1)';
		ctx.stroke() ;
	}
	ctx.globalCompositeOperation = "source-over"


	//draw the line
	
	if( main.ui.currentLine.length > 0 ) {
		ctx.beginPath()
		ctx.moveTo( (1 + main.ui.currentLine[0].x ) / 2 * main.screen.w,(1 + main.ui.currentLine[0].y ) / 2 * main.screen.h )
		for( var i = 1 ; i < main.ui.currentLine.length ; i++ ){
			ctx.lineTo( (1 + main.ui.currentLine[i].x ) / 2 * main.screen.w,(1 + main.ui.currentLine[i].y ) / 2 * main.screen.h )

		}
		ctx.lineTo( (1 + main.ui.mousePosition.x ) / 2 * main.screen.w,(1 + main.ui.mousePosition.y ) / 2 * main.screen.h )
		ctx.lineWidth = 5;
		ctx.strokeStyle = 'hsla(0,0%,0%,1)';
		ctx.stroke() ;
	}

	for( var j = 0 ; j< main.ui.previousLine.length ; j++ ){
		line = main.ui.previousLine[j]
			if( line.length > 0 ) {
		ctx.beginPath()
		ctx.moveTo( (1 + line[0].x ) / 2 * main.screen.w,(1 + line[0].y ) / 2 * main.screen.h )
		for( var i = 1 ; i < line.length ; i++ ){
			ctx.lineTo( (1 + line[i].x ) / 2 * main.screen.w,(1 + line[i].y ) / 2 * main.screen.h )

		}
		ctx.strokeStyle = 'hsla(0,0%,0%,0.5)';
		ctx.lineWidth = 5;
		ctx.stroke() ;
	}
	}


} 


NoteName = {"C8":0,"B7":1,"Ad7":2,"A7":3,"Gd7":4,"G7":5,"Fd7":6,"F7":7,"E7":8,"Dd7":9,"D7":10,"Cd7":11,"C7":12,"B6":13,"Ad6":14,"A6":15,"Gd6":16,"G6":17,"Fd6":18,"F6":19,"E6":20,"Dd6":21,"D6":22,"Cd6":23,"C6":24,"B5":25,"Ad5":26,"A5":27,"Gd5":28,"G5":29,"Fd5":30,"F5":31,"E5":32,"Dd5":33,"D5":34,"Cd5":35,"C5":36,"B4":37,"Ad4":38,"A4":39,"Gd4":40,"G4":41,"Fd4":42,"F4":43,"E4":44,"Dd4":45,"D4":46,"Cd4":47,"C4":48,"B3":49,"Ad3":50,"A3":51,"Gd3":52,"G3":53,"Fd3":54,"F3":55,"E3":56,"Dd3":57,"D3":58,"Cd3":59,"C3":60,"B2":61,"Ad2":62,"A2":63,"Gd2":64,"G2":65,"Fd2":66,"F2":67,"E2":68,"Dd2":69,"D2":70,"Cd2":71,"C2":72,"B1":73,"Ad1":74,"A1":75,"Gd1":76,"G1":77,"Fd1":78,"F1":79,"E1":80,"Dd1":81,"D1":82,"Cd1":83,"C1":84,"B0":85,"Ad0":86,"A0":87,"Bb7":2,"Ab7":4,"Gb7":6,"Eb7":9,"Db7":11,"Bb6":14,"Ab6":16,"Gb6":18,"Eb6":21,"Db6":23,"Bb5":26,"Ab5":28,"Gb5":30,"Eb5":33,"Db5":35,"Bb4":38,"Ab4":40,"Gb4":42,"Eb4":45,"Db4":47,"Bb3":50,"Ab3":52,"Gb3":54,"Eb3":57,"Db3":59,"Bb2":62,"Ab2":64,"Gb2":66,"Eb2":69,"Db2":71,"Bb1":74,"Ab1":76,"Gb1":78,"Eb1":81,"Db1":83,"Bb0":86}
NotesFrequency = [4186.01, 3951.07, 3729.31, 3520, 3322.44, 3135.96, 2959.96, 2793.83, 2637.02, 2489.02, 2349.32, 2217.46, 2093, 1975.53, 1864.66, 1760, 1661.22, 1567.98, 1479.98, 1396.91, 1318.51, 1244.51, 1174.66, 1108.73, 1046.5, 987.767, 932.328, 880, 830.609, 783.991, 739.989, 698.456, 659.255, 622.254, 587.33, 554.365, 523.251, 493.883, 466.164, 440, 415.305, 391.995, 369.994, 349.228, 329.628, 311.127, 293.665, 277.183, 261.626, 246.942, 233.082, 220, 207.652, 195.998, 184.997, 174.614, 164.814, 155.563, 146.832, 138.591, 130.813, 123.471, 116.541, 110, 103.826, 97.9989, 92.4986, 87.3071, 82.4069, 77.7817, 73.4162, 69.2957, 65.4064, 61.7354, 58.2705, 55, 51.9131, 48.9994, 46.2493, 43.6535, 41.2034, 38.8909, 36.7081, 34.6478, 32.7032, 30.8677, 29.1352, 27.5]; 
function getNoteByName( name ) { return NotesFrequency[ NoteName[ name ]]}


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
		|| window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = Date.now() || new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		}());




$(function() {
	GameStart() ;
$('#myModal').on('hidden.bs.modal', function (e) {
 startAGame( main ) ; 
})
})