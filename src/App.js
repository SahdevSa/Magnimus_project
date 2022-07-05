import './App.css';
import Camera_Check from './Camera_Check';
import { BrowserRouter as Router, Route, Link, Routes} from "react-router-dom";
import Face_Mesh_Test from './Face_Mesh_Test';
import Hand_Mesh_Test from './Hand_Mesh_Test';
import HandControlledCube from './HandControlledCube';
import CharacterControlDemo from './CharacterControlDemo';
import NavBar from './Navbar';
import Pose_Mesh_Test from './Pose_Mesh_Test';
import ReadyPlayerMe from './readyPlayerMe';
import Home from './Home';
import Main from './Main';


import CameraCharacterControl from './CameraCharacterControl';

function App() {


  return (

    <div className="App">
    <NavBar/>
      <div className='content' style = {{position: 'absolute', marginLeft:'auto', marginRight: 'auto', left: 0, right: 0, textAlign: 'center', width: window.screen.width, height: window.screen.height}}>
      <Router>
        <Routes>
        <Route exact path="/" element = {<CameraCharacterControl/>}/>
          <Route exact path="/Home" element = {<Home/>}/>
          <Route exact path="/Camera_Check" element = {<Camera_Check/>}/>
          <Route exact path="/Face_Mesh_Test" element = {<Face_Mesh_Test/>}/>
          <Route exact path="/Pose_Mesh_Test" element = {<Pose_Mesh_Test/>}/>
          <Route exact path="/Hand_Mesh_Test" element = {<Hand_Mesh_Test/>}/>
          <Route exact path="/HandControlledCube" element = {<HandControlledCube/>}/>
          <Route exact path="/CharacterControlDemo" element = {<CharacterControlDemo/>}/>
          <Route exact path="/ReadyPlayerMe" element = {<ReadyPlayerMe/>}/>
        </Routes>
      </Router>
      </div>
    </div>
  );
}

export default App;