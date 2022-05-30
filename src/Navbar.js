import "./App.css"
import "bootstrap/dist/css/bootstrap.css"
import { Nav, Navbar } from "react-bootstrap"

export default function NavBar(){
    return <Navbar bg = "myRed" variant = "dark" sticky = "top">
        <Nav>
            <Nav.Link href = "/Home">Home</Nav.Link>
            <Nav.Link href = "/Camera_Check">Check Camera</Nav.Link>
            <Nav.Link href = "/Face_Mesh_Test">Face Mesh</Nav.Link>
            <Nav.Link href = "/Hand_Mesh_Test">Hand Mesh</Nav.Link>
            <Nav.Link href = "/Pose_Mesh_Test">Pose</Nav.Link>
            <Nav.Link href = "/HandControlledCube">Hand Controlled Cube</Nav.Link>
            <Nav.Link href = "/CharacterControlDemo">Character Control Demo</Nav.Link>
            <Nav.Link href = "/ReadyPlayerMe">Choose Avatar</Nav.Link>
        </Nav>
    </Navbar> 
}