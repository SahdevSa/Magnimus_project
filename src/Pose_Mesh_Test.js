import './App.css';
import {Pose} from '@mediapipe/pose';
import * as pose from '@mediapipe/pose';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import {useRef, useEffect, useState, Suspense} from 'react';

import { Line} from 'react-chartjs-2'
import LineChart from './LineChart';

// Have plot graph
function Pose_Mesh_Test() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  var camera = null;
  const connect = window.drawConnectors;
  const drawLandmarks = window.drawLandmarks;


  const lineRef = useRef();
  const timeArray = [...Array(100).keys()];
  const dataArray1 = [...Array(100).keys()];
  const dataArray2 = [...Array(100).keys()];
  const dataArray3 = [...Array(33).keys()];
  const [landMarkArray, setLandMarkArray] = useState({
    labels: [...Array(100).keys()],
    datasets: [
          {
            label: "First dataset",
            data: dataArray1,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)"
          },
          {
            label: "Second dataset",
            data: dataArray2,
            fill: false,
            borderColor: "#742774"
          }
        ],
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
    if (results.poseLandmarks[0].visibility>0.5){
      dataArray3.push(0);
      dataArray3.shift();
    }
    if(results.poseLandmarks[15].visibility>0.5 && results.poseLandmarks[16].visibility>0.5 ){
      let d = new Date();
      timeArray.push(d.getTime());
      timeArray.shift()
      dataArray1.push(results.poseLandmarks[15].y);
      dataArray1.shift();
      dataArray2.push(results.poseLandmarks[16].y);
      dataArray2.shift();
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

  function MyForm() {
    const [myCar, setMyCar] = useState("none");
  
    const handleChange = (event) => {
      setMyCar(event.target.value)
    }

    return (
      <form onClick={()=>setMyCar(myCar = "1")}>
        <select value={myCar} onChange={handleChange}>
          <option value="none">none</option>

          {Object.keys(dataArray3).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </form>
    )
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setLandMarkArray({
        labels: timeArray,
        datasets: [
          {
            label: "Left Hand",
            data: dataArray1,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)"
          },
          {
            label: "Right Hand",
            data: dataArray2,
            fill: false,
            borderColor: "#742774"
          }
        ]});
    }, 10000);
  
    return () => clearInterval(interval);
  }, []);

    
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
      style = {{position: 'absolute', left: "10%", top: "30%", textAlign: 'center', width: window.screen.width/1.5, height: window.screen.height/1.5}}/>
      </div>
      
      <LineChart data= {landMarkArray}/>
      
      <div>
      <canvas ref = {canvasRef}
      style = {{position: 'absolute', left: "0%", top: "0%", textAlign: 'center', width: window.screen.width/1.5, height: window.screen.height/1.5}}>  
      </canvas>
      </div>
    </div>
  );
}

export default Pose_Mesh_Test;