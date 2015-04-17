#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec2 vBackgroundCoord ;


uniform sampler2D uSampler;


void main(void) {

		gl_FragColor = vec4( vColor.rgb , texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)).r * vColor.a	  ) ;
}


