import React, { useEffect, useRef, useState } from "react";

function ReadyPlayerMe(){
    const subdomain = 'hallway' // See section about becoming a partner
    const iFrameRef = useRef(null)
    const [avatarUrl, setAvatarUrl] = useState('')
    const [showIFrame, setShowIFrame] = useState(true)

    function subscribe(event) {
        const json = parse(event)
        if (json?.source !== 'readyplayerme') {
          return;
        }
        // Subscribe to all events sent from Ready Player Me 
        // once frame is ready
        if (json.eventName === 'v1.frame.ready') {
          let iFrame = iFrameRef.current
          if(iFrame && iFrame.contentWindow) {
            iFrame.contentWindow.postMessage(
              JSON.stringify({
                target: 'readyplayerme',
                type: 'subscribe',
                eventName: 'v1.**'
              }),
              '*'
            );
          }
        }
        // Get avatar GLB URL
        if (json.eventName === 'v1.avatar.exported') {
          console.log(`Avatar URL: ${json.data.url}`);
          setAvatarUrl(json.data.url)
          setShowIFrame(false);
        }
        // Get user id
        if (json.eventName === 'v1.user.set') {
          console.log(`User with id ${json.data.id} set:
    ${JSON.stringify(json)}`);
        }
      }
      function parse(event) {
        try {
          return JSON.parse(event.data);
        } catch (error) {
          return null;
        }
      }
    
    useEffect(() => {
      let iFrame = iFrameRef.current
      if(iFrame) {
         iFrame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`
         iFrame.width = 640;
         iFrame.height = 480;
      }
    })
    useEffect(() => {
      window.addEventListener('message', subscribe)
      document.addEventListener('message', subscribe)
      return () => {
        window.removeEventListener('message', subscribe)
        document.removeEventListener('message', subscribe)
      }
    });

    return(
        <div className="Avatar">
            <div className="topBar">
            <input
                className="toggleButton"
                onClick={() => setShowIFrame(!showIFrame)}
                type="button"
                value={`${showIFrame ? 'Close': 'Open'} creator`}
            />
            <p id="avatarUrl">Avatar URL: {avatarUrl}</p>
            </div>
            <div style = {{textAlign: 'center', width: window.screen.width, height: window.screen.height}}>
            <iframe
            allow="camera *; microphone *"
            className="iFrame"
            id="frame"
            ref={iFrameRef}
            style={{
                display: `${showIFrame ? 'block': 'none'}`
            }}
            title={"Ready Player Me"}
            />
            </div>
      </div>
    )
}

export default ReadyPlayerMe