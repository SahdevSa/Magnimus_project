import { useEffect } from "react";
import * as THREE from "three"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

function Home(){
    useEffect(()=>{
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.z = 5
        const canvas = document.getElementById("myThreeJsCanvas");
        const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        const boxGepmetry = new THREE.BoxGeometry(1,1,1);
        const boxMaterial = new THREE.MeshNormalMaterial();
        const boxMesh = new THREE.Mesh(boxGepmetry, boxMaterial);
        scene.add(boxMesh);

        const axisHelper = new THREE.AxesHelper()
        scene.add(axisHelper);

        boxMesh.scale.set(1,1, 2);

        const animate = () =>{
            
            
            boxMesh.rotation.x += 0.01;
            boxMesh.rotation.y += 0.01;
            boxMesh.position.x +=0.01;
            camera.lookAt(boxMesh.position);
            renderer.render( scene, camera );
            window.requestAnimationFrame( animate );
        };
        animate();
    }, [])

    return(
        <canvas id= "myThreeJsCanvas"/>
    )
}

export default Home