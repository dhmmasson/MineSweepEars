#ifdef GL_ES
precision highp float;
#endif


#define WIDTH 1.
#define HEIGHT 1.
#define DELTA 0.02
#define STEP 0.002
#define DELTA_SQ 100.

varying vec2 vTexCoord1;
varying vec4 vColor;
varying vec4 vPosition;

uniform bool hasTexture1;
uniform sampler2D sampler1;

uniform bool hasTexture2;
uniform sampler2D sampler2;

uniform bool hasTexture3;
uniform sampler2D sampler3;
float hardlight( float a, float b ) {
  if( b < 0.5 ) return 2. * a * b ;
  return 1. - 2.*(1. - a)*(1. - b) ;
} 
float softlight( float a, float b ) {
  return ( 1. - 2. * b ) * a * a + 2. * b * a ;
} 



void main(void) {


 vec4 background = texture2D(sampler1, vec2(vTexCoord1.s, vTexCoord1.t)) ; 
 vec4 hardlightTex = texture2D(sampler2, vec2(vTexCoord1.s, vTexCoord1.t)) ; 
 vec4 softlightTex = texture2D(sampler3, vec2(vTexCoord1.s, vTexCoord1.t)) ; 

  gl_FragColor =  0.7 * background ;

 if( softlightTex.r + softlightTex.g + softlightTex.b < 0.2 ) {
    softlightTex = vec4(0.0,0.0,0.0,0.0);
  } else {
    softlightTex *= 3. ; 
    softlightTex.r = min(softlightTex.r , 1. ) ;
    softlightTex.g = min(softlightTex.g , 1. ) ;
    softlightTex.b = min(softlightTex.b , 1. ) ;
    softlightTex = vec4( softlight( background.r , softlightTex.r ), softlight( background.g , softlightTex.g ), softlight( background.b , softlightTex.b ), 1 ) ;
  }
  gl_FragColor += 0.2 * softlightTex ;

   softlightTex = texture2D(sampler3, vec2(vTexCoord1.s, vTexCoord1.t)) ; 
  if( softlightTex.r + softlightTex.g + softlightTex.b   < 0.9 ) {
    softlightTex = vec4(0.0,0.0,0.0,0.0);
  } else {
    softlightTex *= 3. ; 
    softlightTex.r = min(softlightTex.r , 1. ) ;
    softlightTex.g = min(softlightTex.g , 1. ) ;
    softlightTex.b = min(softlightTex.b , 1. ) ;
    softlightTex = vec4( softlight( background.r , softlightTex.r ), softlight( background.g , softlightTex.g ), softlight( background.b , softlightTex.b ), 1 ) ;
  }
  gl_FragColor += 0.2 * softlightTex ;

  hardlightTex = vec4( hardlight( background.r , hardlightTex.r ), hardlight( background.g , hardlightTex.g ), hardlight( background.b , hardlightTex.b ), 1 ) ;  
  gl_FragColor +=   0.7* hardlightTex ; //+   texture2D(sampler1, vec2(vTexCoord1.s, vTexCoord1.t)) ;
}