(function(w,$){
	

    function encInt(integer, nbBytes) {
        var r = "" 
        for( var i = 0 ; i < nbBytes ; i++ ) {
            r = r + String.fromCharCode( integer & 0xFF ) 
            integer = integer >> 8 
        }
        return r 
    }

    function wav(rate, channels, bits, data) {
    // Thanks to https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
        binData = "RIFF";                               // Start of RIFF header
        binData += encInt(36 + data.length, 4);         // Rest of file size
        binData += "WAVE";                              // Format
        binData += "fmt ";                              // Subchunk 1 id
        binData += encInt(16, 4);                       // Subchunk size
        binData += encInt(1, 2);                        // Linear quantization
        binData += encInt(channels, 2);                 // Channels
        binData += encInt(rate, 4);                     // Sample rate
        binData += encInt(rate * channels * bits/8, 4); // Byte rate
        binData += encInt(channels * bits/8, 2);        // Block align
        binData += encInt(bits, 2);                     // Bits per sample
        binData += "data";                              // Subchunk 2 id
        binData += encInt(data.length, 4);              // Subchunk size
        binData += data;                                // Audio data
        return "data:audio/x-wav;base64," + btoa(binData);
    }
function wavEncode(bits, samples) {
    // Convert an array of 2-dimensional floating point sample arrays into
    // binary wave sample data.
    var data = [],
        maxValue = Math.pow(2, bits-1) - 1;
    // For each sample:
    for (var i = 0, sample; sample = samples[i]; i++) {
        // For each sample channel:#t=49s
        for (var j = 0; j < sample.length; j++) {
            // Scale value within our sample range.
            value = sample[j] * maxValue;
            // Quantize value.
            value = Math.round(value);
            // Append binary sample value.
            data.push(encInt(value, bits/8));
        }
    }
    return data.join('');
}
function SineGenerator(rate, freq) {
    var self = {'alive': true},
        period = rate / freq,
        t = 0;

    self.read = function() {
        var phase = t / period;
        var result = Math.sin(phase * 2 * Math.PI);
        t++;
        return [result, result];
    }
    return self;
}

var rate = 8000, channels = 2, bits = 16;
function play(samples) {
    var audio = new Audio(wav(rate, channels, bits, wavEncode(bits, samples)));
    audio.play();
}
function synthesize(gen, duration, samples) {
    samples = samples || [];
    for (var i = 0; i < duration; i++) {
        samples.push(gen.read());
    }
    return samples;
}

var A440 = SineGenerator(rate, 440),
    A880 = SineGenerator(rate, 880);
var notes = {
    a2: 110,        a3: 220,        a4: 440.00, a5: 880.00, a6: 880*2,
    b2: 123.47,     b3: 246.94,     b4: 493.88, b5: 987.77, b6: 987.77*2, 
    c2: 130.8/2,    c3: 130.815,    c4: 261.63, c5: 523.25, c6: 1046.50,
    d2: 293.66/4,   d3: 293.66/2,   d4: 293.66, d5: 587.33,
    e2: 329.63/4,   e3: 329.63/2,   e4: 329.63, e5: 659.26,
    f2: 349.23/4,   f3: 349.23/2,   f4: 349.23, f5: 698.46,
    g2: 392/4,      g3: 392.00/2,   g4: 392.00, g5: 783.99   
}

NotePosition = {"C8":0,"B7":1,"Ad7":2,"A7":3,"Gd7":4,"G7":5,"Fd7":6,"F7":7,"E7":8,"Dd7":9,"D7":10,"Cd7":11,"C7":12,"B6":13,"Ad6":14,"A6":15,"Gd6":16,"G6":17,"Fd6":18,"F6":19,"E6":20,"Dd6":21,"D6":22,"Cd6":23,"C6":24,"B5":25,"Ad5":26,"A5":27,"Gd5":28,"G5":29,"Fd5":30,"F5":31,"E5":32,"Dd5":33,"D5":34,"Cd5":35,"C5":36,"B4":37,"Ad4":38,"A4":39,"Gd4":40,"G4":41,"Fd4":42,"F4":43,"E4":44,"Dd4":45,"D4":46,"Cd4":47,"C4":48,"B3":49,"Ad3":50,"A3":51,"Gd3":52,"G3":53,"Fd3":54,"F3":55,"E3":56,"Dd3":57,"D3":58,"Cd3":59,"C3":60,"B2":61,"Ad2":62,"A2":63,"Gd2":64,"G2":65,"Fd2":66,"F2":67,"E2":68,"Dd2":69,"D2":70,"Cd2":71,"C2":72,"B1":73,"Ad1":74,"A1":75,"Gd1":76,"G1":77,"Fd1":78,"F1":79,"E1":80,"Dd1":81,"D1":82,"Cd1":83,"C1":84,"B0":85,"Ad0":86,"A0":87,"Bb7":2,"Ab7":4,"Gb7":6,"Eb7":9,"Db7":11,"Bb6":14,"Ab6":16,"Gb6":18,"Eb6":21,"Db6":23,"Bb5":26,"Ab5":28,"Gb5":30,"Eb5":33,"Db5":35,"Bb4":38,"Ab4":40,"Gb4":42,"Eb4":45,"Db4":47,"Bb3":50,"Ab3":52,"Gb3":54,"Eb3":57,"Db3":59,"Bb2":62,"Ab2":64,"Gb2":66,"Eb2":69,"Db2":71,"Bb1":74,"Ab1":76,"Gb1":78,"Eb1":81,"Db1":83,"Bb0":86}
PositionNote = ["C8", "B7", "Bb7", "A7", "Ab7", "G7", "Gb7", "F7", "E7", "Eb7", "D7", "Db7", "C7", "B6", "Bb6", "A6", "Ab6", "G6", "Gb6", "F6", "E6", "Eb6", "D6", "Db6", "C6", "B5", "Bb5", "A5", "Ab5", "G5", "Gb5", "F5", "E5", "Eb5", "D5", "Db5", "C5", "B4", "Bb4", "A4", "Ab4", "G4", "Gb4", "F4", "E4", "Eb4", "D4", "Db4", "C4", "B3", "Bb3", "A3", "Ab3", "G3", "Gb3", "F3", "E3", "Eb3", "D3", "Db3", "C3", "B2", "Bb2", "A2", "Ab2", "G2", "Gb2", "F2", "E2", "Eb2", "D2", "Db2", "C2", "B1", "Bb1", "A1", "Ab1", "G1", "Gb1", "F1", "E1", "Eb1", "D1", "Db1", "C1", "B0", "Bb0", "A0"]
NotesArray = [4186.01, 3951.07, 3729.31, 3520, 3322.44, 3135.96, 2959.96, 2793.83, 2637.02, 2489.02, 2349.32, 2217.46, 2093, 1975.53, 1864.66, 1760, 1661.22, 1567.98, 1479.98, 1396.91, 1318.51, 1244.51, 1174.66, 1108.73, 1046.5, 987.767, 932.328, 880, 830.609, 783.991, 739.989, 698.456, 659.255, 622.254, 587.33, 554.365, 523.251, 493.883, 466.164, 440, 415.305, 391.995, 369.994, 349.228, 329.628, 311.127, 293.665, 277.183, 261.626, 246.942, 233.082, 220, 207.652, 195.998, 184.997, 174.614, 164.814, 155.563, 146.832, 138.591, 130.813, 123.471, 116.541, 110, 103.826, 97.9989, 92.4986, 87.3071, 82.4069, 77.7817, 73.4162, 69.2957, 65.4064, 61.7354, 58.2705, 55, 51.9131, 48.9994, 46.2493, 43.6535, 41.2034, 38.8909, 36.7081, 34.6478, 32.7032, 30.8677, 29.1352, 27.5]; 
chords = {
        X           : [0, 4, 7, 12 ]
    ,   Xm          : [0, 3, 7, 12 ]
    ,   Xaug        : [0, 4, 8, 12 ]
    ,   Xdim        : [0, 3, 6, 12 ]
    ,   Xdim7       : [0, 3, 6, 9, 12]
    ,   X6          : [0, 4, 7, 9, 12]
    ,   Xmin6       : [0, 3, 7, 9, 12]
    ,   Xm6       : [0, 3, 7, 9, 12]
    ,   X7          : [0, 4, 7, 10, 12]
    ,   Xmaj7       : [0, 4, 7, 11, 12]
    ,   Xminmaj7    : [0, 3, 7, 11, 12]
    ,   Xmin7       : [0, 3, 7, 10, 12]
    ,   Xm7       : [0, 3, 7, 10, 12]
    ,   Xaugmaj7    : [0, 4, 8, 11, 12]
    ,   Xaug7       : [0, 4, 8, 10, 12]
    ,   Xmin7dim5   : [0, 3, 6, 10, 12]
    ,   Xdim7       : [0, 3, 6, 9, 12]
    ,   X7dim5      : [0, 4, 6, 10, 12]
    ,   Xmaj9       : [0, 4, 7, 11, 14]
    ,   X9          : [0, 4, 7, 11, 14]
    ,   Xminmaj9    : [0, 3, 7, 11, 14]
    ,   Xmin9       : [0, 3, 7, 10, 14]
    ,   Xm9       : [0, 3, 7, 10, 14]
    ,   Xaugmaj9    : [0, 4, 8, 11, 14]
    ,   Xaug9       : [0, 4, 8, 10, 14]
    ,   Xdim9       : [0, 3, 6, 9, 14]
    ,   X9dim5      : [0, 4, 6, 10, 14]
}

function shortNotationToBaseAndShape( shortNotation, octave ) {
    octave = octave || 4 
    base = shortNotation.slice(0,1) + octave
    shape = "X" + shortNotation.slice(1)
    return [base, shape]
}

function shortToArray( shortNotation, octave ) {
    tab = shortNotationToBaseAndShape( shortNotation, octave )
    
    return accordsToArray( tab[0], tab[1] ) ;
}
function accordsToArray( base, shape ) {
    var result = [] 
    ,   position = NotePosition[ base ] 
    ,   accord = chords[ shape ] ;
    for( var i = 0 ; i < accord.length ; i++ ) {
        result.push( PositionNote[ position - accord[ i ] ].toLowerCase() ) ; 
    }
    return result ; 
}



function createArrayOfArrays( length, value ) {
    var ret = [] ; 
    if ( ! (value instanceof Array ) ) value = [ value ] ; 
    for( var i = 0 ; i < length ; i++ )  
        ret.push( value.slice(0) ) ;
    return ret ; 
}

function init( length, nbOne ) {
    var ret = new Array( 2 ) ; 
    ret[0] = createArrayOfArrays( nbOne, 1 ) ; 
    ret[1] = createArrayOfArrays( length - nbOne, 0 ) ; 
    return ret ; 
}

//Merge 2 arrays of value, array2.length < array1,
function merge( array ) {

    if( array[0].length < array[1].length ) 
        return merge( [array[1], array[0]] ) ;
    if( array[1].length == 0 ) 
        return JSON.parse( "[" + array[0].join( "," ) + "]" )  ; 
 
    var ret = new Array(2) ;    
      ret[0] = createArrayOfArrays( array[1].length, array[0][0].concat( array[1][0] ) ) 
    , ret[1] = array[0].slice( array[1].length )  ;
    
    return merge( ret ) ;
}


function createPermutations( array ) {
    result = [] ;
    for( var i = 0 ; i < array.length ; i++ ) {
        if( array[i] ) {
            result.push([]) ;
            for( var j = 0 ; j < array.length ; j++ ) {
                result[result.length - 1 ][ j ] = (array[  (i + j) % array.length ]) ? "x" :  "." ; 
            }
            result[result.length - 1 ][0] = "X"
        }
    }
    return result ; 
}




var rd = function( mx ) { return Math.floor( Math.random() * mx ) }
function createBarRythm(bar) {
    var a = {} //new Array( bar.length ) ;
    for( var i = 0 ; i < bar.length ; i ++ ) {
        a[ bar[ i ] ] = new Array( bar[i] ) ; 
        var j ;
        for(  j = 0 ; j < bar[i] ; j++ ) {
            var rythm = merge( init( bar[i], j + 1 ) );
            a[ bar[ i ] ][j] = createPermutations( rythm ) ;
        }
        a[ bar[ i ] ][j-1].length = 1 
    }
    return a ; 
}


function Alternate(e) {
    this.value = e ; 
}
function decoupe(decompo, e ) {

    if( typeof e === "number" ) {
        if ( decompo[e] ) 
            return decoupe(decompo, decompo[e] )
        return e
    }
    if( e instanceof Alternate ) {
         var t = [] 
         for( var i = 0 ; i < e.value.length ; i++ ) 
            t[i] = decoupe(decompo, e.value[i] )
        return new Alternate( t )
    }
    if( e instanceof Array ) {
        
        var t = [] 
        for( var i = 0 ; i < e.length ; i++ ) 
            t[i] = decoupe(decompo, e[i] )
        return t 
    } 
}

function chooseOne( partition , decalage ) {
    
    var res = [] ; 
    if( partition instanceof Alternate ) {

        r =  rd( partition.value.length )
    
        res = chooseOne(partition.value[ r ], decalage + "  ")  
    } else if( partition instanceof Array ) {
    
        res = [] ;         
        for( var i = 0 ; i < partition.length ; i++ ) 
            res = res.concat( chooseOne( partition[i] , decalage + "  "))        
    } else {
    
        res = Math.abs( partition ) 
    }
    
    return res ; 
}


function createUneCompo( decompo, partition ) {       
    var uneCompo = chooseOne(  decoupe(decompo, partition ) )
    return uneCompo ; 
}

function createRythme ( bar, uneCompo, slow ) {
    var resultat = []  
    var rythm = createBarRythm( bar )
   // rd = function(l) {  return Math.floor( l - 1 )  }
    for( var i = 0 ; i < uneCompo.length ; i++ ) {
        A = rythm[uneCompo[i]] 
        B = A[ rd( A.length * slow)] 
        B = B[ rd( B.length ) ]
  //      console.log( uneCompo[i], B.length)

        resultat = resultat.concat( B )
    }
  //  console.log( resultat.join("") )
    return resultat ;
}

function createOscillator(audio, freq, start, dt, output, attack, decay) {
        var attack = attack|| 5,
            decay = decay|| 15,
            gain = audio.createGain(),
            osc = audio.createOscillator();

        gain.connect(output || audio.destination);
        gain.gain.setValueAtTime(0, start);
        
        gain.gain.linearRampToValueAtTime(1, start + attack / 1000);


        gain.gain.setValueAtTime(1, start + dt - 3*decay/1000 );
        

        gain.gain.exponentialRampToValueAtTime(0.8, start + dt - decay/1000  );

        gain.gain.linearRampToValueAtTime(0, start + dt+0.01 );

        osc.frequency.value = freq;
        osc.type = "sine";
        osc.connect(gain);
        osc.start(start);
        osc.stop(start+dt )
        osc.onended = function() {
            
            osc.stop(0);
            osc.disconnect(gain);
            gain.disconnect(audio.destination);
        }
    }


    var SoundManager = function() {
        this.notes = [] ; 
        j = 0 ; 
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        var context = new AudioContext();
        var decompo = { 12 : new Alternate([ [ 7, 5 ], [ 5, 7 ]])
                  ,  7 : new Alternate([ [ 5, 2 ], [ 2, 5 ], -7 ])
                  ,  5 : new Alternate([ [ 3, 2 ], [ 2, 3 ], -5 ]) }
        var decompo2 = { 12 : new Alternate([ [ 4, 4, 4 ], [ 3, 3, 3 ,3 ]])
                  ,  4 : new Alternate([ [ 2, 2 ], -4 ]) }
        var bar = [2,3,4, 5, 6, 8, 7]
        var bar2 = [4,3,2]

        this.decompo = {
             75 : { 12 : new Alternate([ [ 7, 5 ], [ 5, 7 ]])
                  ,  7 : new Alternate([ [ 5, 2 ], [ 2, 5 ], -7 ])
                  ,  5 : new Alternate([ [ 3, 2 ], [ 2, 3 ], -5 ]) }
            , 4 : { 12 : new Alternate([8,4], [4,8], [ 4, 4, 4 ], -12) 
                  ,  4 : new Alternate([ [ 2, 2 ], -4, -4, -4 ]) }
            , 3 : { 12 : [ 6, 6 ] }}

        for( var i in notes )  this.notes[j++] = SineGenerator(rate, notes[i]) ; 

        this.prepare = function( note, duration ) {
            samples = synthesize( this.notes[ note ], duration )
            this.audio = new Audio(wav(rate, channels, bits, wavEncode(bits, samples)));
        }
        this.play = function( note, duration  ) {
                      
            this.audio.play();

        }
        this.stop= function () {
            if( this.audio ) this.audio.pause() ; 
            this.audio = null 
        }
        this.createComplexRythme = function( array ) {
            var part = [] ;
            for( var i = 0 ; i <array.length ; i+=2 ) 
                part = part.concat( 
                    this.createSimpleRythme(  this.decompo[array[i]], array[i+1] ) );
            return part ; 

        }
        this.createSimpleRythme = function(decompo, nbBar, slow ) {
            var part = [] ; 
            for( var i = 0 ; i <nbBar ; i++ ) part[i] = 12 
            return createRythme( bar, createUneCompo( decompo,  part ) , slow )
        }   
        this.playRythme = function( rythm , time) {            
            var time = time || context.currentTime ;
            var interval = 0.2 ; 
            var gainNode1 = context.createGain()
            , gainNode2 = context.createGain();
            gainNode1.connect(context.destination);
            gainNode2.connect(context.destination);
            gainNode1.gain.value = 0.2;
            gainNode2.gain.value = 0.6;
            for( var i = 0 ; i < rythm.length ; i++  ) {
                if( rythm[i] == "." ) continue 
                // var oscillator = context.createOscillator();
                // oscillator.type = 'sine';
                // oscillator.frequency.value = 60; // value in hertz
                // oscillator.start( time + i*interval);
                // oscillator.stop(  time + (i)*interval + 0.02);
                createOscillator( context
                                , 60
                                , time + i*interval
                                , 0.03
                                , (rythm[i].toUpperCase() != rythm[i]  ) ? gainNode1 : gainNode2 
                                , 1, 3 ) ;   

               // oscillator.connect( (rythm[i] == "x" ) ? gainNode1 : gainNode2 ) ; 
            }
        }
        
        this.createArpegio = function( decompo, nbBar, accord ) {
            var r = this.createSimpleRythme( decompo, nbBar, 1 ) ; 
            return this.createArpegioOnRythm( r, accord ) ; 
        }

        this.createArpegioOnRythm = function( r, accord ) {
        
            for( var i = 0, j = 0  ; i < r.length ; i++ ) {
                if( r[i] == "." ) continue ;
                r[i] = accord[ j ]
                j = (j+ rd(3) - 1 + accord.length )%accord.length 
            }
            r[0] = r[0][0].toUpperCase() + r[0].slice(1) ;
            
            return r ;
        }

        this.createMusic = function( decompo, array ) {
            var result = [] ;
            for( var i = 0 ; i < array.length ; i+= 2 ) {
                result = result.concat( this.createArpegio(decompo, array[i], array[i+1] )) ;
            }

            return result ;
        }

        this.compose = function( ) {
            var intro1 = [] 
            , intro2 = [] 
            , A1 = []
            , A2 = []
            , B1 = []
            , B2 = [] ; 
            decompo = this.decompo[4] ;
            mesure = [12,12]

            compo = createUneCompo( decompo,mesure ) ; 
            a1 = createRythme( bar, compo, 1 )
            a2 = createRythme( bar, compo, 0.2 )
 
            
            compo = createUneCompo( decompo, mesure ) ; 
            compo1 = createUneCompo( decompo, mesure ) ; 
            compo2 = createUneCompo( decompo, mesure ) ; 
            
            b1a = createRythme( bar, compo, 1 )
            b1b = createRythme( bar, compo1, 1 )
            b1c = createRythme( bar, compo2, 1 )
            
            b2a = createRythme( bar, compo, 0.3 )
            b2b = createRythme( bar, compo1, 0.3 )
            b2c = createRythme( bar, compo2, 0.3 )

            b3a = createRythme( bar, compo,1 )
            b3b = createRythme( bar, compo1, 1)
            b3c = createRythme( bar, compo2, 1 )

            intro1.push( a1, b1a, b1b, b1c, b3a, b3b, b3c, a1 ) ; //8
            intro2.push( a2, b2a, b2b, b2c, b2a, b2b, b2c, a2 ) ; //8
            
        

            Melodie= [].concat( intro1 )
            Basse= [].concat( intro2 )

            Accords = [].concat( [ "Dm7", "Dm9", "G7", "G9", "Cmaj7", "Cmaj7", "C6", "C6" ] )

            compo = createUneCompo( decompo, mesure ) ; 
            c1a = createRythme( bar, compo, 1)
            c1b = createRythme( bar, compo, 1 )
            c1c = createRythme( bar, compo, 1 )
            c1d = createRythme( bar, compo, 1)
            c2 = createRythme( bar, compo, 0.2 )
            compo = createUneCompo( decompo, mesure ) ; 
            d1 = createRythme( bar, compo, 1 )
            d1b = createRythme( bar, compo, 1 )
            d2 = createRythme( bar, compo, 0.2 )
            compo = createUneCompo( decompo, mesure ) ; 
            e1a = createRythme( bar, compo, 1 )
            e1b = createRythme( bar, compo, 1 )
            e2 = createRythme( bar, compo, 0.2 )


            A1.push( c1a, c1b, c1c, c1d, d1, d1, e1a, e1b  ) //8
            A2.push( c2, c2, c2, c2, d2, d2, e2, e2   ) //8


            B1.push( d1, d1, e1a
                          , d1, d1, e1b
                          , d1, d1b, e1b  ) //9
            B2.push( d2, d2, e2 , d2, d2, e2, d2, d2, e2  ) //

            Melodie = Melodie.concat( A1 ) 
            Basse = Basse.concat( A2 ) 
            Accords = Accords.concat( [ "Cmaj7", "Am7", "Dm7", "G7", "Em7", "A7", "Dm7", "G7" ] ) 
            
            Melodie = Melodie.concat( B1 ) 
            Basse = Basse.concat( B2 ) 
            Accords = Accords.concat( [ "Cmaj7" , "Cmaj7"   , "C6"
                                      , "D7"    , "Dm7"     , "Dm9"
                                      , "G7"    , "Cmaj7", "Cmaj7" ] ) 

            Melodie = Melodie.concat( A1 ) 
            Basse = Basse.concat( A2 ) 
            Accords = Accords.concat( [ "Cmaj7", "Am7", "Dm7", "G7", "Em7", "A7", "Dm7", "G7" ] ) 
            
            Melodie = Melodie.concat( intro1 ) 
            Basse = Basse.concat( intro2 ) 
            Accords = Accords.concat( [ "Dm7", "Dm7", "G7", "G7", "Cmaj7", "Cmaj7", "C6", "C6" ] )
 


            var accordsB = []  
            ,  accordsM = [] 
            ,  resultBass = []
            ,  resultMelody = []  
            ,  resultMelody2 = []  ;  
            for( var i = 0 ; i < Accords.length ; i++ ) accordsB.push( shortToArray( Accords[i], 2) )
            for( var i = 0 ; i < Accords.length ; i++ ) accordsM.push( shortToArray( Accords[i], 4) )


            for( var i = 0 ; i < Accords.length ; i ++ ) {
                rythmBass = Basse[i]
                rythmMelody = Melodie[i]
               
                resultBass = resultBass.concat( this.createArpegioOnRythm( rythmMelody, accordsB[i] ) )
                resultMelody = resultMelody.concat( this.createArpegioOnRythm( rythmMelody, accordsM[i] ) )                  
                resultMelody2 = resultMelody.concat( this.createArpegioOnRythm( rythmMelody, accordsM[i] ) )                  
            }   
            console.log( resultMelody.join("") )    
            console.log( resultBass.join("") )    

            return [resultBass,resultMelody, resultMelody2] ;
        } 




        this.createMarkovMusic = function( compo ) {
            var accordsMelody = { A : ["a4","c5","e5","a5"]
            , B : ["b4","d5","f5","b5"]        
            , C : ["c4","e4","g4","c5"]
            , D : ["d4","f5","a5","d5"]
            , E : ["e4","g5","b5","e5"]
            , F : ["f4","a4","c5","f5"]
            , G : ["g4","b4","d5","g5"]
            }
            var accordsBasse = { A : ["a3","c4","e4","a4"]
            , B : ["b3","d4","f4","b4"]        
            , C : ["c3","e3","g3","c4"]
            , D : ["d3","f4","a4","d4"]
            , E : ["e3","g4","b4","e4"]
            , F : ["f3","a3","c4","f4"]
            , G : ["g3","b3","d4","g4"]
            }
            markov = { A : {
                  A : [0.18, 0.6, 0.22]
                , D : [0.5 , 0.5, 0]
                , G : [0.15, 0.75, 0.1]
                }
            , D : {
                  A : [0   , 0.  , 1   ]
                , D : [0.25, 0.0 , 0.75]
                , G : [0.9 , 0.1 , 0.0 ]
                }
            , G : {
                  A : [0.4 , 0.4, 0.2  ]
                , D : [0.5 , 0.25, 0.25]
                , G : [1, 0, 0]
                }
            }

            prev1 = "A", prev2 = "A" ;
            var chords = ["A","D","G","E"]
            var accords = [] ;
            for( var i = 0 ; i < compo.length  ; i++ ) {
                var prob = markov[prev1][prev2] ;
                var r = Math.random() ; 
                for( var j = 0 ; j < prob.length ; j++ ) {
                    if( r < prob[j] ) {
                        prev1 = prev2 
                        prev2 = chords[ j ] 
                        //partition.push( 2 )
                        accords.push( prev2 )
                        break ; 
                    } else {
                        r -= prob[j] 
                    }
                }
            }
            console.log( accords.join("") )
            musicTab1 = [], musicTab2 = []
            for( var i = 0 ; i < accords.length  ; i++ ) {
                musicTab1.push( accordsMelody[ accords[i]] )    
                musicTab2.push( accordsBasse[ accords[i]] )
            }
           


            return this.createMusicFromCompoAndAccords( compo, musicTab2, musicTab1 )
        }

        this.createMusicFromCompoAndAccords = function( uneCompo, accordsB, accordsM ) {
 
          
            
            var resultBass = []
            ,   resultMelody = []  ;
            for( var i = 0 ; i < uneCompo.length ; i ++ ) {
                rythmBass = createRythme( bar, uneCompo[i] , 0.2 )
                rythmMelody = createRythme( bar, uneCompo[i] , 1 )
               
                resultBass = resultBass.concat( this.createArpegioOnRythm( rythmBass, accordsB[i] ) )
                resultMelody = resultMelody.concat( this.createArpegioOnRythm( rythmMelody, accordsM[i] ) )                  
            }
            return [resultBass,resultMelody] ;
        }

        this.playMusic = function( music , start) {
            var time = start || context.currentTime ;
            var interval = 0.13 ; 
            var gainNode1 = context.createGain()
            , gainNode2 = context.createGain();
            gainNode1.connect(context.destination);
            gainNode2.connect(context.destination);
            gainNode1.gain.value = 0.35;
            gainNode2.gain.value = 0.45;
            for( var i = 0 ; i < music.length ; i++  ) {
                if( music[i] == "." ) continue 
                var j = 0  ; 
                var _int = interval
                for( j = 0 ;  j < 12 && j + i < music.length && ( music[i+j] == "." || music[i+j] == music[i] ) && ( Math.random() < 0.9 ); j++ ) _int = interval * ( j + 1 ) 
              
                note = music[ i ][0].toUpperCase() + music[ i ].slice(1)          
               if(  NotesArray[ NotePosition[ note ] ] == undefined ) console.log(  note )
                createOscillator( context
                                , NotesArray[ NotePosition[ note ] ] 
                                , time + i*interval 
                                , _int 
                                , (music[i].toUpperCase() != music[i]  ) ? gainNode1 : gainNode2 ) ;   
                i += j ; 
                // var oscillator = context.createOscillator();
                // oscillator.type = 'sine';
                // oscillator.frequency.value = notes[ music[ i ] ]; // value in hertz
                // oscillator.start( time + i*interval);
                // oscillator.stop(  time + (i+1)*interval + 0.001);

                // oscillator.connect(  (music[i].toUpperCase() != music[i]  ) ? gainNode1 : gainNode2 )  ; 
            }
        }


        this.playSingleNote = function( note , start, duration) {
            var time = start +context.currentTime ;

            var gainNode2 = context.createGain();
     

           gainNode2.connect(context.destination);
     
            gainNode2.gain.value = 0.45;
               
            
            createOscillator( context
                            , NotesArray[ NotePosition[ note ] ] 
                            , time 
                            , duration 
                            , gainNode2 ) ;   
             
        }

        this.playMusics = function ( musics, rythm) {
            var time = context.currentTime + 1 ; 
            for( var i = 0 ; i < musics.length ; i++ ) {
                this.playMusic( musics[i], time ) ; 
            }
            if( rythm ) this.playRythme( rythm, time)
        }
        this.demo = function (a,b ) {
            a = a || 75
            b = b || 75
          //  // var compo = [] , rythm = []  ;
            // for( var i = 0 ; i < 48 ; i++ ) compo.push( createUneCompo( this.decompo[4], 12 ) )
            // for( var i = 0 ; i < compo.length ; i ++ )  rythm = rythm.concat(  createRythme( bar, compo[i] , 0.5 ) ) 

            
       //     this.playMusics ( this.createMarkovMusic( compo ) , rythm ) ; 
            this.playMusics( this.compose() )
        }

    }

    w.SoundManager = SoundManager ; 

    music2 = ["A4",".","c5",".","e5",".","a5","a4","c5","e5","a5","a4","c5","e5","a5","a4","c5",".","e5","a5","a4",".","c5","e5","C4",".","e4","g4","c5","c4","e4",".","g4",".","c5","c4","e4",".","g4","c5","c4","e4","g4",".","c5",".","c4",".","G4",".","b4","d5","g5","g4","b4",".","d5",".",".",".","G4",".","b4","d5","g5","d5","b4","g4","b4","d5","g5","d5","F4","a4","c5",".","f5",".","f4",".","a4",".","c5","f5","f4","a4","c5",".","f5","f4","a4","c5","f5",".","f4","a4","A4",".",".",".","c5",".","e5","a5","a4",".","c5","e5","a5",".","a4","c5","e5","a5","a4","c5","e5","a5","a4",".","C4","e4","g4",".","c5","c4","e4","g4","c5",".","c4",".","e4","g4",".","c5","c4","e4","g4",".","c5",".","c4","e4","G4",".","b4","d5","g5","g4","b4","d5","g5","g4","b4","d5","G4","b4","d5",".","g5","d5",".","b4","g4","b4","d5",".","F4",".","a4",".","c5",".","f5",".","f4","a4","c5","f5","f4","a4","c5",".","f5","f4","a4","c5","f5","f4","a4","c5","A4",".","c5","e5","a5","a4","c5",".","e5",".","a5","a4","c5","e5","a5",".","a4","c5",".","e5","a5",".","a4","c5","C4","e4",".","g4","c5",".","c4",".","e4","g4","c5",".","c4",".","e4",".","g4",".","c5",".","c4","e4",".","g4","G4","b4",".","d5","g5",".","g4","b4","d5","g5","g4","b4","G4","b4",".","d5","g5",".",".",".","d5",".","b4","g4","F4",".",".",".","a4","c5","f5","f4","a4","c5","f5","f4","a4",".","c5",".","f5",".","f4",".","a4",".","c5","."]
})(this,$)

