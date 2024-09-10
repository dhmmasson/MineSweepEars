/*

The MIT License (MIT)

Copyright (c) 2014 Christer Bystrom
Modified : Dimitri H. Masson 2015

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

A spatial hash. For an explanation, see

http://www.gamedev.net/page/resources/_/technical/game-programming/spatial-hashing-r2697

For computational efficiency, the positions are bit-shifted n times. This means
that they are divided by a factor of power of two. This factor is the
only argument to the constructor.

*/

(function(w) {
  'use strict';
  
  var DEFAULT_POWER_OF_TWO = 3;
  var DEFAULT_GRID_SIZE = 512 >> DEFAULT_POWER_OF_TWO ; 
  var ret = {
      length : 0 
    , indices : new Uint16Array(10) 
  }
  ,   keys = [] 
  ,   i
  ,   j
  ,   l
  ,   tmp 
  ,   key
  ,   count = 0
  ,   index  ;
  function makeKeysFn(shift, gridSize) {
    return function(obj) {
      var sx = obj.x >> shift,
        sy = obj.y >> shift,
        ex = (obj.x + obj.width) >> shift,
        ey = (obj.y + obj.height) >> shift,
        i, j
        keys.length = 0 
      for(j=sy;j<=ey;j++) {
        for(i=sx;i<=ex;i++) {
          keys.push( i * this.gridSize + j);
        }
      }
      return keys;
    };
  }  
  
  /**
  * @param {number} power_of_two - how many times the rects should be shifted
  *                                when hashing
  */
  function SpatialHash(power_of_two, gridSize, maxParticules ) {
    if (!power_of_two) {
      power_of_two = DEFAULT_POWER_OF_TWO;
    }
    this.gridSize = (gridSize || 512) >> power_of_two 
    this.maxParticules = maxParticules || 100  
    this.getKeys = makeKeysFn(power_of_two, gridSize);

    this.hash = new Array( this.gridSize * this.gridSize );
 
    this._lastTotalCleared = 0;

   // console.log( this )
  }
  
  SpatialHash.prototype.clear = function() {
    for (var i = 0 ; i < this.hash.length ; i++ ) {
      if(  this.hash[i] )
      for( j = 0 ; j < this.hash[i].length ; j++ ) {
        this.hash[i][j] = -1 ;
      }
      
    }
    
  };
  
  SpatialHash.prototype.getNumBuckets = function() {
    count = 0;
    for (key in this.hash) {
      if (this.hash.hasOwnProperty(key)) {
        if (this.hash[key].length > 0) {
          count++;
        }
      }
    }
    return count;
    
  };
  
  SpatialHash.prototype.insert = function(obj, rect) {
    keys = this.getKeys(rect || obj) ; 
    //console.log( keys )
    for (i=0;i<keys.length;i++) {
      key = keys[i];
      if (this.hash[key]) {

        //Cherche une case vide 
        for( j = 0 ; j < this.hash[key].length ; j++ ) {
          //contient un index, on passe à la case suivante
          if( this.hash[key][j] >= 0 ) continue ; 
          //sinon on ajoute et on arrete de chercher
          this.hash[key][j] = obj.value ; 
          break ; 
        } 

        //Si on a pas trouvé de case, on double la taille du tableau 
        if( j == this.hash[key].length ) {
           console.log( "Augmentation " )
          var tmp = this.hash[key]
          this.hash[key] = new Array( 2 * j) ; 
          for( j = 0, l = 0 ; j < tmp.length ; j++ ) {
              if( tmp[j] >= 0 ) this.hash[key][l ++ ] = tmp[j] 
          }
          this.hash[key][l ++ ] = obj.value ;
          for( j = l ; j < this.hash[key].length ; j++ )this.hash[key][j] = -1 ; 
        }       
      } else {
        this.hash[key] = new Array( 16 ) ; 
        this.hash[key][0] = obj.value ;
        for( j = 0 ; j < 64 ; j++ )this.hash[key][j] = -1 ; 
      }
    }
  };
  
  SpatialHash.prototype.remove = function(obj) {
    keys = this.getKeys( obj ) ; 
    count = 0 ; 
    for (i=0;i<keys.length;i++) {
      key = keys[i];
      if (this.hash[key]) {
        for( j = 0 ; j < this.hash[key] ; j++ ) {
          if( this.hash[key][j] == obj.value ) this.hash[key][j] = -1 ;  
          if( this.hash[key][j] != -1 ) count ++ 
        }
        //Si le tableau est très vide on le réduit de moitié 
        if( count < j / 4 ) {
          console.log( "reduction ")
          var tmp = this.hash[key]
          this.hash[key] = new Array( j / 2 ) ; 
          for( j = 0, l = 0  ; j < tmp.length ; j++ ) {
              if( tmp[j] >= 0 ) this.hash[key][l ++ ] = tmp[j] 
          }
          this.hash[key][l ++ ] = obj.value ;
        }
      }
    }
  };

  SpatialHash.prototype.retrieve = function(obj, rect) {
    ret.length = 0 
    keys = this.getKeys(rect || obj);
    for (i=0;i<keys.length;i++) {
      key = keys[i];
      if (! this.hash[key] ) continue ; 
      for( var l = 0 ; l <  ( this.hash[key].length); l++) {
        index = this.hash[key][l] ; 
        if( index >= 0 ) {
          for( j = 0 ; (j < ret.length) && ret.indices[ j ] != index ; j ++ ) {}
          ret.indices[ j ] = index ;
          if( j == ret.length ) ret.length ++ ;
        }
      }
    }
    return ret;
  };
  
  w.SpatialHash = SpatialHash;
})(this);