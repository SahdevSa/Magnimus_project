import React from "react";
import Webcam from "react-webcam";

function Camera_Check(){
    return(
        <div>
            <h1>We will check and set the the camera functionality here.</h1>
            <div style = {{visibility: 'visible'}}>
            <Webcam 
            screenshotFormat = "image/jpeg"
            style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.screen.height}}/>
            </div>
        </div>
    )
}

export default Camera_Check