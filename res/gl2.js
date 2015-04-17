var ggg ; 
var gg2 ; 



function webGLStart() {

   setEventListeners() ; 
loadInput() ; 
  //Load GRID 
  PhiloGL.unpack();
var fpsAnimate = 1  
  var nbParticleMax = 2000
    , nbActiveParticles    = 0
    , ratio = 0.75
    , maxX = 640
    , maxY = ratio*maxX
    , particles = new PhiloGL.O3D.Model({
        textures : "img/particles2.png"
      , vertices :  new Float32Array( 4 * 3 * nbParticleMax )
      , colors   :  new Float32Array( 4 * 4 * nbParticleMax )
      , texCoords : new Float32Array( 4 * 2 * nbParticleMax )
      , indices :   new Uint16Array( 6 * nbParticleMax )
    })
    , lastTime = ( new Date() ).getTime()  
    , dt2 = 0  
    , background = "img/background3.png"

var manager = new ParticulesManager( nbParticleMax ) 
manager.emittersList.push( new AngularEmitter( manager, 256, 200, 0, Math.PI / 4  ) ) ; 
manager.emittersList[0].updateEmitter( manager.emittersList[0] )
nbActiveParticles = 0 ;

manager.init() 

var soundManager = new SoundManager()
ggg = soundManager
soundManager.init() 
//soundManager.loadSounds("msc/guitar1.ogg")
setTimeout( function() {soundManager.playMusic(0)} , 1000 )


  PhiloGL('lesson01-canvas', {
    program: [{
      id : "normal",
      from: 'uris',
      path: 'shaders/',
      vs: 'default2.vs.glsl',
      fs: 'default2.fs.glsl'
    },
    {
      //for glow post-processing
      id: 'glow',
      from: 'uris',
      path: 'shaders/',
      vs: 'glow.vs.glsl',
      fs: 'glow.fs.glsl',
      noCache: true
    }],
    textures: {
      src: ["img/marchingSquare.png", 'img/particles2.png', background]
    },

   
    onError: function(e) {
      console.log(e);
    },
    onLoad: function(app) {
      var gl = app.gl
      ,  canvas = app.canvas
      ,  program = app.program
      ,  camera = app.camera
      ,  view = new PhiloGL.Mat4
      ,  scene = app.scene
      ,  scaleMatrix =  new PhiloGL.Mat4()
      ,  scaleLigthMatrix =  new PhiloGL.Mat4()
      ,  counter = 0 ;  

      scaleMatrix.id() ; 
      scaleMatrix.$translate( - 1, - 1, 0 )
      scaleMatrix.$scale( 2/maxX, 2/maxY, 1);
      
      scaleLigthMatrix.id() ; 
      scaleLigthMatrix.$translate( - 1, - 1, 0 )
      scaleLigthMatrix.$scale( 2/maxX, 2/maxY, 1);
      
      //SET GL view port and stuff 
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      camera.fov = 100 ;
      camera.update() ; 
      camera.view.id();


      //Create a buffer for illuminating the background 
      app.setFrameBuffers({
        'background' :  {
          width: 64,
          height: 64,
          bindToTexture: {
            parameters : [ {
              name : 'TEXTURE_MAG_FILTER',
              value : 'LINEAR'
            }, {
              name : 'TEXTURE_MIN_FILTER',
              value : 'NEAREST',
              generateMipmap : false
            } ]
          },
          bindToRenderBuffer: false
        }
        , 'light' :  {
          width: 64,
          height: 64,
          bindToTexture: {
            parameters : [ {
              name : 'TEXTURE_MAG_FILTER',
              value : 'LINEAR'
            }, {
              name : 'TEXTURE_MIN_FILTER',
              value : 'NEAREST',
              generateMipmap : false
            } ]
          },
          bindToRenderBuffer: false
      }})


      var pause = false ; 
      var pauseSimulation = function() {
        pause = true 
        soundManager.pause()
      }

      var startSimulation = function() {
        pause = false ; 
        soundManager.playMusic("music1") 
        tick() ;
      }

      function handleVisibilityChange() {
        if (document.webkitHidden) {
          pauseSimulation();
        } else {
          startSimulation();
        }
      }

      document.addEventListener("webkitvisibilitychange", handleVisibilityChange, false);


 
      function tick() {

        time = ( new Date() ).getTime()  
        dt = time - lastTime 
        dt2+=dt 
        lastTime = time ; 
        if( ! ( (counter ++) % 5) ) {
          $("#fps").text( Math.round(5000 /  (dt2 ) )) 
          dt2 = 0 
        } 


        if( $("#Run_id").prop( "checked" ) ) {
          drawScene() ;
          animate( dt ) ;
          updateUI() ;
        }
        if( !pause ) PhiloGL.Fx.requestAnimationFrame(tick);
      }
    
      function updateUI() {
        manager.emittersList[0].updateEmitter(  )     
      }
     
      function animate( dt ) {
        manager.animate( dt ) ;
        manager.collision( )
        manager.removeDeadParticules() 
        manager.emit( dt ) ; 
        
      }
 

      function drawScene() {
        threshold = $("#threshold_id").val() * 1 || 1  
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);       
        gl.blendFunc( gl.SRC_ALPHA, gl.ONE);       
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        
        if( $("#Light_id").prop( "checked" )) {
          //BACKGROUND--------------
          app.setFrameBuffer('background', true);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.viewport(0, 0, 64, 64);
          gl.blendFunc( gl.SRC_ALPHA, gl.ONE);       
          gl.enable(gl.BLEND);
          program.normal.use() ; 
          manager.render( particles , 1)
          setupElement(program.normal, scaleMatrix, particles ) ; 
          gl.drawElements(gl.TRIANGLES, particles.activeParticle * 6 , gl.UNSIGNED_SHORT, 0); 
          app.setFrameBuffer('background', false);

          app.setFrameBuffer('light', true);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.viewport(0, 0, 64, 64);
          gl.blendFunc( gl.SRC_ALPHA, gl.ONE);       
          gl.enable(gl.BLEND);
          program.normal.use() ; 
          manager.render( particles , 2)
          setupElement(program.normal, scaleMatrix, particles ) ; 
          gl.drawElements(gl.TRIANGLES, particles.activeParticle * 6 , gl.UNSIGNED_SHORT, 0); 
          app.setFrameBuffer('light', false);
          
  

             gl.viewport(0, 0, 640, 480);
          Media.Image.postProcess({
            fromTexture: [ background, 'background-texture', 'light-texture'],
            toScreen: true,
            program: 'glow',
            width: 640,
            height: 480,
            aspectRatio : 1,
         //   uniforms : {'scaleMatrix': scaleLigthMatrix}
          });


        } else {
          // Media.Image.postProcess({
          //   fromTexture: [background, background],
          //   toScreen: true,
          //   program: 'glow',
          //   width: 640,
          //   height: 480,
          //   aspectRatio : 1,
          //   uniforms : {'scaleMatrix': scaleMatrix}
          // });
        }
        if( $("#ParticleVisible_id").prop( "checked" )) {
          manager.render( particles )
          program.normal.use() ; 
          gl.viewport(0, 0, 640, 480);
          setupElement(program.normal, scaleMatrix, particles ) ;           
          gl.drawElements(gl.TRIANGLES, particles.activeParticle * 6 , gl.UNSIGNED_SHORT, 0); /**/
        }


      }


      function setupElement(program, scaleMatrix, elem) {
        //update element matrix
        elem.update();
        //set buffers with element data
        program.setBuffers({
          'position': {
            value: elem.vertices,
            size: 3
          },
          'color': {
            value: elem.colors,
            size: 4
          }, 
          'texCoord1': {
          value: elem.texCoords,
          size: 2
          },
          'indices': {
            value: elem.indices,
            bufferType: gl.ELEMENT_ARRAY_BUFFER,
            size: 1
        }});

        program.setTexture(elem.textures);
        program.setUniform('hasTexture2', false);
        //set uniforms
        program.setUniform('scaleMatrix', scaleMatrix);
        program.setUniform('uSampler', 0);

      }
      
      tick();
    }
  });
  
}