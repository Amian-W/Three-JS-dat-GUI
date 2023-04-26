import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45, //field of view
  window.innerWidth / window.innerHeight, //aspect ratio : width of the element divided by the height
  0.1, //near
  1000 //far
);

// renderer - anti-aliasing
/* const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.physicallyCorrectLights = true
renderer.setSize(width, height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) */

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.physicallyCorrectLights = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight); //the width and height of the area we want to fill with our app
document.body.appendChild(renderer.domElement);

//change scene color
renderer.setClearColor(0xf2f2f2);

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
const geometry = new THREE.BoxGeometry(10, 10, 10); //instance of boxGeometry class
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // a material to color it
const cube = new THREE.Mesh(geometry, material); //fusion of geometry with material to result a mesh = 3D object

scene.add(cube); // add mesh to the scene

console.log(geometry.getAttribute);
//set cube position
cube.position.set(0, 5, 0);

//create a plane
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
//console.log(plane.position)

//Helper object to visualize a Box3.
const box = new THREE.Box3();
box.setFromCenterAndSize(
  new THREE.Vector3(0, 15, 0),
  new THREE.Vector3(30, 30, 30)
);

const helper = new THREE.Box3Helper(box, 0xffff00);
scene.add(helper);

//match the plane to the grid
plane.rotation.x = -0.5 * Math.PI;

//add grid helper
const gridHelper = new THREE.GridHelper(30, 30, "#0f0f0f", "#ffff00");
scene.add(gridHelper);

camera.position.set(-10, 30, 30);
//update everytime we change position of camera
orbit.update();

//gui to change mesh properties
const gui = new dat.GUI();
const options = {
  cubeColor: "#00ff00",
  wireframe: false,
};
//change mesh color
gui.addColor(options, "cubeColor").onChange(function (e) {
  cube.material.color.set(e);
});
//change wireframe
gui.add(options, "wireframe").onChange((e) => {
  cube.material.wireframe = e;
});

//moving object
function setupKeyControls() {
  document.onkeydown = function (e) {
    switch (e.key) {
      case "ArrowRight":
        cube.position.x += 0.1;
        break;
      case "ArrowLeft":
        cube.position.x -= 0.1;
        break;
      case "ArrowUp":
        cube.position.z -= 0.1;
        break;
      case "ArrowDown":
        cube.position.z += 0.1;
        break;
      case "d":
        cube.position.set(0, 5, 0);
        break;
    }
  };
}
 
function animate() {
  requestAnimationFrame(animate);
  setupKeyControls();
  /*  
  rotation animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01; 
  */
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
