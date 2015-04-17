
uniform mat4 scaleMatrix ;

attribute vec3 position;
attribute vec4 color;
attribute vec2 texCoord1;


varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec2 vBackgroundCoord ;

  void main(void) {
    gl_Position = scaleMatrix * vec4( position, 1) ;
    
    vColor = color ; 
    vTextureCoord = texCoord1;
  }



