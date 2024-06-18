import './style.css';
import * as THREE from 'three';
import Ground from './classes/Ground';
import { OrbitControls, GLTFLoader } from 'three/examples/jsm/Addons.js';

let camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.Renderer, model: THREE.Object3D<THREE.Object3DEventMap> | THREE.AnimationObjectGroup, mixer: THREE.AnimationMixer, walkAction: THREE.AnimationAction, idleAction: THREE.AnimationAction;
const clock = new THREE.Clock();

const width = window.innerWidth;
const height = window.innerHeight;

const states = [ 'Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing' ];
const emotes = [ 'Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp' ];

scene = new THREE.Scene();
scene.background = new THREE.Color( 'silver' );
scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 2.5 );
light.position.set( 0.5, 1, 0.75 );
scene.add( light );

camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.y = 5
camera.position.z = 55
camera.position.x = 0

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

// Model

const loader = new GLTFLoader();
loader.load('models/RobotExpressive.glb', (gltf) => {
  model = gltf.scene
  scene.add(model)

  mixer = new THREE.AnimationMixer(model)

  gltf.animations.forEach((clip) => {
    const action = mixer.clipAction(clip)
     
    if (clip.name === 'Idle') {
      idleAction = action
      idleAction.play()
    } else if (clip.name === 'Walking') {
      walkAction = action
    }
  })

}, undefined, (e) => console.error(e))

const ground = new Ground(2000, 'white')
ground.draw(scene)

const grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add( grid );

// Keys

const keysPressed = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false }

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    keysPressed[event.key] = true;
    console.log(keysPressed)
    if (idleAction && !walkAction.isRunning()) {
      idleAction.stop();
      walkAction.play();
    }
  }
}, false)

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    keysPressed[event.key] = false;
    if (idleAction && !Object.values(keysPressed).includes(true)) {
      walkAction.stop();
      idleAction.play();
    }
  }
}, false)

// Animate 

function animate() {
  requestAnimationFrame( animate );

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta)

    if (model) {
      if (keysPressed['ArrowRight']) {
        (model as THREE.Object3D<THREE.Object3DEventMap>).rotation.y = 2; 
        (model as THREE.Object3D<THREE.Object3DEventMap>).position.x += 0.025;
      } else if (keysPressed['ArrowLeft']) {
        (model as THREE.Object3D<THREE.Object3DEventMap>).rotation.y = -1;
        (model as THREE.Object3D<THREE.Object3DEventMap>).position.x -= 0.025;
      } else if (keysPressed['ArrowUp']) {
        (model as THREE.Object3D<THREE.Object3DEventMap>).rotation.y = Math.PI;
        (model as THREE.Object3D<THREE.Object3DEventMap>).position.z -= 0.025;
      } else if (keysPressed['ArrowDown']) {
        (model as THREE.Object3D<THREE.Object3DEventMap>).rotation.y = 0;
        (model as THREE.Object3D<THREE.Object3DEventMap>).position.z += 0.025;
      }
    }

  renderer.render(scene, camera);
}

animate();