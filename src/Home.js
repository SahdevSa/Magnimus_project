

import { useEffect } from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

function Home(){
    let camera, scene, renderer, clock, Left_Shoulder_Joint, Right_Shoulder_Joint, joint, leftupLeg, rightupLeg; 
    const onWindowResize =() =>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 10 );
    camera.position.set( 2, 2, - 2 );
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    const light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 1, 0 );
    scene.add( light );

    // model
    const loader = new GLTFLoader();
    loader.load( 'https://threejs.org/examples/models/gltf/Soldier.glb', function ( gltf ) {

    const model = gltf.scene;
    
    Left_Shoulder_Joint = model.getObjectByName( 'mixamorigLeftArm' );
    leftupLeg = model.getObjectByName( 'mixamorigLeftUpLeg' );
    // rightupLeg = model.getObjectByName( 'mixamorigRightUpLeg' );
    // Left_Shoulder_Joint.rotation.x = -0.2;
    // Left_Shoulder_Joint.rotation.y = -0.1;
    // Left_Shoulder_Joint.rotation.z = 0.1;

    Right_Shoulder_Joint = model.getObjectByName( 'mixamorigRightArm' );
    // Right_Shoulder_Joint.rotation.x = -0.2;
    // Right_Shoulder_Joint.rotation.y = -0.1;
    // Right_Shoulder_Joint.rotation.z = 0.1;
    
    joint = model.getObjectByName( 'mixamorigHead' );
    // joint.rotation.x = -0.3;
    // joint.rotation.y = -0.5;
    // joint.rotation.z = 0.5;

    scene.add( model );
    } );

    useEffect(()=>{
        const canvas = document.getElementById("myThreeJsCanvas");
        renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;

        window.addEventListener( 'resize', onWindowResize, false );

        const controls = new OrbitControls(camera, renderer.domElement );
        controls.target.set( 0, 1, 0 );
        controls.autoRotate = true;
        controls.update();

        const animate = () =>{
            requestAnimationFrame( animate );
            const t = clock.getElapsedTime();
            if(Left_Shoulder_Joint)
            Left_Shoulder_Joint.rotation.z += Math.sin( t ) * 0.2;

            if(Right_Shoulder_Joint)
            Right_Shoulder_Joint.rotation.z += Math.sin( t ) * 0.005;

            if (joint)
            joint.rotation.y -=Math.sin( t ) * 0.009;
            if (leftupLeg)
            leftupLeg.rotation.x -=Math.sin( t ) * 0.007;
            // rightupLeg.rotation.x -=Math.sin( t ) * 0.007;
            controls.update();
            renderer.render( scene, camera);
        };
        animate();
    }, [])

    return(
        <div>
            <canvas id= "myThreeJsCanvas">    
            </canvas>
        </div>
    )
}

export default Home