import { useEffect, useRef } from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import Webcam from "react-webcam";
import {Pose} from '@mediapipe/pose';
import * as pose from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';

function CameraCharacterControl(){
    const camRef = useRef(null);
    const canvasRef = useRef(null);
    var camera = null;
    const connect = window.drawConnectors;
    const drawLandmarks = window.drawLandmarks;

    let threeCamera, scene, renderer, clock, Left_Shoulder_Joint, Right_Shoulder_Joint, Head_Joint, AngleRightArm =0, AngleLeftArm =0, head_z_Angle=0, LeftLeg, RightLeg, AngleLeftLeg=0, AngleRightLeg=0, RightHip, LeftHip, AngleRightHip=0, AngleLeftHip=0, AngleRightAlbo=0, RightHand;
    const onWindowResize =() =>{
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    threeCamera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 0.01, 10 );
    threeCamera.position.set( 2, 2, - 2 );
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    const light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    // model
    const loader = new GLTFLoader();
    loader.load( 'https://threejs.org/examples/models/gltf/Soldier.glb', function ( gltf ) {

    const model = gltf.scene;
    
    Left_Shoulder_Joint = model.getObjectByName( 'mixamorigLeftArm' );
    Right_Shoulder_Joint = model.getObjectByName( 'mixamorigRightArm' );

    Head_Joint = model.getObjectByName( 'mixamorigHead' );
    Head_Joint.rotation.z = head_z_Angle;

    LeftLeg = model.getObjectByName( 'mixamorigLeftLeg' );
    RightLeg = model.getObjectByName( 'mixamorigRightLeg' );

    RightHip = model.getObjectByName( 'mixamorigRightHip' );
    LeftHip = model.getObjectByName( 'mixamorigLeftHip' );
    RightHand = model.getObjectByName( 'mixamorigRightForeArm');

    scene.add( model );
    } );

    
    useEffect(()=>{
        const canvas = document.getElementById("myThreeJsCanvas");
        renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;

        window.addEventListener( 'resize', onWindowResize, false );

        const controls = new OrbitControls(threeCamera, renderer.domElement );
        controls.target.set( 0, 1, 0 );
        controls.update();

        const animate = () =>{
            requestAnimationFrame( animate );
            const t = clock.getElapsedTime();
            if(Left_Shoulder_Joint)
            Left_Shoulder_Joint.rotation.z = AngleLeftArm;

            if(Right_Shoulder_Joint)
            Right_Shoulder_Joint.rotation.z = AngleRightArm;

            if(Head_Joint)
            Head_Joint.rotation.z = head_z_Angle;

            if (LeftLeg)
            LeftLeg.rotation.x = AngleLeftLeg;

            if (RightLeg)
            RightLeg.rotation.x = AngleRightLeg;

            if (RightHip)
            RightHip.rotation.x = AngleRightHip;

            if (LeftHip)
            LeftHip.rotation.x = AngleLeftHip;

            if (RightHand)
            RightHand.rotation.z = AngleRightAlbo;
            controls.update();
            renderer.render( scene, threeCamera);
        };
        animate();
    }, [])

    function onResults (results){
        canvasRef.current.width = camRef.current.video.videoWidth;
        canvasRef.current.height = camRef.current.video.videoHeight;
        const canvasElement = canvasRef.current;
        
        const canvasCtx = canvasElement.getContext("2d");
        
        canvasCtx.save();
            
        // canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.globalCompositeOperation = 'source-over';
        connect(canvasCtx, results.poseLandmarks, pose.POSE_CONNECTIONS,
                       {color: '#00FF00', lineWidth: 4});
                       connect(canvasCtx, results.poseLandmarks,
                      {color: '#FF0000', lineWidth: 2});
        drawLandmarks(canvasCtx, results.poseLandmarks,
                      {color: '#FF0000', lineWidth: 2});
        canvasCtx.restore();

        const nose_Vector = {x:results.poseLandmarks[0].x - (results.poseLandmarks[11].x+ results.poseLandmarks[12].x)/2, y:results.poseLandmarks[0].y - (results.poseLandmarks[11].y+ results.poseLandmarks[12].y)/2};
        head_z_Angle = -Math.PI/2 - Math.atan2(nose_Vector.y, nose_Vector.x);

        const rightShoulderToWristVector = {x:results.poseLandmarks[16].x- results.poseLandmarks[12].x, y:results.poseLandmarks[16].y - results.poseLandmarks[12].y};
        const rightHipToShoulderVector = {x:results.poseLandmarks[12].x- results.poseLandmarks[24].x, y:results.poseLandmarks[12].y - results.poseLandmarks[24].y};
        AngleRightArm = 0.5-Math.PI/2 - Math.atan2(rightHipToShoulderVector.y- rightShoulderToWristVector.y , rightHipToShoulderVector.x- rightShoulderToWristVector.x);
        
        const rightWristToAlboVector = {x:results.poseLandmarks[16].x- results.poseLandmarks[14].x, y:results.poseLandmarks[16].y - results.poseLandmarks[14].y};
        const rightAlboToShoulderVector = {x:results.poseLandmarks[12].x- results.poseLandmarks[14].x, y:results.poseLandmarks[12].y - results.poseLandmarks[14].y};
        AngleRightAlbo = Math.PI/2 - Math.atan2(rightWristToAlboVector.y- rightAlboToShoulderVector.y , rightWristToAlboVector.x- rightAlboToShoulderVector.x);


        const leftShoulderToWristVector = {x:results.poseLandmarks[15].x- results.poseLandmarks[11].x, y:results.poseLandmarks[15].y - results.poseLandmarks[11].y};
        const leftHipToShoulderVector = {x:results.poseLandmarks[11].x- results.poseLandmarks[23].x, y:results.poseLandmarks[11].y - results.poseLandmarks[23].y};
        AngleLeftArm = 0.5+Math.PI/2 + Math.atan2(leftHipToShoulderVector.y- leftShoulderToWristVector.y , leftHipToShoulderVector.x- leftShoulderToWristVector.x);
     
        const leftLegToHipVector = {x:results.poseLandmarks[23].z- results.poseLandmarks[25].z, y:results.poseLandmarks[23].y - results.poseLandmarks[25].y};
        const leftKneeToAnkleVector = {x:results.poseLandmarks[25].z- results.poseLandmarks[27].z, y:results.poseLandmarks[25].y - results.poseLandmarks[27].y};
        AngleLeftLeg = -0.75+Math.PI/2 - Math.atan2(leftKneeToAnkleVector.y- leftLegToHipVector.y , leftKneeToAnkleVector.y- leftLegToHipVector.y);

        const rightLegToHipVector = {x:results.poseLandmarks[24].z- results.poseLandmarks[26].z, y:results.poseLandmarks[24].y - results.poseLandmarks[26].y};
        const rightKneeToAnkleVector = {x:results.poseLandmarks[26].z- results.poseLandmarks[28].z, y:results.poseLandmarks[26].y - results.poseLandmarks[28].y};
        AngleRightLeg = -0.75+Math.PI/2 - Math.atan2(rightKneeToAnkleVector.y- rightLegToHipVector.y , rightKneeToAnkleVector.y- rightLegToHipVector.y);

        const rightSoulderToHipVector = {x:results.poseLandmarks[12].z- results.poseLandmarks[24].z, y:results.poseLandmarks[12].y - results.poseLandmarks[24].y};
        const rightKneeToHipVector = {x:results.poseLandmarks[26].z- results.poseLandmarks[24].z, y:results.poseLandmarks[26].y - results.poseLandmarks[24].y};
        AngleRightHip = Math.PI/2 - Math.atan2(rightKneeToHipVector.y- rightSoulderToHipVector.y , rightKneeToHipVector.y- rightSoulderToHipVector.y);

        // console.log(AngleLeftArm, AngleRightArm, AngleLeftLeg, AngleRightLeg);

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
          camera = new cam.Camera(camRef.current.video, {
            onFrame:async()=>{
              await pose.send({image: camRef.current.video})
            },
            width: 640,
            height: 480,
          });
          camera.start();
        }
    
      })

    return(
        <div>
            <canvas id= "myThreeJsCanvas"  style = {{position: 'absolute', left: "10%", top: "10%", textAlign: 'center', width: window.screen.width/1.5, height: window.screen.height/1.5}}/>
            <canvas id= "poseCanvas" ref = {canvasRef} style = {{position: 'absolute', left: "10%", top: "10%", textAlign: 'center', width: window.screen.width/1.5, height: window.screen.height/1.5}}>
            <div style = {{visibility: 'hidden'}}>
            <Webcam 
            ref = {camRef} 
            screenshotFormat = "image/jpeg"
            style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width/5, height: window.screen.height/5}}/>
            </div>
            </canvas>
            
        </div>
    )
}

export default CameraCharacterControl