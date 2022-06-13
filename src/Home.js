import { useEffect, useRef } from "react";
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

    const light1 = new THREE.DirectionalLight( 0x00D4FF, 0.5 );
    light1.position.set( 100, 100,100 );
    scene.add( light1 )

    const light2 = new THREE.AmbientLight( 0xffffff, 0.5);
    scene.add( light2 );

    const light3 = new THREE.DirectionalLight( 0xFFA600, 0.5 );
    light3.position.set( -100, 100,-100 );
    scene.add( light3 );

    /*const light = new THREE.DirectionalLight( 0xffaabb, 0xaa0820, 0.3 );
    light.position.set( 30, 30, 30 );
    scene.add( light );*/

    // model
    const loader = new GLTFLoader();
    loader.load( 'IceHockey.glb', function ( gltf ) {

    const model = gltf.scene;
    
        scene.add( model );
    } );

    const loader1 = new GLTFLoader();
    loader1.load( 'remy_walk_idle_jump.glb', function ( gltf ) {
        gltfRef = gltf;
        model1 = gltf.scene.children[0];
        mixer = new THREE.AnimationMixer( model1 );
        model1.position.set(7,-0.5,0);
        
        animationAction = mixer.clipAction((gltf).animations[1])
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

    const onDocumentKeyDown = (event) =>{
        var keyCode = event.which;
        document.getElementById('data_display').value = "Key pressed: "+keyCode;
        animationAction.stop()
        if (keyCode == 32) {
            animationAction = mixer.clipAction((gltfRef).animations[0])
            animationAction.play();
            // down
        } else if (keyCode == 38) {
            animationAction = mixer.clipAction((gltfRef).animations[1])
            animationAction.play();
            // left
        } else if (keyCode == 39) {
            animationAction = mixer.clipAction((gltfRef).animations[2])
            animationAction.play();
            // right
        }
    };

    useEffect(()=>{
        document.addEventListener("keydown", onDocumentKeyDown, false);
        const canvas = document.getElementById("myThreeJsCanvas");
        renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth/1.5, window.innerHeigh/1.5);
        renderer.outputEncoding = THREE.sRGBEncoding;

        window.addEventListener( 'resize', onWindowResize, false );

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
            document.getElementById('data_display').value = "Distance: "+controls.getDistance();
            onWindowResize();
        };
        animate();
    }, [])

    function onResults (results){
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
            <textarea id="data_display"  readonly="true" style = {{position: 'absolute', left: "0%", top: "35%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black"}}>Data</textarea>

        </div>
    )
}

export default Home