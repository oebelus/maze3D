import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { A, D, DIRECTIONS, S, W } from '../utils'

export default class CharacterControls {
    model: THREE.Group
    mixer: THREE.AnimationMixer
    animationsMap: Map<string, THREE.AnimationAction> = new Map() // walk run idle
    orbitControl: OrbitControls
    camera: THREE.Camera

    // state
    toggleRun: boolean = false
    currentAction: string

    // Data
    walkDirection = new THREE.Vector3();
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuaternion: THREE.Quaternion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();

    // Constants
    fadeDureation = 0.2
    runVelocity = 10
    walkVelocity = 5

    constructor(model: THREE.Group, mixer: THREE.AnimationMixer, animationsMap: Map<string, THREE.AnimationAction> = new Map(), orbitControl: OrbitControls, camera: THREE.Camera, currentAction: string) {
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.animationsMap.forEach((value, key) => {
            if (key == currentAction)
                value.play()
        })
        this.orbitControl = orbitControl
        this.camera = camera
    }

    public switchToggle() {
        this.toggleRun = !this.toggleRun
    }

    public update(delta: number, keysPressed: { [key: string]: boolean; }) {
        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true)

        let play = '';
        if (directionPressed && this.toggleRun) {
            play = 'Running'
        }
        else if (directionPressed) {
            play = 'Walking'
        } else if (keysPressed[' '] == true) {
            play = 'Jump'
        }
        else {
            play = 'Idle'
        }
        
        if (this.currentAction != play) {
            const toPlay = this.animationsMap.get(play)
            const current = this.animationsMap.get(this.currentAction)

            current?.fadeOut(this.fadeDureation)
            toPlay?.reset().fadeIn(this.fadeDureation).play()

            this.currentAction = play
        }

        this.mixer.update(delta)

        if (this.currentAction == 'Running' || this.currentAction == 'Walking') {
            // direction = destination - source
            var cameraAngle = Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)
            )

            // diagonal movement angle offset 
            let directionOffset = this.directionOffset(keysPressed)

            // rotate model
            this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, cameraAngle + directionOffset)
            this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2)

            // calculate direction
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

            // movement velocity
            const velocity = this.currentAction == 'Running' ? this.runVelocity : this.walkVelocity

            // move model and camera
            const moveX = this.walkDirection.x * velocity * delta
            const moveZ = this.walkDirection.z * velocity * delta
            this.model.position.x -= moveX
            this.model.position.z -= moveZ

            this.updateCameraTarget(moveX, moveZ)
        }
    }

    private updateCameraTarget(moveX: number, moveZ: number) {
        this.camera.position.x -= moveX
        this.camera.position.z -= moveZ

        this.cameraTarget.x = this.model.position.x
        this.cameraTarget.y = this.model.position.y
        this.cameraTarget.z = this.model.position.z

        this.orbitControl.target = this.cameraTarget
    }

    private directionOffset(keysPressed: { [key: string]: boolean; }) {
        var directionOffset = 0

        if (keysPressed[W]) {
            if (keysPressed[A]) {
                directionOffset = - 3 * Math.PI / 4
            } else if (keysPressed[D]) {
                directionOffset = 3 * Math.PI / 4
            } else {
                directionOffset = Math.PI
            }
        } else if (keysPressed[S]) {
            if (keysPressed[A]) {
                directionOffset = - Math.PI / 4
            } else if (keysPressed[D]) {
                directionOffset = Math.PI / 4
            }
        } else if (keysPressed[A]) {
            directionOffset = - Math.PI / 2
        } else if (keysPressed[D]) {
            directionOffset = Math.PI / 2
        }

        return directionOffset
    }
}