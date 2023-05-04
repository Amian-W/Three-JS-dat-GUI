import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45, //field of view
  window.innerWidth / window.innerHeight, //aspect ratio : width of the element divided by the height
  0.1, //near
  1000 //far
);

// visualizes the frustum of a camera using a LineSegments
/* const cameraHelper = new THREE.CameraHelper( camera );
scene.add( cameraHelper ); */

const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas }, { antialias: true }); // renderer - anti-aliasing
renderer.useLegacyLights = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight); //the width and height of the area we want to fill with our app
document.body.appendChild(renderer.domElement);

//Load a STL Model
const input = document.querySelector("input");
input.addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const contents = event.target.result;
    const loader = new STLLoader();
    const geometry = loader.parse(contents);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const loadedMesh = new THREE.Mesh(geometry, material);
    scene.add(loadedMesh);
  };

  reader.readAsArrayBuffer(file);
});

//change scene color
renderer.setClearColor(0xffead2);

//display axes helper
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

//listen to DOM events on mouse and update camera position accordingly
const orbit = new OrbitControls(camera, renderer.domElement);

//PointLight
const light = new THREE.DirectionalLight(0xff0000, 20, 100);
light.position.set(50, 50, 50);
scene.add(light);

// create a cube
const geometry = new THREE.BoxGeometry(10, 10, 10, 5, 5, 5); //instance of boxGeometry class
const material = new THREE.MeshBasicMaterial({ color: 0x8294c4 }); // a material to color it
const cube = new THREE.Mesh(geometry, material); //fusion of geometry with material to result a mesh = 3D object

scene.add(cube); // add mesh to the scene

//set cube position
cube.position.set(0, 5, 0);

const controls = new TransformControls(camera, renderer.domElement);
controls.attach(cube);
scene.add(controls)

//create a plane
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xF2F2F2 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
//console.log(plane.position)

//Helper object to visualize a Box3.
const box = new THREE.Box3();
box.setFromCenterAndSize(
  new THREE.Vector3(0, 15, 0),
  new THREE.Vector3(30, 30, 30)
);

const boxHelper = new THREE.Box3Helper(box, 0x000000);
scene.add(boxHelper);

//match the plane to the grid
plane.rotation.x = -0.5 * Math.PI;

//add grid helper
const gridHelper = new THREE.GridHelper(30, 30, "#0f0f0f", "#DBDFEA");
scene.add(gridHelper);

camera.position.set(-10, 30, 30);
//update everytime we change position of camera
orbit.update();

//GUI to change mesh properties
const gui = new dat.GUI();
const cubeFolder = gui.addFolder("Mesh");
const boxFolder = gui.addFolder("Box");
//Mesh options
const meshOptions = {
  Color: cube.material.color.getHex(), //get the color of the mesh
  wireframe: false,
  scale: 0,
};
//box options
const boxOptions = {
  Color: boxHelper.material.color.getHex(), //get the color of the boxHelper
};
//change mesh color
cubeFolder.addColor(meshOptions, "Color").onChange(function (e) {
  cube.material.color.set(e);
});
//change wireframe
cubeFolder.add(meshOptions, "wireframe").onChange((e) => {
  cube.material.wireframe = e;
});
cubeFolder.open();

//Change Box color
boxFolder.addColor(boxOptions, "Color").onChange((e) => {
  boxHelper.material.color.set(e);
});

//box dimentions
const scaleFolder = cubeFolder.addFolder("Scale");
scaleFolder.add(cube.scale, "x", 0.1, 3).name("scale X");
scaleFolder.add(cube.scale, "y", 0.1, 3).name("scale Y");
scaleFolder.add(cube.scale, "z", 0.1, 3).name("scale Z");
scaleFolder.add(meshOptions, "scale", 0.1, 2.5, 0.1).onChange((e) => {
  cube.scale.set(e, e, e);
  cube.position.set(0, 0, 0);
});
scaleFolder.open();

//box rotation
const rotationFolder = cubeFolder.addFolder("Rotation");
rotationFolder.add(cube.rotation, "x", 0, Math.PI).name("rotate X");
rotationFolder.add(cube.rotation, "y", 0, Math.PI).name("rotate Y");
rotationFolder.add(cube.rotation, "z", 0, Math.PI).name("rotate Z");
rotationFolder.open();

const stats = new Stats();
document.body.appendChild(stats.dom);

//moving object using keyboard events
/* function setupKeyControls() {
  document.onkeydown = function (e) {
    switch (e.key) {
      case "ArrowRight":
        cube.position.x += 0.5;
        break;
      case "ArrowLeft":
        cube.position.x -= 0.5;
        break;
      case "ArrowUp":
        cube.position.z -= 0.5;
        break;
      case "ArrowDown":
        cube.position.z += 0.5;
        break;
      case "u":
        cube.position.y += 0.5;
        break;
      case "d":
        cube.position.y -= 0.5;
        break;
      case "r":
        cube.position.set(0, 5, 0);
        cube.rotation.set(0, 0, 0);
        break;
    }
  };
} */

function onDoubleClick() {
  document.ondblclick = (e) => {
    // Clone the original mesh
    const clonedMesh = cube.clone();
    const cloneGap = 0.1; //gap
    let clonePosition = cube.position.clone().add(
      new THREE.Vector3(cloneGap, 0, 0) // Adjust x, y, and z coordinates as needed
    );

    // Set the final position of the cloned mesh
    clonedMesh.position.copy(clonePosition);

    // Set the position of the cloned mesh to a random location
    clonedMesh.position.set(
      Math.random() * 10 - 5, // x-coordinate
      Math.random() * 10 - 5, // y-coordinate
      Math.random() * 10 - 5 // z-coordinate
    );

    // Add the cloned mesh to the scene
    scene.add(clonedMesh);
  };
}

function animate() {
  requestAnimationFrame(animate);
  //setupKeyControls();
  onDoubleClick();

  /*  
  rotation animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01; 
  */
  stats.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
