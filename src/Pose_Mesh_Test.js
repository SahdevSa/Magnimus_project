import './App.css';
import {Pose} from '@mediapipe/pose';
import * as pose from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import {useRef, useEffect, useState, Suspense} from 'react';
import Chart_Test from './Chart_Test';
import { Line} from 'react-chartjs-2'
import { upload } from '@testing-library/user-event/dist/upload';
// Have plot graph
function Pose_Mesh_Test() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  var camera = null;
  const connect = window.drawConnectors;
  const drawLandmarks = window.drawLandmarks;

  const lineRef = useRef();
  const dataArray = [...Array(400).keys()];
  const dataArray2 = [...Array(33).keys()];
  
  const [landMarkArray, setLandMarkArray] = useState({
    labels: [...Array(400).keys()],
    datasets: [{
      labels: '#votes',
      data: dataArray,
    }]
  }, []);

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
    dataArray.shift();
    dataArray2.shift();
    try{
      dataArray.push(results.poseLandmarks[0].y);
      // dataArray2.push(20);
    }
    catch(err){
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
          /*setLandMarkArray({
            labels: [...Array(400).keys()],
            datasets: [{
              labels: '#votes',
              data: dataArray,
            }]})*/
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

  })

  function MyForm() {
    const [myCar, setMyCar] = useState("none");
  
    const handleChange = (event) => {
      setMyCar(event.target.value)
    }

    return (
      <form>
        <select value={myCar} onChange={handleChange}>
          <option value="none">none</option>
          {Object.values(dataArray2).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </form>
    )
  }

  return (
    <div>
      <div className='Status-box'>
        <span>
          <h3 >Current Pose Status</h3>
          <h5 className='Status-text'>None</h5>
        </span>
        <span style={{marginLeft: 'auto'}}>
          <h3>Visible points</h3>
          <MyForm/>
        </span>
      </div>
      <div style = {{visibility: 'hidden'}}>
      <Webcam 
      ref = {camRef} 
      screenshotFormat = "image/jpeg"
      style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.screen.height}}/>
      </div>
      
      <div style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: -0, right: 0, textAlign: 'left', width: window.screen.width/5, height: window.screen.height/8}}>
      <Line ref={lineRef}
        data={landMarkArray}
        width={100}
        height= {300}
        options={{maintainAspectRatio:false}}
        redraw= {true}
      />
      </div>
      
      <div>
      <canvas ref = {canvasRef}
      style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.screen.height}}>
        
        </canvas>
      </div>
    </div>
  );
}

export default Pose_Mesh_Test;