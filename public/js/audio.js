(function(w){

	var attack = 10 //ms
	, decay    = 30 //ms
	, sustain  = 50

	var createOscillator = function( audioContext, freq, start, dt, output ) {
		if( dt < attack + decay + sustain ) console.warn( "sound to small" ) ;
		dt /= 1000 ; //ms -> sec

		//dt > attack + decay + sustain
		var gain = audioContext.createGain()
		,   osc = audioContext.createOscillator() ;
		
		gain.value = 0.1 
		gain.connect( output || audioContext.destination ) ;
		osc.frequency.value = freq ;
		osc.type = "sine" ;

		osc.connect( gain );


		//Audio shape

		//0 at first 
		gain.gain.setValueAtTime( 0.1, start );

		//Attack
		gain.gain.exponentialRampToValueAtTime( 0.9, start + attack / 1000 );

		//ramp down from decay to sustain
		gain.gain.setValueAtTime( 0.9, start + dt - decay/1000 );
		gain.gain.linearRampToValueAtTime( 0.1, start + dt - sustain/1000  );

		//ramp down from sustain to 0 at the end
		gain.gain.linearRampToValueAtTime( 0, start + dt );

		osc.start(start);
		osc.stop(start+dt +100)

		//disconnect everything
		osc.onended = function() {	            
			osc.stop(100);
			osc.disconnect(gain);
			gain.disconnect(audioContext.destination);
		}


	}



	w.createOscillator = createOscillator ; 
})( window ) 

