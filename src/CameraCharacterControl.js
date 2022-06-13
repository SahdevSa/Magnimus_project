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
    let Head_Joint,  head_z_Angle=0;
    let Left_Shoulder_Joint,  AngleLeftArm ={xAngle:0, yAngle:0,zAngle:0};
    let Right_Shoulder_Joint, AngleRightArm ={xAngle:0, yAngle:0,zAngle:0};
    let spineJoint, spineAngle=0;
    let rightLegHipJoint, AngleRightLeg ={xAngle:0, yAngle:0,zAngle:0};
    let leftLegHipJoint, AngleLeftLeg ={xAngle:0, yAngle:0,zAngle:0};
    let counter = 0;

    const onWindowResize =() =>{
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    threeCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 10 );
    threeCamera.position.set(2, 2, - 2);
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
    
    console.log(model);
    Left_Shoulder_Joint = model.getObjectByName( 'mixamorigLeftArm' );

    Right_Shoulder_Joint = model.getObjectByName( 'mixamorigRightArm' );

    Head_Joint = model.getObjectByName( 'mixamorigNeck' );

    spineJoint =  model.getObjectByName( 'mixamorigSpine' );

    rightLegHipJoint =  model.getObjectByName( 'mixamorigRightUpLeg' );

    leftLegHipJoint =  model.getObjectByName( 'mixamorigLeftUpLeg' );

    scene.add( model );

    } );

    
    function getAngleBetweenVectors(startPoint, midPoint, endPoint){
        let jointAngle = {xAngle: 0, yAngle:0, zAngle:0, confidence:0};

        if(startPoint.visibility >0.5 && midPoint.visibility >0.5 && endPoint.visibility >0.5 ){
            let startvector = {x:(startPoint.x-midPoint.x), y:(startPoint.y-midPoint.y), z:(startPoint.z-midPoint.z)};
            let endVector = {x:(midPoint.x - endPoint.x) , y: (midPoint.y - endPoint.y), z:(midPoint.z - endPoint.z)};
            jointAngle.xAngle = Math.atan2(endVector.z,endVector.y) - Math.atan2(startvector.z,startvector.y)
            jointAngle.yAngle = Math.atan2(endVector.x,endVector.z) - Math.atan2(startvector.x,startvector.z)
            jointAngle.zAngle = Math.atan2(endVector.y,endVector.x) - Math.atan2(startvector.y,startvector.x)
            jointAngle.confidence = 1;
        }
        return jointAngle;
    }

    useEffect(()=>{
        const canvas = document.getElementById("myThreeJsCanvas");
        renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        //renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;

        window.addEventListener( 'resize', onWindowResize, false );

        const controls = new OrbitControls(threeCamera, renderer.domElement );
        controls.target.set( 0, 1, 0 );
        controls.update();

        const animate = () =>{
            requestAnimationFrame( animate );
            const t = clock.getElapsedTime();
            if(Left_Shoulder_Joint){
                Left_Shoulder_Joint.quaternion._x = -AngleLeftArm.xAngle;
                Left_Shoulder_Joint.quaternion._y = -0.3;
                Left_Shoulder_Joint.quaternion._z= AngleLeftArm.zAngle;
            }

            if(Right_Shoulder_Joint){
                Right_Shoulder_Joint.rotation.x = AngleRightArm.yAngle;
                Right_Shoulder_Joint.rotation.y = 0.3;
                Right_Shoulder_Joint.rotation.z = AngleRightArm.zAngle;
            }

            if(Head_Joint)
            Head_Joint.rotation.z = head_z_Angle;

            if(spineJoint)
            spineJoint.rotation.z = spineAngle;

            if(rightLegHipJoint){
                rightLegHipJoint.rotation.x = AngleRightLeg.xAngle ;
                rightLegHipJoint.rotation.z = AngleRightLeg.zAngle;
            }
            

            if(leftLegHipJoint){
                leftLegHipJoint.rotation.x = AngleLeftLeg.xAngle ;
                leftLegHipJoint.rotation.z = AngleLeftLeg.zAngle;
            }
            

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
            
        //canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.globalCompositeOperation = 'source-over';
        connect(canvasCtx, results.poseLandmarks, pose.POSE_CONNECTIONS,
                       {color: '#00FF00', lineWidth: 4});
                       connect(canvasCtx, results.poseLandmarks,
                      {color: '#FF0000', lineWidth: 2});
        drawLandmarks(canvasCtx, results.poseLandmarks,
                      {color: '#FF0000', lineWidth: 2});
        canvasCtx.restore();

        const shoulderCenter = {x:(results.poseLandmarks[11].x+ results.poseLandmarks[12].x)/2, y:(results.poseLandmarks[11].y+ results.poseLandmarks[12].y)/2,  z:(results.poseLandmarks[11].z+ results.poseLandmarks[12].z)/2};
        const shoulderVector = {x:(results.poseLandmarks[11].x - results.poseLandmarks[12].x), y:(results.poseLandmarks[11].y- results.poseLandmarks[12].y), z:(results.poseLandmarks[11].z- results.poseLandmarks[12].z)};
        const waistVector = {x:(results.poseLandmarks[23].x - results.poseLandmarks[24].x), y:(results.poseLandmarks[23].y- results.poseLandmarks[24].y), z:(results.poseLandmarks[23].z- results.poseLandmarks[24].z)};
        const waistCenter =  {x:(results.poseLandmarks[24].x+ results.poseLandmarks[23].x)/2, y:(results.poseLandmarks[24].y+ results.poseLandmarks[23].y)/2, z:(results.poseLandmarks[24].z+ results.poseLandmarks[23].z)/2,};

        const legCenter = {x:(results.poseLandmarks[27].x+ results.poseLandmarks[28].x)/2, y:(results.poseLandmarks[27].y+ results.poseLandmarks[28].y)/2};
        const shoulderToWaistVector = {x: shoulderCenter.x-waistCenter.x, y:shoulderCenter.y-waistCenter.y, z:shoulderCenter.z-waistCenter.z};       
        spineAngle = -0.6-2*(Math.PI/2 + Math.atan2(shoulderToWaistVector.y- waistVector.y , shoulderToWaistVector.x- waistVector.x));

        const mouthVector = {x:(results.poseLandmarks[9].x - results.poseLandmarks[10].x), y:(results.poseLandmarks[9].y- results.poseLandmarks[10].y)};
        head_z_Angle = spineAngle-Math.atan2(mouthVector.y, mouthVector.x) - Math.atan2(shoulderVector.y, shoulderVector.x);
        head_z_Angle = head_z_Angle>0.9?0.9:head_z_Angle;
        head_z_Angle = head_z_Angle<-0.9?-0.9:head_z_Angle;

        let tempAng = getAngleBetweenVectors(results.poseLandmarks[14], results.poseLandmarks[12], results.poseLandmarks[11]);
        AngleRightArm = tempAng.confidence==1?tempAng: AngleRightArm;
        //if(AngleRightArm.yAngle<0) AngleRightArm.yAngle = -AngleRightArm.yAngle;

        tempAng = getAngleBetweenVectors(results.poseLandmarks[12], results.poseLandmarks[11], results.poseLandmarks[13]);
        AngleLeftArm = tempAng.confidence==1?tempAng: AngleLeftArm;
        //if(AngleLeftArm.yAngle>0.7) AngleLeftArm.yAngle = AngleLeftArm.yAngle-0.7;

        //const rightLegVector = {x:(results.poseLandmarks[28].x - results.poseLandmarks[24].x), y:(results.poseLandmarks[28].y- results.poseLandmarks[24].y)};
        //AngleRightLeg = (-0.2+Math.PI/2+ Math.atan2(waistVector.y- rightLegVector.y , waistVector.x- rightLegVector.x));
        tempAng = getAngleBetweenVectors(results.poseLandmarks[26], results.poseLandmarks[24], results.poseLandmarks[12]);
        tempAng.zAngle = -tempAng.zAngle;
        tempAng.xAngle = -(tempAng.xAngle +Math.PI/2+1.2);
        AngleRightLeg = tempAng.confidence==1?tempAng: AngleRightLeg;
        
        //const leftLegVector = {x:(results.poseLandmarks[27].x - results.poseLandmarks[23].x), y:(results.poseLandmarks[27].y- results.poseLandmarks[23].y)};
        //AngleLeftLeg = (-0.2+Math.PI/2+ Math.atan2(waistVector.y- leftLegVector.y , waistVector.x- leftLegVector.x));
        tempAng = getAngleBetweenVectors(results.poseLandmarks[25], results.poseLandmarks[24], results.poseLandmarks[11]);
        tempAng.zAngle = -tempAng.zAngle+0.8;
        tempAng.xAngle = -(tempAng.xAngle +Math.PI/2+1.2);
        AngleLeftLeg = tempAng.confidence==1?tempAng: AngleLeftLeg;

        counter +=1; 
        if(counter%100==0)
         {
            //console.log(results.poseLandmarks[0])
            document.getElementById('data_display').value = "Nose X: "+results.poseLandmarks[0].x +"\r\n"+ "Nose Y: "+results.poseLandmarks[0].y;
            const imageSrc = camRef.current.getScreenshot();
            console.log(imageSrc);
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
            width: window.screen.width/4,
            height: window.screen.height/4,
          });
          camera.start();
        }
    
      }) 

    return(
        <div>
            <canvas id= "myThreeJsCanvas"  style = {{position: 'absolute', left: "25%", top: "0%", textAlign: 'center', width: window.screen.width/2, height: window.screen.height/2, border: "1px solid black"}}/>
           
            <div style = {{position: 'absolute', left: "0%", top: "0%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black", visibility: 'visible'}}>
            <Webcam 
            ref = {camRef} 
            screenshotFormat = "image/jpeg"
            style =  {{position: 'absolute', left: "0%", top: "0%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black"}}/>
            </div>
            <canvas id= "poseCanvas" ref = {canvasRef} style = {{position: 'absolute', left: "0%", top: "0%", textAlign: 'center', width: window.screen.width/4, height: window.screen.height/4, border: "1px solid black"}}/>
            <textarea id="data_display"  readonly="true" style = {{position: 'absolute', left: "0%", top: "35%", textAlign: 'center', width: window.screen.width/8, height: window.screen.height/8, border: "1px solid black"}}>Data</textarea>

        </div>
    )
}

export default CameraCharacterControl