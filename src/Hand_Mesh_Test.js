import './App.css';
import {FaceMesh} from '@mediapipe/face_mesh';
import {Hands} from '@mediapipe/hands';
import * as Facemesh from '@mediapipe/face_mesh';
import * as hands from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import {useRef, useEffect, useState, Suspense} from 'react';
import {Canvas, useFrame} from 'react-three-fiber';

function Hand_Mesh_test() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  var camera = null;
  const connect = window.drawConnectors;
  const drawLandmarks = window.drawLandmarks;

  function onResults (results){
    //console.log(results);
    canvasRef.current.width = camRef.current.video.videoWidth;
    canvasRef.current.height = camRef.current.video.videoHeight;
    const canvasElement = canvasRef.current;
    
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS,
                       {color: '#00FF00', lineWidth: 5});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
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

  return (
    <div>
      <div style = {{visibility: 'hidden'}}>
      <Webcam 
      ref = {camRef} 
      screenshotFormat = "image/jpeg"
      style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.screen.height}}/>
      </div>

      <div>
      <canvas ref = {canvasRef}
      style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.screen.height}}/>
      </div>
    </div>
  );
}

export default Hand_Mesh_test;