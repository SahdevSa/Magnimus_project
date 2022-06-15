import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import Webcam from "react-webcam";
import {Pose} from '@mediapipe/pose';
import * as pose from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';

function Home(){
    let poseCamera, camera, scene, renderer, clock, Left_Shoulder_Joint, Right_Shoulder_Joint; 
    var model1, mixer, animationAction, gltfRef;
    var hand_LandMark = {x1:0, y1:0, z1:0, x2:0, y2:0, z2:0}, distanceTravelled=0;

    const [isActive, setIsActive] = useState(false);

    var punchAudio = new Audio('punch_sound.mp3');
    const camRef = useRef(null);
    const canvasRef = useRef(null);
    const connect = window.drawConnectors;
    const drawLandmarks = window.drawLandmarks;

    const onWindowResize =() =>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth/1.5, window.innerHeight/1.5);
    }

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 5, 4, 10 );
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    const light1 = new THREE.HemisphereLight(0x4d8eb, 0xffffff, 0.5)
    scene.add( light1 )

    const light2 = new THREE.DirectionalLight( 0xFF00FF, 0.3);
    light2.position.set( 100, 100,100 );
    scene.add( light2 );

    const light3 = new THREE.DirectionalLight( 0xFFFF00, 0.3);
    light3.position.set( -100, 100,-100 );
    light3.castShadow = true;
    scene.add( light3 );

    const light4 = new THREE.PointLight( 0xFFFFFF, 1 );
    light4.position.set(8,3,3 );
    light4.castShadow = true;
    scene.add( light4 );

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper( light4, sphereSize );
    scene.add( pointLightHelper );

    // model
    const loader = new GLTFLoader();
    loader.load( 'IceHockey.glb', function ( gltf ) {
    const model = gltf.scene;
        scene.add( model );
    } );

    const loader1 = new GLTFLoader();
    loader1.load( 'RiggedCharacter.glb', function ( gltf ) {
        gltfRef = gltf;
        model1 = gltf.scene.children[0];
        mixer = new THREE.AnimationMixer( model1 );
        model1.position.set(7,-0.5,0);
        model1.scale.set(0.02,0.02,0.02);
        
        animationAction = mixer.clipAction((gltf).animations[0])
        animationAction.play();
        scene.add( model1 );
    } );

    var fontLoader1 = new FontLoader();
    fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',function(tex){ 
        var  textGeo = new TextGeometry('Magnimus', {
                size: 1,
                height: 1,
                curveSegments: 6,
                font: tex,
        });
        var  color = new THREE.Color();
        color.setRGB(255, 25, 25);
        var  textMaterial = new THREE.MeshNormalMaterial({ color: color });
        var  text = new THREE.Mesh(textGeo , textMaterial);
        text.position.set(0,4,0);
        scene.add(text);
    })
    
    var fontLoader2 = new FontLoader();
    fontLoader1.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',function(tex){ 
        var  textGeo = new TextGeometry('Immersive Games \non the Metaverse', {
                size: 0.5,
                height: 0.5,
                curveSegments: 6,
                font: tex,
        });
        var  color = new THREE.Color();
        color.setRGB(25, 255, 25);
        var  textMaterial = new THREE.MeshNormalMaterial({ color: color });
        var  text = new THREE.Mesh(textGeo , textMaterial);
        text.position.set(0,3,0);
        scene.add(text);
    })

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    const sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'background.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.05 );
        sound.play();
    });

    const onDocumentKeyDown = (event) =>{
        var keyCode = event.which;
        document.getElementById('data_display').value = "Key pressed: "+keyCode;
        animationAction.stop()
        animationAction.setLoop(THREE.LoopOnce);
        if (keyCode == 32) {
            animationAction = mixer.clipAction((gltfRef).animations[3])
            animationAction.play();
            // down
        } else if (keyCode == 38) {
            animationAction = mixer.clipAction((gltfRef).animations[4])
            animationAction.play();
            // left
        } else if (keyCode == 39) {
            animationAction = mixer.clipAction((gltfRef).animations[5])
            animationAction.play();
            // right
        }
    };

    function playAudio(audio){
        
        return new Promise(res=>{
          audio.play()
          audio.onended = res
        })
      }

    useEffect(()=>{
        document.addEventListener("keydown", onDocumentKeyDown, false);
        const canvas = document.getElementById("myThreeJsCanvas");
        renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth/1.5, window.innerHeigh/1.5);
        renderer.outputEncoding = THREE.sRGBEncoding;

        window.addEventListener( 'resize', onWindowResize, false);

        const controls = new OrbitControls(camera, renderer.domElement );
        controls.maxPolarAngle = 1.50;
        controls.maxDistance = 220;
        controls.minDistance = 10;
        controls.target.set( 7,-0.5,0);
        controls.update();

        const animate = () =>{
            requestAnimationFrame( animate );
            if(mixer) mixer.update(clock.getDelta());
            controls.update();
            renderer.render( scene, camera);
            onWindowResize();
        };
        animate();
    }, [])

    function onResults (results){
        if(results.poseLandmarks != undefined){
            //console.log(results.poseWorldLandmarks)
            if(results.poseWorldLandmarks[16].visibility<0.5){
                distanceTravelled = 0;
            }else{
                hand_LandMark.x1 = hand_LandMark.x2;
                hand_LandMark.y1 = hand_LandMark.y2;
                hand_LandMark.z1 = hand_LandMark.z2;
                hand_LandMark.x2 = results.poseWorldLandmarks[16].x;
                hand_LandMark.y2 = results.poseWorldLandmarks[16].y;
                hand_LandMark.z2 = results.poseWorldLandmarks[16].z;
                distanceTravelled = Math.pow(Math.pow((hand_LandMark.x2-hand_LandMark.x1),2)+ Math.pow((hand_LandMark.y2-hand_LandMark.y1),2) + Math.pow((hand_LandMark.z2-hand_LandMark.z1),2),0.5);
            }
        }
        if(hand_LandMark && distanceTravelled>0.1){
            document.getElementById('data_display').value = distanceTravelled+ "Punching";
            if(mixer){
            playAudio(punchAudio)
            animationAction.stop();
            animationAction = mixer.clipAction((gltfRef).animations[5])
            animationAction.setLoop(THREE.LoopOnce);
            animationAction.play();
            }
        }
        else{
            document.getElementById('data_display').value = distanceTravelled+ "Idle";
            if(mixer){
            if(!animationAction.isRunning()){
            animationAction.stop();
            animationAction = mixer.clipAction((gltfRef).animations[0])
            animationAction.play();
            }
            }
        }
        canvasRef.current.width = camRef.current.video.videoWidth;
        canvasRef.current.height = camRef.current.video.videoHeight;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");
        canvasCtx.save();
            
        //canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.globalCompositeOperation = 'source-over';
        connect(canvasCtx, results.poseLandmarks, pose.POSE_CONNECTIONS,
                       {color: '#00FF00', lineWidth: 4});
                       connect(canvasCtx, results.poseLandmarks,
                      {color: '#FF0000', lineWidth: 2});
        drawLandmarks(canvasCtx, results.poseLandmarks,
                      {color: '#FF0000', lineWidth: 2});
        canvasCtx.restore();
    }

    useEffect(()=>{
        const pose = new Pose({locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }});
    
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: true,
          smoothSegmentation: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
    
        pose.onResults(onResults);
    
        if(typeof camRef.current !==undefined && camRef.current !==null){
          poseCamera = new cam.Camera(camRef.current.video, {
            onFrame:async()=>{
              await pose.send({image: camRef.current.video})
            },
            width: window.screen.width/4,
            height: window.screen.height/4,
          });
          poseCamera.start();
        }
    
      }) 

      useEffect(() => {
        let timer = null;
        if(isActive){
          timer = setInterval(() => {
          }, 1000);
        }
        return () => {
          clearInterval(timer);
        };
      });

    return(
        <div>
            <canvas id= "myThreeJsCanvas"  style = {{position: 'absolute', left: "25%", top: "0%", textAlign: 'center', width: window.screen.width/1.5, height: window.screen.height/1.5, border: "1px solid black"}}/>
           
            <div style = {{position: 'absolute', left: "0%", top: "0%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black", visibility: 'visible'}}>
            <Webcam 
            ref = {camRef} 
            screenshotFormat = "image/jpeg"
            style =  {{position: 'absolute', left: "0%", top: "0%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black"}}/>
            </div>
            <canvas id= "poseCanvas" ref = {canvasRef} style = {{position: 'absolute', left: "0%", top: "0%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black"}}/>
            <div class="landmark-grid-container" style = {{position: 'absolute', left: "0%", top: "25%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black"}}></div>
            <textarea id="data_display"  readonly="true" style = {{position: 'absolute', left: "0%", top: "50%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black"}}>Data</textarea>
            <button onClick={()=>{setIsActive(true);}} style = {{position: 'absolute', left: "5%", top: "85%", textAlign: 'center', width: window.screen.width/10, height: window.screen.height/30}}> Start Data Collection</button>

        </div>
    )
}

export default Home