import './App.css';
import Camera_Check from './Camera_Check';
import { BrowserRouter as Router, Route, Link, Routes} from "react-router-dom";
import Face_Mesh_Test from './Face_Mesh_Test';
import Hand_Mesh_Test from './Hand_Mesh_Test';
import HandControlledCube from './HandControlledCube';
import CharacterControlDemo from './CharacterControlDemo';
import NavBar from './Navbar';

function App() {
  return (

    <div className="App">
    <NavBar/>
      <div className='content'>
      <Router>
        <Routes>
          <Route exact path="/Camera_Check" element = {<Camera_Check/>}/>
          <Route exact path="/Face_Mesh_Test" element = {<Face_Mesh_Test/>}/>
          <Route exact path="/Hand_Mesh_Test" element = {<Hand_Mesh_Test/>}/>
          <Route exact path="/HandControlledCube" element = {<HandControlledCube/>}/>
          <Route exact path="/CharacterControlDemo" element = {<CharacterControlDemo/>}/>
        </Routes>
      </Router>
      </div>
    </div>
  );
}

export default App;