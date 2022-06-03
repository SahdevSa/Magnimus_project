
import { useState } from 'react';
import {Canvas, useFrame} from 'react-three-fiber';
import { OrbitControls } from "@react-three/drei";
import Model from "./Remy_walk_idle_jump"
import Model_Tower from './Tower';

function CharacterControlDemo() {
    const [action, setAction] = useState("walk");

  return (
    <div>
      <div style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, top: 60, textAlign: 'center', width: window.screen.width, height: window.window.screen.height}}>
      <div className='Controls'>
        <button onClick={()=>{
              setAction("idle")
          }}>Idle</button>
        <button onClick={()=>{
              setAction("jump")
          }}>Jump</button>
        <button onClick={()=>{
              setAction("walk")
          }}>walk</button>
      </div>

      <Canvas camera={{ position: [0, 0, 3] }}>
      <color attach="background" args={["black"]} />
        <ambientLight />
        <pointLight intensity={2} position={[-1, 1, 3]} color="red" />
        <pointLight intensity={2} position={[1, 1, 3]} color="blue" />
        <pointLight intensity={2} position={[0, 3, -10]} color="white" />
        <Model action = {action}/>
        <OrbitControls target={[0, 1, 0]} autoRotate />
      </Canvas>
      </div>
    </div>
  );
}

export default CharacterControlDemo;