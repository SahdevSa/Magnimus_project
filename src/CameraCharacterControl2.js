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
    let RightUpLeg, RightUpLegjointAngle = {xAngle: 0, yAngle:Math.PI, xzProjectionAngle:Math.PI, confidence:0};
    let LeftLeg, AngleLeftLeg = Math.PI;
    let RightLeg, AngleRightLeg = Math.PI;
    let spine, AngleBetweenspineNLine=0, AngleBetweenspineNLine3 = {xAngle: 0, yAngle:0, xzProjectionAngle:0, confidence:0};
    let RightHip,  AngleRightHip=0;
    let LeftHip, AngleLeftHip=0;
    // temptype
    let AngleRightUpLegx = 0, AngleRightUpLegz=0;
    let AngleLeftUpLegz = 0, AngleLeftUpLegx = 0;


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

    LeftLeg = model.getObjectByName( 'mixamorigLeftLeg' );
    RightLeg = model.getObjectByName( 'mixamorigRightLeg' );

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

    function getAngleBetweenVectors_(startPoint, midPoint, Axis1, Axis2){
      let jointAngle = {xAngle: 0, yAngle:0, xzProjectionAngle:0, confidence:0};

      if(startPoint.visibility >0.5 && midPoint.visibility >0.5 ){
          let startvector = {x:(startPoint.x-midPoint.x), y:(startPoint.y-midPoint.y), z:(startPoint.z-midPoint.z)};
          // let endVector = {x:(midPoint.x - endPoint.x) , y: (midPoint.y - endPoint.y), z:(midPoint.z - endPoint.z)};
          // jointAngle.xAngle = Math.atan2(endVector.z,endVector.y) - Math.atan2(startvector.z,startvector.y);
          jointAngle.yAngle = AngleBetTwo3DVector(startvector.x, startvector.y, startvector.z, Axis1.x, Axis1.y, Axis1.z); 
          jointAngle.xzProjectionAngle = AngleBetTwo3DVector(0, startvector.y, startvector.z, Axis2.x, Axis2.y, Axis2.z); 
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
            if (RightHip){
              if (AngleRightUpLegz>0)
                RightHip.rotation.x = -(Math.PI/2 + AngleRightUpLegz);
              RightHip.rotation.z = AngleRightUpLegx;     // Correct 
            }
            if (RightUpLeg){
              if (AngleRightUpLegz>0)
                RightUpLeg.rotation.x = -(Math.PI/2 + AngleRightUpLegz);
              RightUpLeg.rotation.z = AngleRightUpLegx;     // Correct 

              RightUpLeg.rotation.x =  RightUpLegjointAngle.xzProjectionAngle;
              RightUpLeg.rotation.z = RightUpLegjointAngle.yAngle;
            }
            if (LeftUpLeg){
              if (AngleLeftUpLegz>0)
                LeftUpLeg.rotation.x = -(Math.PI + AngleLeftUpLegz);
              LeftUpLeg.rotation.z = -AngleLeftUpLegx;     // Correct 
            }
            if (RightLeg){
              RightLeg.rotation.x = Math.PI - AngleRightLeg;
            }
            if (LeftLeg){
              LeftLeg.rotation.x = Math.PI - AngleLeftLeg;
            }

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
        // canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.globalCompositeOperation = 'source-over';
        connect(canvasCtx, results.poseLandmarks, pose.POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        connect(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
        drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
        canvasCtx.restore();

    //  Spin Vector
        const spineVector = {x:((results.poseWorldLandmarks[11].x+ results.poseWorldLandmarks[12].x)/2 - (results.poseWorldLandmarks[23].x+ results.poseWorldLandmarks[24].x)/2), y:((results.poseWorldLandmarks[11].y + results.poseWorldLandmarks[12].y)/2-(results.poseWorldLandmarks[23].y+ results.poseWorldLandmarks[24].y)/2), z:((results.poseWorldLandmarks[11].z + results.poseWorldLandmarks[12].z)/2-(results.poseWorldLandmarks[23].z+ results.poseWorldLandmarks[24].z)/2)};
        const spineVectorR = {x:(-(results.poseWorldLandmarks[11].x+ results.poseWorldLandmarks[12].x)/2 + (results.poseWorldLandmarks[23].x+ results.poseWorldLandmarks[24].x)/2), y:(-(results.poseWorldLandmarks[11].y + results.poseWorldLandmarks[12].y)/2+(results.poseWorldLandmarks[23].y+ results.poseWorldLandmarks[24].y)/2), z:(-(results.poseWorldLandmarks[11].z + results.poseWorldLandmarks[12].z)/2+(results.poseWorldLandmarks[23].z+ results.poseWorldLandmarks[24].z)/2)};
        AngleBetweenspineNLine = -(Math.PI/2 + Math.atan2(spineVector.y-0, spineVector.x-0));
        AngleBetweenspineNLine3 = -(Math.PI/2 + Math.atan2(spineVector.y-0, spineVector.z-0));

    // Nose Vector from the center of chest
        const midspine = {x:(results.poseWorldLandmarks[11].x+ results.poseWorldLandmarks[12].x)/2, y:(results.poseWorldLandmarks[11].y+ results.poseWorldLandmarks[12].y)/2, z:(results.poseWorldLandmarks[11].z+ results.poseWorldLandmarks[12].z)/2, visibility:1};

        const shoulderVector = {x:(results.poseWorldLandmarks[11].x - results.poseWorldLandmarks[12].x), y:(results.poseWorldLandmarks[11].y- results.poseWorldLandmarks[12].y), z:(results.poseWorldLandmarks[11].z- results.poseWorldLandmarks[12].z)};
        const mouthVector = {x:(results.poseWorldLandmarks[9].x - results.poseWorldLandmarks[10].x), y:(results.poseWorldLandmarks[9].y- results.poseWorldLandmarks[10].y), z:(results.poseWorldLandmarks[9].z- results.poseWorldLandmarks[10].z)};
        head_z_Angle = AngleBetweenspineNLine-Math.atan2(mouthVector.y, mouthVector.x) - Math.atan2(shoulderVector.y, shoulderVector.x);
        head_z_Angle = head_z_Angle>0.9?0.9:head_z_Angle;
        head_z_Angle = head_z_Angle<-0.9?-0.9:head_z_Angle;
        // console.log((Math.PI-head_z_Angle.yAngle)*180/Math.PI);
    //  Right soulder to Wrist Vector
        let rightTempAngle = getAngleBetweenVectors(results.poseWorldLandmarks[14], results.poseWorldLandmarks[12], {x:0, y:1, z:0}, {x:0, y:0, z:1});
        if (rightTempAngle.confidence==1){
          RightSoulderjointAngle = rightTempAngle;
        }

    //  Left Soulder to Wrist Vector
        let leftTempAngle = getAngleBetweenVectors(results.poseWorldLandmarks[13], results.poseWorldLandmarks[11], {x:0, y:1, z:0}, {x:0, y:0, z:1});
        if (leftTempAngle.confidence==1){
          LeftSoulderjointAngle = leftTempAngle;
        }

    //  Right Wrist to Albo Vector
        const rightWristToAlboVector = {x:results.poseWorldLandmarks[16].x- results.poseWorldLandmarks[14].x, y:results.poseWorldLandmarks[16].y - results.poseWorldLandmarks[14].y};
        const rightAlboToShoulderVector = {x:results.poseWorldLandmarks[12].x- results.poseWorldLandmarks[14].x, y:results.poseWorldLandmarks[12].y - results.poseWorldLandmarks[14].y};
        AngleRightAlbo = AngleBetTwoVector(rightWristToAlboVector.x, rightWristToAlboVector.y, rightAlboToShoulderVector.x, rightAlboToShoulderVector.y);

        //  Left Wrist to Albo Vector
        const LeftWristToAlboVector = {x:results.poseWorldLandmarks[15].x- results.poseWorldLandmarks[13].x, y:results.poseWorldLandmarks[15].y - results.poseWorldLandmarks[13].y};
        const LeftAlboToShoulderVector = {x:results.poseWorldLandmarks[11].x- results.poseWorldLandmarks[13].x, y:results.poseWorldLandmarks[11].y - results.poseWorldLandmarks[13].y};
        AngleLeftAlbo = AngleBetTwoVector(LeftWristToAlboVector.x, LeftWristToAlboVector.y, LeftAlboToShoulderVector.x, LeftAlboToShoulderVector.y);
    //
    
        const RightUpLegVector = {x:results.poseWorldLandmarks[26].x-results.poseWorldLandmarks[24].x, y:results.poseWorldLandmarks[26].y-results.poseWorldLandmarks[24].y, z:results.poseWorldLandmarks[26].z-results.poseWorldLandmarks[24].z};
        let RightLegTempAng = getAngleBetweenVectors_(results.poseWorldLandmarks[26], results.poseWorldLandmarks[24], {x:0, y:1, z:0}, {x:0, y:0, z:1});    // Try
        if (RightLegTempAng.confidence==1){
          RightUpLegjointAngle = RightLegTempAng;
        }
        let ArightUpLx = AngleBetTwo3DVector(RightUpLegVector.x, RightUpLegVector.y, RightUpLegVector.z, 0, 1, 0);
        let ArightUpLz= AngleBetTwo3DVector(0, RightUpLegVector.y, RightUpLegVector.z, 0, 0, 1);
        if (results.poseWorldLandmarks[26].visibility > 0.6 && results.poseWorldLandmarks[24].visibility > 0.6){
          AngleRightUpLegz = ArightUpLz;
          AngleRightUpLegx = ArightUpLx;
        }else{
          AngleRightUpLegz = 0;
          AngleRightUpLegx = 0;
        }

        const LeftUpLegVector = {x:results.poseWorldLandmarks[25].x-results.poseWorldLandmarks[23].x, y:results.poseWorldLandmarks[25].y-results.poseWorldLandmarks[23].y, z:results.poseWorldLandmarks[25].z-results.poseWorldLandmarks[23].z};
        let AleftUpLx = AngleBetTwo3DVector(LeftUpLegVector.x, LeftUpLegVector.y, LeftUpLegVector.z, 0, 1, 0);
        // let AleftUpLx = AngleBetTwo3DVector(LeftUpLegVector.x, LeftUpLegVector.y, 0, 0, 1, 0);
        let AleftUpLz = AngleBetTwo3DVector(0, LeftUpLegVector.y, LeftUpLegVector.z, 0, 0, 1);
        // let AleftUpLz = AngleBetTwo3DVector(0, LeftUpLegVector.y, LeftUpLegVector.z, 0, 1, 0);
        if (results.poseWorldLandmarks[25].visibility > 0.6 && results.poseWorldLandmarks[23].visibility > 0.6){
          AngleLeftUpLegz = AleftUpLz;
          AngleLeftUpLegx = AleftUpLx;
        }else{
          AngleLeftUpLegz = 0;
          AngleLeftUpLegx = 0;
        }


        // RightLeg Vector, Angle calculation
        const RightLegVector = {x:results.poseWorldLandmarks[26].x-results.poseWorldLandmarks[28].x, y:results.poseWorldLandmarks[28].y-results.poseWorldLandmarks[26].y, z:results.poseWorldLandmarks[28].z-results.poseWorldLandmarks[26].z};
        let ArightLegz = AngleBetTwoVector(RightLegVector.y, RightLegVector.z, -RightUpLegVector.y, -RightUpLegVector.z);
        if (results.poseWorldLandmarks[26].visibility > 0.6 && results.poseWorldLandmarks[28].visibility > 0.6){
          AngleRightLeg = ArightLegz;
        }

        // RightLeg Vector, Angle calculation
        const LeftLegVector = {x:results.poseWorldLandmarks[26].x-results.poseWorldLandmarks[28].x, y:results.poseWorldLandmarks[28].y-results.poseWorldLandmarks[26].y, z:results.poseWorldLandmarks[28].z-results.poseWorldLandmarks[26].z};
        let ALeftLegz = AngleBetTwoVector(LeftLegVector.y, LeftLegVector.z, -LeftUpLegVector.y, -LeftUpLegVector.z);
        if (results.poseWorldLandmarks[25].visibility > 0.6 && results.poseWorldLandmarks[2].visibility > 0.6){
          AngleLeftLeg = ALeftLegz;
        }
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
