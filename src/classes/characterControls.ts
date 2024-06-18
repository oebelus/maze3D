import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export default class characterControls {
    // state
    toggleRun: boolean = true
    currentAction: string

    model: THREE.Group
    mixer: THREE.AnimationMixer
    animationsMap: Map<string, THREE.AnimationAction> = new Map() // walk run idle
    orbitControl: OrbitControls
    camera: THREE.Camera

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

    public update(delta: number, keysPressed: string) {

    }
}