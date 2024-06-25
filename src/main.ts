import './style.css';
import * as THREE from 'three';
import Ground from './classes/Ground';
import { OrbitControls, GLTFLoader } from 'three/examples/jsm/Addons.js';
import CharacterControls from './classes/CharacterControls';
import Wall from './classes/Wall';

let camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.Renderer, model: THREE.Group | THREE.AnimationObjectGroup, mixer: THREE.AnimationMixer, raycaster: THREE.Raycaster;
const clock = new THREE.Clock();

const width = window.innerWidth;
const height = window.innerHeight;

/*
const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];
*/ 

scene = new THREE.Scene();
scene.background = new THREE.Color( 'silver' );
scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 2.5 );
light.position.set( 0.5, 1, 0.75 );
scene.add( light );

camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
camera.position.y = 20
camera.position.z = 100
camera.position.x = 0
camera.lookAt( 0, 1, 0 );

renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

document.body.appendChild(renderer.domElement)

// Controls

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 15;
controls.enablePan = false
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.update()

// Background

const groundWidth = 50

const ground = new Ground(groundWidth, 'white')
const leftWall = new Wall(groundWidth, 'left')
leftWall.wall.name = 'left'

const rightWall = new Wall(groundWidth, 'right')
rightWall.wall.name = 'right'

const frontWall = new Wall(groundWidth, 'front')
frontWall.wall.name = 'front'

const backWall = new Wall(groundWidth, 'back')
backWall.wall.name = 'back'

const walls:THREE.Object3D<THREE.Object3DEventMap>[] =  [leftWall.wall, rightWall.wall, frontWall.wall, backWall.wall]

ground.draw(scene)
leftWall.draw(scene)
rightWall.draw(scene)
frontWall.draw(scene)
backWall.draw(scene)

const grid = new THREE.GridHelper( groundWidth, groundWidth, 0x000000, 0x000000 );
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add( grid );

// Model

let characterControls: CharacterControls; 

const loader = new GLTFLoader();
loader.load('models/RobotExpressive.glb', (gltf) => {
  model = gltf.scene
  scene.add(model)

  const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  mixer = new THREE.AnimationMixer(model)
  const animationMap: Map<string, THREE.AnimationAction> = new Map();

  gltfAnimations.forEach((a: THREE.AnimationClip) => {
    animationMap.set(a.name, mixer.clipAction(a))
  })

  characterControls = new CharacterControls(model, mixer, animationMap, controls, camera, 'Idle', walls)
})

// Keys

let keysPressed: {[key: string]: boolean} = {}

document.addEventListener('keydown', (event) => {
  if (event.shiftKey && characterControls) {
    characterControls.switchToggle()
  } else {
    keysPressed[event.key] = true
  }
}, false)

document.addEventListener('keyup', (event) => {
  keysPressed[event.key] = false
}, false)

// Animate 
raycaster = new THREE.Raycaster()

function animate() {
  requestAnimationFrame( animate );

  const delta = clock.getDelta();

  if (characterControls) {
    characterControls.update(delta, keysPressed, ground, raycaster)
  }

  renderer.render(scene, camera);
}

animate();