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

    let threeCamera, scene, renderer, clock;
    let Head_Joint, head_z_Angle={xAngle: 0, yAngle:Math.PI/2, xzProjectionAngle:0, confidence:0};
    let Left_Shoulder_Joint, AngleLeftArmZ =0, AngleLeftArmY=0, AngleLeftArmX=0, LeftSoulderjointAngle = {xAngle: 0, yAngle:0, xzProjectionAngle:0, confidence:0};
    let RightForeArm, AngleRightAlbo=0;
    let LeftForeArm, AngleLeftAlbo=0;
    let Right_Shoulder_Joint, AngleRightArmZ =0, AngleRightArmX=0, AngleRightArmY=0, RightSoulderjointAngle = {xAngle: 0, yAngle:0, xzProjectionAngle:0, confidence:0};
    let LeftUpLeg, AngleLeftUpLeg=Math.PI;
    let RightUpLeg, AngleRightUpLeg={xAngle: 0, yAngle:0, xzProjectionAngle:0, confidence:0}, RightUpLegjointAngle = {xAngle: 0, yAngle:0, xzProjectionAngle:0, confidence:0};
    let spine, AngleBetweenspineNLine=0, AngleBetweenspineNLine3 = {xAngle: 0, yAngle:0, xzProjectionAngle:0, confidence:0};
    let RightHip,  AngleRightHip=0;
    let LeftHip, AngleLeftHip=0;
    // temptype
    let AngleRightUpLegx = 0, AngleRightUpLegz=0;


    const onWindowResize =() =>{
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    threeCamera = new THREE.PerspectiveCamera( 38, window.innerWidth / window.innerHeight, 1, 20 );
    threeCamera.position.set( 0, 1,  -4);
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

    Head_Joint = model.getObjectByName( 'mixamorigNeck' );
    spine = model.getObjectByName('mixamorigSpine');

    LeftUpLeg = model.getObjectByName( 'mixamorigLeftUpLeg' );
    RightUpLeg = model.getObjectByName( 'mixamorigRightUpLeg' );

    RightHip = model.getObjectByName( 'mixamorigRightHip' );
    LeftHip = model.getObjectByName( 'mixamorigLeftHip' );

    RightForeArm = model.getObjectByName( 'mixamorigRightForeArm');
    LeftForeArm = model.getObjectByName( 'mixamorigLeftForeArm');
    

    scene.add( model );
    } );

    function AngleBetTwoVector(x1, y1, x2, y2){
      let d = x1*x2+y1*y2;
      let n = ((x1**2+y1**2)**0.5)*((x2**2+y2**2)**0.5);
      return Math.acos(d/n);
    }

    function AngleBetTwo3DVector(x1, y1, z1, x2, y2, z2){
        let d = x1*x2+y1*y2+z1*z2;
        let n = ((x1**2+y1**2+z1**2)**0.5)*((x2**2+y2**2+z2**2)**0.5);
        return Math.acos(d/n);
    }
    
    function getAngleBetweenVectors(startPoint, midPoint, Axis1, Axis2){
      let jointAngle = {xAngle: 0, yAngle:0, xzProjectionAngle:0, confidence:0};

      if(startPoint.visibility >0.5 && midPoint.visibility >0.5 ){
          let startvector = {x:(startPoint.x-midPoint.x), y:(startPoint.y-midPoint.y), z:(startPoint.z-midPoint.z)};
          // let endVector = {x:(midPoint.x - endPoint.x) , y: (midPoint.y - endPoint.y), z:(midPoint.z - endPoint.z)};
          // jointAngle.xAngle = Math.atan2(endVector.z,endVector.y) - Math.atan2(startvector.z,startvector.y);
          jointAngle.yAngle = AngleBetTwo3DVector(startvector.x, startvector.y, startvector.z, Axis1.x, Axis1.y, Axis1.z); 
          jointAngle.xzProjectionAngle = AngleBetTwo3DVector(startvector.x, 0, startvector.z, Axis2.x, Axis2.y, Axis2.z); 
          jointAngle.confidence = 1;
      }
      return jointAngle;
    }

    
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

            if(Left_Shoulder_Joint){
              Left_Shoulder_Joint.rotation.x = Math.PI/2-LeftSoulderjointAngle.xzProjectionAngle;
              Left_Shoulder_Joint.rotation.z = Math.PI/2-LeftSoulderjointAngle.yAngle;

            }
            if(Right_Shoulder_Joint){
              Right_Shoulder_Joint.rotation.x = -Math.PI/2+RightSoulderjointAngle.xzProjectionAngle;
              Right_Shoulder_Joint.rotation.z = Math.PI/2-RightSoulderjointAngle.yAngle;

            }
            if (RightForeArm){
              RightForeArm.rotation.z = AngleRightAlbo+ Math.PI;
            }
            if (LeftForeArm){
              LeftForeArm.rotation.z = AngleLeftAlbo + Math.PI;
            }
            if (spine){
              spine.rotation.z = AngleBetweenspineNLine;
              spine.rotation.x = AngleBetweenspineNLine3;
            }

            if (Head_Joint){
              Head_Joint.rotation.z = head_z_Angle;
            }
            // if (RightUpLeg){
            //   // 
            //   RightUpLeg.rotation.x = Math.PI-AngleRightUpLeg.xzProjectionAngle;
            //   // RightUpLeg.rotation.z = AngleRightUpLeg.yAngle;
            //   // console.log(AngleRightUpLegx, AngleRightUpLeg.yAngle);
              
            //   // RightUpLeg.rotation.x = RightUpLegjointAngle.xzProjectionAngle;
            //   // RightUpLeg.rotation.z = RightUpLegjointAngle.yAngle;
            // }


            controls.update();
            renderer.render( scene, threeCamera);
        };
        animate();
    }, [])

  function onResults (results){
    //
        canvasRef.current.width = camRef.current.video.videoWidth;
        canvasRef.current.height = camRef.current.video.videoHeight;
        const canvasElement = canvasRef.current;
        
        const canvasCtx = canvasElement.getContext("2d");
        
        canvasCtx.save();
            
        canvasCtx.globalCompositeOperation = 'source-over';
        connect(canvasCtx, results.poseLandmarks, pose.POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        connect(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
        drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
        canvasCtx.restore();

    //  Spin Vector
        const spineVector = {x:((results.poseLandmarks[11].x+ results.poseLandmarks[12].x)/2 - (results.poseLandmarks[23].x+ results.poseLandmarks[24].x)/2), y:((results.poseLandmarks[11].y + results.poseLandmarks[12].y)/2-(results.poseLandmarks[23].y+ results.poseLandmarks[24].y)/2), z:((results.poseLandmarks[11].z + results.poseLandmarks[12].z)/2-(results.poseLandmarks[23].z+ results.poseLandmarks[24].z)/2)};
        const spineVectorR = {x:(-(results.poseLandmarks[11].x+ results.poseLandmarks[12].x)/2 + (results.poseLandmarks[23].x+ results.poseLandmarks[24].x)/2), y:(-(results.poseLandmarks[11].y + results.poseLandmarks[12].y)/2+(results.poseLandmarks[23].y+ results.poseLandmarks[24].y)/2), z:(-(results.poseLandmarks[11].z + results.poseLandmarks[12].z)/2+(results.poseLandmarks[23].z+ results.poseLandmarks[24].z)/2)};
        AngleBetweenspineNLine = -(Math.PI/2 + Math.atan2(spineVector.y-0, spineVector.x-0));
        AngleBetweenspineNLine3 = -(Math.PI/2 + Math.atan2(spineVector.y-0, spineVector.z-0));

    // Nose Vector from the center of chest
        const midspine = {x:(results.poseLandmarks[11].x+ results.poseLandmarks[12].x)/2, y:(results.poseLandmarks[11].y+ results.poseLandmarks[12].y)/2, z:(results.poseLandmarks[11].z+ results.poseLandmarks[12].z)/2, visibility:1};

        const shoulderVector = {x:(results.poseLandmarks[11].x - results.poseLandmarks[12].x), y:(results.poseLandmarks[11].y- results.poseLandmarks[12].y), z:(results.poseLandmarks[11].z- results.poseLandmarks[12].z)};
        const mouthVector = {x:(results.poseLandmarks[9].x - results.poseLandmarks[10].x), y:(results.poseLandmarks[9].y- results.poseLandmarks[10].y), z:(results.poseLandmarks[9].z- results.poseLandmarks[10].z)};
        head_z_Angle = AngleBetweenspineNLine-Math.atan2(mouthVector.y, mouthVector.x) - Math.atan2(shoulderVector.y, shoulderVector.x);
        head_z_Angle = head_z_Angle>0.9?0.9:head_z_Angle;
        head_z_Angle = head_z_Angle<-0.9?-0.9:head_z_Angle;
        // console.log((Math.PI-head_z_Angle.yAngle)*180/Math.PI);
    //  Right soulder to Wrist Vector
        let rightTempAngle = getAngleBetweenVectors(results.poseLandmarks[14], results.poseLandmarks[12], {x:0, y:1, z:0}, {x:0, y:0, z:1});
        if (rightTempAngle.confidence==1){
          RightSoulderjointAngle = rightTempAngle;
        }

    //  Left Soulder to Wrist Vector
        let leftTempAngle = getAngleBetweenVectors(results.poseLandmarks[13], results.poseLandmarks[11], {x:0, y:1, z:0}, {x:0, y:0, z:1});
        if (leftTempAngle.confidence==1){
          LeftSoulderjointAngle = leftTempAngle;
        }

    //  Right Wrist to Albo Vector
        const rightWristToAlboVector = {x:results.poseLandmarks[16].x- results.poseLandmarks[14].x, y:results.poseLandmarks[16].y - results.poseLandmarks[14].y};
        const rightAlboToShoulderVector = {x:results.poseLandmarks[12].x- results.poseLandmarks[14].x, y:results.poseLandmarks[12].y - results.poseLandmarks[14].y};
        AngleRightAlbo = AngleBetTwoVector(rightWristToAlboVector.x, rightWristToAlboVector.y, rightAlboToShoulderVector.x, rightAlboToShoulderVector.y);

        //  Left Wrist to Albo Vector
        const LeftWristToAlboVector = {x:results.poseLandmarks[15].x- results.poseLandmarks[13].x, y:results.poseLandmarks[15].y - results.poseLandmarks[13].y};
        const LeftAlboToShoulderVector = {x:results.poseLandmarks[11].x- results.poseLandmarks[13].x, y:results.poseLandmarks[11].y - results.poseLandmarks[13].y};
        AngleLeftAlbo = AngleBetTwoVector(LeftWristToAlboVector.x, LeftWristToAlboVector.y, LeftAlboToShoulderVector.x, LeftAlboToShoulderVector.y);
    //
    
    const RightUpLegVector = {x:results.poseLandmarks[26].x-results.poseLandmarks[24].x, y:results.poseLandmarks[26].y-results.poseLandmarks[24].y, z:results.poseLandmarks[26].z-results.poseLandmarks[24].z};
    AngleRightUpLegx = AngleBetTwo3DVector(RightUpLegVector.x, RightUpLegVector.y, RightUpLegVector.z, 0, 1, 0);
    AngleRightUpLegz = AngleBetTwo3DVector(RightUpLegVector.x, 0, RightUpLegVector.z, 0, 0, 1);
    AngleRightUpLeg = getAngleBetweenVectors(results.poseLandmarks[26], results.poseLandmarks[24], {x:0, y:1, z:0}, {x:0, y:0, z:1});
    // if (tempUplegAngle.confidence==1){
    //   AngleRightUpLeg = tempUplegAngle;
    // }
    // console.log(AngleRightUpLegx*180/Math.PI);
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
            {/* <OrbitControls /> */}
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
