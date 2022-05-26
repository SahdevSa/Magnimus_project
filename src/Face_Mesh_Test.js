import './App.css';
import {FaceMesh} from '@mediapipe/face_mesh';
import {Hands} from '@mediapipe/hands';
import * as Facemesh from '@mediapipe/face_mesh';
import * as hands from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import {useRef, useEffect, useState, Suspense} from 'react';
import {Canvas, useFrame} from 'react-three-fiber';

function Face_Mesh_Test() {
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

    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
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

    canvasCtx.restore();
  }

    useEffect(()=>{
    const faceMesh = new FaceMesh({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
      selfieMode: true
    })

    faceMesh.onResults(onResults);

    if(typeof camRef.current !==undefined && camRef.current !==null){
      camera = new cam.Camera(camRef.current.video, {
        onFrame:async()=>{
          await faceMesh.send({image: camRef.current.video})
        },
        width: 640,
        height: 480,
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

export default Face_Mesh_Test;