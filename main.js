import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import Stats from "three/examples/jsm/libs/stats.module";

const r = 40;
const rHalf = r / 2;
var loadedMeshes = [];
var loadedMesh;
var transformControlsMode = "translate";
const w = "px";
const h = "2px";
//------------------------------------------------------------camera
const camera = new THREE.PerspectiveCamera(
  45, //field of view
  window.innerWidth / window.innerHeight, //aspect ratio : width of the element divided by the height
  0.1, //near
  100000 //far
);
camera.position.set(45, 45, 80);

//------------------------------------------------------------renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas }, { antialias: true }); // renderer - anti-aliasing
//renderer.useLegacyLights = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight); //the width and height of the area we want to fill with our app
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);
renderer.gammaFactor = 2.2;
//renderer.physicallyCorrectLights = true; // Enable physically correct lighting

//------------------------------------------------------------scene
const scene = new THREE.Scene();
//change scene color
renderer.setClearColor(0xd0d0d0);

//------------------------------------------------------------Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

//------------------------------------------------------------Directional lights
//add directional lights
let lightOne = new THREE.DirectionalLight(0xffffff, 0.4);
lightOne.position.set(30, 50, 30);
scene.add(lightOne);
lightOne.castShadow = true;
lightOne.shadow.mapSize.width = 512;
lightOne.shadow.mapSize.height = 512;
lightOne.shadow.camera.left = -70;
lightOne.shadow.camera.right = 70;
lightOne.shadow.camera.top = 70;
lightOne.shadow.camera.bottom = -70;

let lightTwo = new THREE.DirectionalLight(0xffffff, 0.3);
lightTwo.position.set(-30, -50, -30);
scene.add(lightTwo);
//lightTwo.castShadow = true;
lightTwo.shadow.mapSize.width = 512;
lightTwo.shadow.mapSize.height = 512;
lightTwo.shadow.camera.left = 70;
lightTwo.shadow.camera.right = -70;
lightTwo.shadow.camera.top = -70;
lightTwo.shadow.camera.bottom = 70;

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
  helper.material.color.setHex(0xffffff);
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
  const grid = new THREE.GridHelper(r, rHalf, "#B2B2B2", "#B2B2B2");
  grid.DoubleSide = false;
  grid.translateY(-rHalf);
  // Create a nested grid helper
  const nestedGridHelper = new THREE.GridHelper(r, 80, 0x141414, 0xf6f6f6);
  // Move the nested grid helper below the main grid helper
  nestedGridHelper.position.set(0, -0.01, 0);
  // Add the nested grid helper as a child of the main grid helper
  grid.add(nestedGridHelper);

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
    opacity: 0.5,
  });
  const floor = new THREE.Mesh(planeGeometry, planeMaterial);
  floor.material.side = THREE.DoubleSide;
  floor.castShadow = true;
  floor.receiveShadow = true;
  floor.rotation.x = -0.5 * Math.PI;
  floor.translateZ(-rHalf);

  const boxGroup = new THREE.Group();
  boxGroup.add(floor, axes, grid, helper, blockPlane);
  boxGroup.name = "boxGroup";
  boxGroup.receiveShadow = true;

  scene.add(boxGroup);
  console.log(scene.children);
}
createBox();

//------------------------------------------------------------Mesh Loader

//STL Loader
const fileInput = document.getElementById("file");
fileInput.addEventListener("change", (event) => {
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
      const material = new THREE.MeshPhysicalMaterial({ color: 0xf9d949 });
      loadedMesh = new THREE.Mesh(geometry, material);
      loadedMesh.name = file.name;
      loadedMesh.castShadow = true;
      loadedMesh.receiveShadow = true;
      loadedMesh.layers.enable(1);

      const boundingBox = new THREE.Box3();
      boundingBox.setFromObject(loadedMesh);

      /* let center = new THREE.Vector3
      boundingBox.getCenter(center)

      let castPoint = center.clone()
      castPoint.y = box.min.y
 */
      console.log(boundingBox);
      //create a bounding box
      /* const boundingB = new THREE.Box3(
        new THREE.Vector3(),
        new THREE.Vector3()
      );
      boundingB.setFromObject(loadedMesh);
      const size = new THREE.Vector3();
      boundingB.getSize(size);
      loadedMesh.position.y = -rHalf - size.y/2; */
      loadedMeshes.push(loadedMesh);
      console.log(loadedMesh);
      console.log(loadedMeshes);
    };
  }
});

//------------------------------------------------------------Get Transform controls Mode

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
    //console.log(intersects[0]);
    // remove the transform controls from the previous object
    if (transformControls) {
      transformControls.detach();
      scene.remove(transformControls);
    }

    // create a new transform controls object
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode(transformControlsMode); // or "rotate" or "scale"

    // Enable the controls
    transformControls.enabled = true;

    // set the object to be transformed
    transformControls.attach(intersects[0].object);
    transformControls.getMode("rotate");
    // add the transform controls to the scene
    scene.add(transformControls);

    // disable OrbitControls when the user starts dragging an object
    transformControls.addEventListener("dragging-changed", function (event) {
      orbit.enabled = !event.value;
    });

    document.addEventListener("keyup", function (event) {
      if (event.key === "Backspace") {
        console.log(intersects[0].object);
        loadedMeshes.splice(loadedMeshes.indexOf(intersects[0].object), 1);
        scene.remove(intersects[0].object);
        transformControls.detach();
        console.log(loadedMeshes);
      }
    });
  } else {
    if (transformControls) {
      transformControls.detach();
      scene.remove(transformControls);
    }
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
/* const stats = new Stats();
document.body.appendChild(stats.dom); */

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

//------------------------------------------------------------Resize window
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//------------------------------------------------------------Animate
function animate() {
  requestAnimationFrame(animate);
  /* stats.update(); */
  renderer.render(scene, camera);
  window.addEventListener("click", onPointerMove);
  loadedMeshes.forEach((object) => {
    /* const boundingB = object.geometry.boundingBox;
    //console.log(boundingB);
    boundingB.copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld); */
    scene.add(object);
  });
  const modeInput = document.getElementById("mode");
  modeInput.addEventListener("change", (event) => {
    transformControlsMode = event.target.value;
  });
  //setupKeyControls();
  //console.log(camera.position);
}

animate();

/* For Material PLA 
Formula (Dh): ( Length(mm) * Width(mm) * Height(mm) * 0,0005 )   + 8
For Material ABS 
Formula (Dh): ( Length(mm) * Width(mm) * Height(mm) * 0,0006 )   + 10 */
