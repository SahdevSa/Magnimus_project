import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import Webcam from "react-webcam";
import {Pose} from '@mediapipe/pose';
import * as pose from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import * as tf from '@tensorflow/tfjs'
import { model } from "@tensorflow/tfjs";

function Home(){
    let poseCamera, camera, scene, renderer, clock, Left_Shoulder_Joint, Right_Shoulder_Joint; 
    var model1, mixer, animationAction, gltfRef;
    var hand_LandMark = {x1:0, y1:0, z1:0, x2:0, y2:0, z2:0}, distanceTravelled=0;
    var currentPoseData, currentTimeData;
    var timeElapese=1;
    var today = new Date();
    let time1 = Date.now();
    let decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    let acceleration = new THREE.Vector3(1, 0.25, 50.0);
    let velocity = new THREE.Vector3(7, -0.5, 10);
    let NoseAngle = 0, NoseY=4;

    const raycaster = new THREE.Raycaster();
    
    // raycaster.set();

    function AngleBetTwo3DVector(x1, y1, z1, x2, y2, z2){
        let d = x1*x2+y1*y2+z1*z2;
        let n = ((x1**2+y1**2+z1**2)**0.5)*((x2**2+y2**2+z2**2)**0.5);
        return Math.acos(d/n);
    }

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

    camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set( 7, 4, 10);
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
    // var logoLoader = new FBXLoader();
    // logoLoader.load( 'logo1.fbx', function ( fbx ) {
    //     // const model2 = gltf.scene;
    //     const model2 = fbx.scene.children[0];
    //     model2.position.set(14,0,0);
    //     model2.scale.set(2,2,2);
    //     scene.add( model2 );
    // } );
    let xxt = 0, fbx1;
    const loader4 = new FBXLoader();
    loader4.load('logo.fbx', (fbx) => {
        fbx1 = fbx;                                                                                                                       
        fbx.scale.setScalar(1);

        fbx.rotation.z = Math.PI/3;
        // fbx.rotation.x = Math.PI/3;
        fbx.position.set(12, 2, 2);
        fbx.traverse(c => {
            c.castShadow = true;
        });
        scene.add(fbx);
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

    
    // var intersects = raycaster.intersectObject(scene, true);

    // if (intersects.length > 0) {
        
    //     var object = intersects[0].object;

    //     object.material.color.set( Math.random() * 0xffffff );
    // }

    const onDocumentKeyDown = (event) =>{
        var keyCode = event.which;
        document.getElementById('data_display').value = "Key pressed: "+keyCode;
        animationAction.stop()
        animationAction.setLoop(THREE.LoopOnce);
        if (keyCode == 65) {
            animationAction = mixer.clipAction((gltfRef).animations[3])
            animationAction.play();
            // space
        }
        if (keyCode == 32) {
            animationAction = mixer.clipAction((gltfRef).animations[3])
            animationAction.play();
            // space
        } else if (keyCode == 37) {
            animationAction = mixer.clipAction((gltfRef).animations[4])
            animationAction.play();
            // left
        } else if (keyCode == 38) {
            animationAction = mixer.clipAction((gltfRef).animations[5])
            animationAction.play();
            // up
        } else if (keyCode == 39) {
            animationAction = mixer.clipAction((gltfRef).animations[6])
            animationAction.play();
            // right
        } else if (keyCode == 40) {
            let time2 = Date.now();
            animationAction = mixer.clipAction((gltfRef).animations[7])
            animationAction.play();
              
            // down : Running
        } else if (keyCode == 18) {
            animationAction = mixer.clipAction((gltfRef).animations[8])
            animationAction.play();
            // down : 
        } 
    };

    function playAudio(audio){
        
        return new Promise(res=>{
          audio.play()
          audio.onended = res
        })
      }

    const mouse = new THREE.Vector2();
    mouse.normalize()

    window.addEventListener('mousemove', (event) =>{
        mouse.x = (event.clientX/(window.innerWidth))*2 - 1;
        mouse.y = -(event.clientX/(window.innerHeight)) * 2 + 1;
        // console.log(mouse.x)

    })

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
        controls.maxDistance = 200;
        controls.minDistance = 8;
        // controls.autoRotate = true;
        controls.rotation = Math.PI/2;
        controls.target.set( 7,-0.5,0);
        controls.update();
        const animate = () =>{
            // NoseAngle
            requestAnimationFrame( animate );
            if(mixer) mixer.update(clock.getDelta());
            // camera.position.set(17*Math.sin(NoseAngle)+7, 4, 10);
            if (fbx1){
                fbx1.rotation.y += 0.02;
            }
            raycaster.setFromCamera(mouse, camera)
            // const ObjectsToCheck = [fbx1]
            // const intersects = raycaster.intersectObjects(ObjectsToCheck)
            var intersects = raycaster.intersectObject(scene, true);

            // for (const object of ObjectsToCheck){
            //     object.material.color.set.set('#ff0000')
            // }
            for (const intersect of intersects){
                // intersect.object
                console.log(intersect.object)

            }

            controls.update();
            renderer.render( scene, camera);
            onWindowResize();
        };
        animate();
    }, [])

    function onResults (results){

        if(results.poseWorldLandmarks != undefined){
            currentPoseData = results.poseWorldLandmarks;
            currentTimeData = (new Date).getTime();
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
            if(mixer){
            playAudio(punchAudio)
            animationAction.stop();
            animationAction = mixer.clipAction((gltfRef).animations[5]); // 0 : none, 1: jump, 2:kick, 3:, 4:left punch, 5:right punch
            animationAction.setLoop(THREE.LoopOnce);
            animationAction.play();
            }
            // console.log(mixer.clipAction((gltfRef).animations));
        }
        else{
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



        // const NoseVector = {x: results.poseWorldLandmarks[0].x, x: results.poseWorldLandmarks[0].y, z: results.poseWorldLandmarks[0].z}
        NoseAngle = results.poseWorldLandmarks[0].x;
        NoseY = results.poseWorldLandmarks[0].y;
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
        timeElapese = timeElapese + 1;
        // console.log(timeElapese);
    
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

      var intervalID;
      var poseSeriesData = [];
      var timeSeriesData = [];
      function acquireData(){
          if(document.getElementById("data_Acquire_Button").innerHTML ==="Start Data Collection"){
            
            poseSeriesData = [];
            timeSeriesData = [];
            document.getElementById("data_Acquire_Button").innerHTML = "Get ready in 5 seconds";
            setTimeout(()=>{
                document.getElementById('data_display').value = "Data collection started"
                document.getElementById("data_Acquire_Button").innerHTML = "Stop Data Collection";
                intervalID = setInterval(()=>{
                        if(currentPoseData){
                            poseSeriesData.push(currentPoseData);
                            timeSeriesData.push(currentTimeData);
                        }
                    }, 160)
            }, 5000)

            setTimeout(()=>{
                document.getElementById('data_display').value = "Data collection stopped"
                clearInterval(intervalID);
            }, 60000)
        }
        else{
            document.getElementById("data_Acquire_Button").innerHTML = "Start Data Collection";
            clearInterval(intervalID);
            var lineArray = [ "data:text/csv;charset=utf-8,"];
            lineArray = lineArray +"Time in ms from Jan1 1970,"
            var marker_Num = 0;
            poseSeriesData[0].forEach(function (infoLine, indx) {
            lineArray = lineArray+ indx+ "_x," + indx+ "_y," + indx+ "_z,"+ indx+"_vis,"
            })
            lineArray = lineArray.slice(0, -1) + '\n';

            poseSeriesData.forEach(function (infoArray, index) {
            lineArray = lineArray + timeSeriesData[index];
            infoArray.forEach(function (infoLine, indx) {
                lineArray = lineArray + "," +infoLine["x"] + ", "+infoLine["y"]  + ", " +infoLine["z"] + ", " +infoLine["visibility"];
            })
            lineArray = lineArray + "\n";
        });
        console.log(lineArray);
        var encodedUri = encodeURI(lineArray);
        window.open(encodedUri);
        }
      }

      function makeArray(a,b) {
        var arr = new Array(a)
        for(var i = 0;i<a;i++)
            arr[i] = new Array(b)
        return arr
    }

    function preProcess(poseSeriesData){
          var dataArr = makeArray(3,132);
          for(var i = 0;i<3;i++){
            for(var j = 0;j<33;j++){
                dataArr[i][j*4] = poseSeriesData[i][j].x;
                dataArr[i][j*4+1] = poseSeriesData[i][j].y;
                dataArr[i][j*4+2] = poseSeriesData[i][j].z;
                dataArr[i][j*4+3] = poseSeriesData[i][j].visibility;
            }
          }
          var T = tf.tensor(dataArr);
          T = T.reshape([1,3,132,1]);
          return T;
      }

      async function load_model() {
        let m = await tf.loadLayersModel('model.json')
        return m;
    }

      var poseSeriesDataforPrediction = [];
      function detectPose(){
        let model = load_model();
        poseSeriesDataforPrediction.push(currentPoseData);
        poseSeriesDataforPrediction.push(currentPoseData);
        poseSeriesDataforPrediction.push(currentPoseData);
        intervalID = setInterval(()=>{
            if(currentPoseData){
                poseSeriesDataforPrediction.shift();
                poseSeriesDataforPrediction.push(currentPoseData);
                model.then(function (res) {
                    let result = res.predict(preProcess(poseSeriesDataforPrediction)).reshape([8]);
                    result = result.argMax().arraySync();
                    if(result ==0)
                        document.getElementById('data_display').value  = "Idle";
                    else if(result ==1)
                        document.getElementById('data_display').value  = "Jump";
                    else if(result ==2)
                        document.getElementById('data_display').value  = "Squat";
                    else if(result ==3)
                        document.getElementById('data_display').value  = "Jog in Place Straight";
                    else if(result ==4)
                        document.getElementById('data_display').value  = "Jog Bending Forward";
                    else if(result ==5)
                        document.getElementById('data_display').value  = "Jog Bending Backward";
                    else if(result ==6)
                        document.getElementById('data_display').value  = "Jog Right";
                    else if(result ==7)
                        document.getElementById('data_display').value  = "Jog Left";
                }, function (err) {
                    console.log(err);
                });
            }
        }, 160)
      }

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
            {/* <Asset/> */}
            <div class="landmark-grid-container" style = {{position: 'absolute', left: "0%", top: "25%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black"}}></div>
            <textarea id="data_display"  readonly="true" style = {{position: 'absolute', left: "0%", top: "50%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black",fontWeight:"bold", fontSize: "50pt"}}>Data</textarea>
            <button id="data_Acquire_Button" onClick={acquireData} style = {{position: 'absolute', left: "5%", top: "85%", textAlign: 'center', width: window.screen.width/10, height: window.screen.height/30}}> Start Data Collection</button>
            <button id="pose_Detection_Button" onClick={detectPose} style = {{position: 'absolute', left: "18%", top: "85%", textAlign: 'center', width: window.screen.width/10, height: window.screen.height/30}}> Start Pose Detection</button>
        </div>
    )
}

export default Home