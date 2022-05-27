import './App.css';
import {Pose} from '@mediapipe/pose';
import * as pose from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import {useRef, useEffect, useState, Suspense} from 'react';


function Pose_Mesh_Test() {
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
        
    //canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.globalCompositeOperation = 'source-over';
    connect(canvasCtx, results.poseLandmarks, pose.POSE_CONNECTIONS,
                   {color: '#00FF00', lineWidth: 4});
                   connect(canvasCtx, results.poseLandmarks,
                  {color: '#FF0000', lineWidth: 2});
    drawLandmarks(canvasCtx, results.poseLandmarks,
                  {color: '#FF0000', lineWidth: 2});
    canvasCtx.restore();
    //grid.updateLandmarks(results.poseWorldLandmarks);
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

export default Pose_Mesh_Test;