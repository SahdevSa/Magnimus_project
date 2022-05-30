import { useEffect } from "react";
import * as THREE from "three"


function Font_Test(){
    useEffect(()=>{
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.z = 96
        const canvas = document.getElementById("myThreeJsCanvas");
        const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        const boxGepmetry = new THREE.BoxGeometry(16,16,16);
        const boxMaterial = new THREE.MeshNormalMaterial();
        const boxMesh = new THREE.Mesh(boxGepmetry, boxMaterial);
        scene.add(boxMesh);

        const animate = () =>{
            
            renderer.render( scene, camera );
            boxMesh.rotation.x += 0.01;
            boxMesh.rotation.y += 0.01;
            window.requestAnimationFrame( animate );
        };
        animate();
    }, [])

    return(
        <canvas id= "myThreeJsCanvas"/>
    )
}

export default Font_Test