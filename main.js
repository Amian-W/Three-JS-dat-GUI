import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";

const r = 40;
const rHalf = r / 2;

//------------------------------------------------------------camera
const camera = new THREE.PerspectiveCamera(
  45, //field of view
  window.innerWidth / window.innerHeight, //aspect ratio : width of the element divided by the height
  0.1, //near
  1000 //far
);
camera.position.set(45, 45, 80);

//------------------------------------------------------------renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas }, { antialias: true }); // renderer - anti-aliasing
renderer.useLegacyLights = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight); //the width and height of the area we want to fill with our app
document.body.appendChild(renderer.domElement);

//------------------------------------------------------------scene
const scene = new THREE.Scene();
//change scene color
renderer.setClearColor(0xededed);

//------------------------------------------------------------light
//add directional light
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-30, 50, -30);
scene.add(light);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.left = -70;
light.shadow.camera.right = 70;
light.shadow.camera.top = 70;
light.shadow.camera.bottom = -70;

//------------------------------------------------------------orbit controls
//listen to DOM events on mouse and update camera position accordingly
const orbit = new OrbitControls(camera, renderer.domElement);
//orbit.maxDistance = 100;
orbit.enableDamping = true;
orbit.panSpeed = 0.5;
orbit.rotationSpeed = 0.5;

//------------------------------------------------------------Box
function createBox() {
  //------box helper
  const helper = new THREE.BoxHelper(
    new THREE.Mesh(new THREE.BoxGeometry(r, r, r))
  );
  helper.material.color.setHex(0x00ff00);
  helper.material.blending = THREE.AdditiveBlending;
  helper.material.transparent = true;
  //helper.material.linewidth = 2; //not working on windows
   
  //------box helper
  let blockPlane = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial({
      color: 0xdbdfea,
      transparent: true,
      opacity: 0.6,
    })
  );
 
  blockPlane.position.set(0, -rHalf - 0.5, 0);
  blockPlane.scale.set(r, 1, r);
  blockPlane.material.transparent = true;
  blockPlane.userData.ground = true;

  //grid
  const grid = new THREE.GridHelper(r, rHalf, "#3C4048", "#B2B2B2");
  grid.translateY(-rHalf);
  
  //axes
  const axes = new THREE.AxesHelper(r);
  axes.translateX(-rHalf - 0.01);
  axes.translateY(-rHalf - 0.01);
  axes.translateZ(-rHalf - 0.01);
  helper.add(axes);

  //floor
  const planeGeometry = new THREE.PlaneGeometry(r, r);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xdbdfea,
    transparent: true,
    opacity: 0.1,
  });
  const floor = new THREE.Mesh(planeGeometry, planeMaterial);
  floor.material.side = THREE.DoubleSide;
  floor.castShadow = true;
  floor.receiveShadow = true;
  floor.rotation.x = -0.5 * Math.PI;
  floor.translateZ(-rHalf);

  const boxGroup = new THREE.Group();
  boxGroup.add(floor,axes,grid,helper,blockPlane);
  boxGroup.name = 'boxGroup';
  console.log(boxGroup);
  scene.add(boxGroup);

}
createBox();

//------------------------------------------------------------Mesh Loader
var loadedMeshes = [];
var loadedMesh;
//STL Loader
const input = document.querySelector("input");
input.addEventListener("change", (event) => {
  const files = event.target.files;
  //console.log(files);
  for (const file of files) {
    // Create a new FileReader object
  const reader = new FileReader();
  // Read the file
  reader.readAsArrayBuffer(file);
  reader.onload = function (event) {
    const contents = event.target.result;
    const loader = new STLLoader();
    const geometry = loader.parse(contents);
    const material = new THREE.MeshPhongMaterial({ color: 0xf9d949 });
    loadedMesh = new THREE.Mesh(geometry, material);
    loadedMesh.name = file.name;
    //console.log(loadedMesh);
    loadedMesh.castShadow = true;
    loadedMesh.receiveShadow = true;
    loadedMesh.layers.enable(1);
    loadedMeshes.push(loadedMesh);
    //console.log(loadedMesh);
    scene.add(loadedMesh);
    loadedMesh.translateY(-rHalf);
    
  }
  };
});

//------------------------------------------------------------Raycasting
//instanciate raycaster
const raycaster = new THREE.Raycaster();
raycaster.layers.set(1);
const pointer = new THREE.Vector2();
var transformControls;
function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointer, camera);

  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(scene.children);

  // if the ray intersects with at least one object
  if (
    intersects.length > 0 &&
    intersects[0].object.name &&
    intersects[0].object.isObject3D
  ) {
    console.log(intersects[0]);
    // remove the transform controls from the previous object
    if (transformControls) {
      transformControls.detach();
      scene.remove(transformControls);
    }

    // create a new transform controls object
    transformControls = new TransformControls(camera, renderer.domElement);
    console.log(transformControls.enabled);
    // set the object to be transformed
    transformControls.attach(intersects[0].object);
    transformControls.getMode("rotate");
    // add the transform controls to the scene
    scene.add(transformControls);

    // disable OrbitControls when the user starts dragging an object
    transformControls.addEventListener("dragging-changed", function (event) {
      orbit.enabled = !event.value;
    });
    window.addEventListener("keydown", function (event){
      if(event.key == 'd'){
        transformControls.detach();
        loadedMeshes.filter(mesh => intersects[0].object = mesh);
        scene.remove(intersects[0].object);
      }
    })
  }
}

//------------------------------------------------------------Cube
/* // create a cube
const geometry = new THREE.BoxGeometry(10, 10, 10, 5, 5, 5); //instance of boxGeometry class
const material = new THREE.MeshBasicMaterial({ color: 0xf9d949 }); // a material to color it
const cube = new THREE.Mesh(geometry, material); //fusion of geometry with material to result a mesh = 3D object
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube); // add mesh to the scene
//set cube position

cube.translateY(-rHalf+5);

//transform controls
//transformControls.attach(cube);
scene.add(transformControls);

//drag controls
const dragControls = new DragControls([cube], camera, renderer.domElement);
dragControls.addEventListener("dragstart", function (event) {
  event.object.material.opacity = 0.33;
});
dragControls.addEventListener("dragend", function (event) {
  event.object.material.opacity = 1;
}); */

//------------------------------------------------------------Dat GUI
//GUI to change mesh properties
/* if (loadedMeshes) {
  const gui = new dat.GUI();
  const loadedMeshFolder = gui.addFolder("loadedMesh");

  //Mesh options
  const meshOptions = {
    Color: loadedMesh.material.color.getHex(), //get the color of the mesh
    wireframe: false,
    scale: 0,
  };

  //change mesh color
  loadedMeshFolder.addColor(meshOptions, "Color").onChange(function (e) {
    loadedMesh.material.color.set(e);
  });
  //change wireframe
  loadedMeshFolder.add(meshOptions, "wireframe").onChange((e) => {
    loadedMesh.material.wireframe = e;
  });
  cubeFolder.open();

  //box dimentions
  const scaleFolder = loadedMeshFolder.addFolder("Scale");
  scaleFolder.add(loadedMesh.scale, "x", 0.1, 3).name("scale X");
  scaleFolder.add(loadedMesh.scale, "y", 0.1, 3).name("scale Y");
  scaleFolder.add(loadedMesh.scale, "z", 0.1, 3).name("scale Z");
  scaleFolder.add(meshOptions, "scale", 0.1, 2.5, 0.1).onChange((e) => {
    loadedMesh.scale.set(e, e, e);
    loadedMesh.position.set(0, 0, 0);
  });
  scaleFolder.open();

  //box rotation
  const rotationFolder = loadedMeshFolder.addFolder("Rotation");
  rotationFolder.add(loadedMesh.rotation, "x", 0, Math.PI).name("rotate X");
  rotationFolder.add(loadedMesh.rotation, "y", 0, Math.PI).name("rotate Y");
  rotationFolder.add(loadedMesh.rotation, "z", 0, Math.PI).name("rotate Z");
  rotationFolder.open();
} */

//------------------------------------------------------------Stats
const stats = new Stats();
document.body.appendChild(stats.dom);

//------------------------------------------------------------Clone Mesh on DBclick
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
  stats.update();
  renderer.render(scene, camera);
  window.addEventListener("click", onPointerMove);
  //setupKeyControls();
  //console.log(camera.position);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
