import './App.css';
import {Hands} from '@mediapipe/hands';
import * as Facemesh from '@mediapipe/face_mesh';
import * as hands from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import {useRef, useEffect, useState} from 'react';
import {Canvas, useFrame} from 'react-three-fiber';

function HandControlledCube() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  var camera = null;
  const connect = window.drawConnectors;
  const drawLandmarks = window.drawLandmarks;
  var angleSpeed = 0;
  var x_p = 0;
  var y_p = 0;
  var z_p = 0;

  function onResults (results){
    //console.log(results);
    canvasRef.current.width = camRef.current.video.videoWidth;
    canvasRef.current.height = camRef.current.video.videoHeight;
    const canvasElement = canvasRef.current;
    
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();

    //canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiFaceLandmarks) {
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (const landmarks of results.multiFaceLandmarks) {
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION,
                      {color: '#C0C0C070', lineWidth: 1});
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {color: '#FF3030'});
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_IRIS, {color: '#FF3030'});
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {color: '#30FF30'});
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_IRIS, {color: '#30FF30'});
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
        connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {color: '#E0E0E0'});
      }
    }

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS,
                       {color: '#00FF00', lineWidth: 5});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
        let a = results.multiHandLandmarks[0][8].x- results.multiHandLandmarks[0][4].x;
        let b = results.multiHandLandmarks[0][8].y- results.multiHandLandmarks[0][4].y;
        let c = results.multiHandLandmarks[0][8].z- results.multiHandLandmarks[0][4].z;
        angleSpeed = 3*(Math.sqrt(a*a +b*b+c*c))*Math.sign(a);
        x_p = (640/480)*3.5*(-0.5+(results.multiHandLandmarks[0][8].x+ results.multiHandLandmarks[0][4].x)/2);
        y_p = 3.5*(0.5- (results.multiHandLandmarks[0][8].y+ results.multiHandLandmarks[0][4].y)/2);
      }
    }
    canvasCtx.restore();
  }


  useEffect(()=>{
    const hands = new Hands({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true
    });

    hands.onResults(onResults);

    if(typeof camRef.current !==undefined && camRef.current !==null){
      camera = new cam.Camera(camRef.current.video, {
        onFrame:async()=>{
          await hands.send({image: camRef.current.video})
        },
        width: window.screen.width,
        height: window.screen.height,
      });
      camera.start();
    }
  })
    

  function Box(){
    const boxRef = useRef();
  
    useFrame(() => {
      boxRef.current.rotation.y += angleSpeed;
      boxRef.current.position.x = x_p;
      boxRef.current.position.y = y_p;
    });

    return(
      <mesh ref={boxRef} position={[x_p, y_p, z_p]} rotation-x={Math.PI * 0.25} rotation-y={Math.PI * 0.25}>
         <boxBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial  attach="material" color="hotpink"/>
      </mesh>
    )
  }
  return (
    <div>
      <div style = {{visibility: 'hidden'}}>
      <Webcam 
      ref = {camRef} 
      screenshotFormat = "image/jpeg"
      style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.screen.height}}/>
      </div>
      <div>
          <h1>Bring your hand before the camera to control the cube. Move, rotate, open and close your hands.</h1>
      </div>
      <div>
      <canvas ref = {canvasRef}
      style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.screen.height}}/>
      </div>
      <div style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.window.screen.height}}>
      <Canvas>
        <Box />
        <ambientLight intensity={0.5}/>
        <spotLight position={[500, 500,500]} angle={0.7}/>
      </Canvas>
      </div>
    </div>
  );
}

export default HandControlledCube;