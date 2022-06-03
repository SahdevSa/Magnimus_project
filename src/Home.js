// import { useEffect } from "react";
// import * as THREE from "three"
// import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

// function Home(){
//     useEffect(()=>{
//         const scene = new THREE.Scene();
//         const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
//         camera.position.z = 5
//         const canvas = document.getElementById("myThreeJsCanvas");
//         const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
//         renderer.setSize( window.innerWidth, window.innerHeight );
//         document.body.appendChild( renderer.domElement );
//         const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//         ambientLight.castShadow = true;
//         scene.add(ambientLight);

        
//         const boxGepmetry = new THREE.BoxGeometry(1,1,1);
//         const boxMaterial = new THREE.MeshNormalMaterial();
//         const boxMesh = new THREE.Mesh(boxGepmetry, boxMaterial);
//         scene.add(boxMesh);

//         const group1 = new THREE.Group();
//         const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshNormalMaterial({color:0xf0da0f}));
//         cube1.position.x = -1;
//         const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshNormalMaterial({color:0xffda0f}));
//         cube2.position.x = 3;
//         group1.add(cube1);
//         group1.add(cube2);
//         scene.add(group1);

//         const axisHelper = new THREE.AxesHelper()
//         scene.add(axisHelper);

//         boxMesh.scale.set(1,1, 2);

//         const animate = () =>{
            
            
//             boxMesh.rotation.x += 0.01;
//             boxMesh.rotation.y += 0.01;
//             boxMesh.position.x +=0.01;
//             group1.rotation.x +=0.01;
//             camera.lookAt(boxMesh.position);
//             renderer.render( scene, camera );
//             window.requestAnimationFrame( animate );
//         };
//         animate();
//     }, [])

//     return(
//         <div>
//             <canvas id= "myThreeJsCanvas"/>
//         </div>
//     )
// }

// export default Home

import { useEffect } from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"

function Home(){
    let camera, scene, renderer, clock, Left_Shoulder_Joint, Right_Shoulder_Joint; 
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
    Left_Shoulder_Joint.rotation.x = -0.2;
    Left_Shoulder_Joint.rotation.y = -0.1;
    Left_Shoulder_Joint.rotation.z = 0.1;

    Right_Shoulder_Joint = model.getObjectByName( 'mixamorigRightArm' );
    Right_Shoulder_Joint.rotation.x = -0.2;
    Right_Shoulder_Joint.rotation.y = -0.1;
    Right_Shoulder_Joint.rotation.z = 0.1;
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
            Left_Shoulder_Joint.rotation.z += Math.sin( t ) * 0.005;

            if(Right_Shoulder_Joint)
            Right_Shoulder_Joint.rotation.z += Math.sin( t ) * 0.005;
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