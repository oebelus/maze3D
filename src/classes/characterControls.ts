import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { A, D, DIRECTIONS, S, W } from '../utils'
import Ground from './Ground'
import Wall from './Wall'

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

    public update(delta: number, keysPressed: { [key: string]: boolean; }, ground: Ground, walls: Wall[]) {
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
        else if (this.model.position.x > 23 || this.model.position.x < -23) {
        } else {
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

        const edge = ground.width / 2 - 2

        if ((this.currentAction == 'Running' || this.currentAction == 'Walking')) {// direction = destination - source
            if (this.model.position.x <= edge && this.model.position.x >= - edge && this.model.position.z <= edge && this.model.position.z >= - edge) {
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

                // console.log('WALLS', walls[2].position.z / 2, this.cameraTarget.z)
                // if (walls[2].position.z / 2 < this.cameraTarget.z) {
                //     walls[2].wall.material.opacity = 0
                // }

                if (this.cameraTarget.x < edge && this.cameraTarget.x > -edge && this.cameraTarget.z < edge && this.cameraTarget.z > -edge)
                    this.updateCameraTarget(moveX, moveZ)
                else if (this.cameraTarget.x < edge && this.cameraTarget.x > -edge && (this.cameraTarget.z >= edge || this.cameraTarget.z <= -edge))
                    this.updateCameraTarget(moveX, 0)
                else if ((this.cameraTarget.x >= edge || this.cameraTarget.x <= -edge) && (this.cameraTarget.z < edge && this.cameraTarget.z > -edge))
                    this.updateCameraTarget(0, moveZ)
                else
                    this.updateCameraTarget(0, 0)
            }
            else {
                if (this.model.position.x >= edge || this.model.position.x <= - edge) {
                    const currentPosition = this.model.position.x
                    this.model.position.x = currentPosition > 0 ? edge : -edge

                    this.updateCameraTarget(0, 0)
                }
                if (this.model.position.z >= edge || this.model.position.z <= - edge) {
                    const currentPosition = this.model.position.z
                    this.model.position.z = currentPosition > 0 ? edge : -edge

                    this.updateCameraTarget(0, 0)
                }
            }
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