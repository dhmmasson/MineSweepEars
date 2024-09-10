(function(w){

	var attack = 100 //ms
	, decay    = 100 //ms
	, sustain  = 100

	var createOscillator = function( audioContext, freq, start, dt, output ) {
		if( dt < attack + decay + sustain ) console.warn( "sound to small" ) ;
		dt /= 1000 ; //ms -> sec

		//dt > attack + decay + sustain
		var gain = audioContext.createGain()
		,   osc = audioContext.createOscillator() ;
		
		gain.value = 0
		gain.connect( output || audioContext.destination ) ;
		osc.frequency.value = freq ;
		osc.type = "sine" ;
		osc.start(start);


		osc.connect( gain );

		return { gain : gain, osc : osc 
			, play : function ( ctx )  {
				//0 at first 
				this.gain.gain.setValueAtTime( 0, ctx.currentTime );
				//Attack
				this.gain.gain.exponentialRampToValueAtTime( 0.9, ctx.currentTime + attack / 1000 );
			}
			, stop : function ( ctx ) {
				this.gain.gain.setValueAtTime( 0.9, ctx.currentTime );
				this.gain.gain.linearRampToValueAtTime( 0.1, ctx.currentTime + decay/1000 +sustain/1000  );
				//ramp down from sustain to 0 at the end
				this.gain.gain.linearRampToValueAtTime( 0, ctx.currentTime + decay/1000 +sustain/1000  );
			}

		}
		//Audio shape

		


	}



	w.createOscillator = createOscillator ; 
})( window ) 

