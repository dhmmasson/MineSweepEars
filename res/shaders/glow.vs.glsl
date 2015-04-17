attribute vec3 position;

attribute vec2 texCoord1;
attribute vec4 color;

uniform mat4 scaleMatrix ;
uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldInverseTransposeMatrix;

varying vec2 vTexCoord1;
varying vec4 vPosition;
varying vec4 vColor;


void main(void) {
  vPosition = worldMatrix * vec4(position, 1.0);
  vTexCoord1 = texCoord1;
  vColor = color;
  gl_Position =  projectionMatrix * vPosition;
  //gl_Position = scaleMatrix * vec4( position, 1) ;
 //  vTexCoord1 = vec2( (1. + gl_Position.x), (1. + gl_Position.y  )) / 2. ; 	
}

