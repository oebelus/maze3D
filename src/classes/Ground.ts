import * as THREE from 'three'

export default class Ground {
    private plane: THREE.Mesh
    position: THREE.Vector3
    width: number

    constructor(width: number, color: string) {
        this.width = width
        const geometry = new THREE.PlaneGeometry(width, width);
        const material = new THREE.MeshBasicMaterial({ 
            color: color, 
            side: THREE.DoubleSide,
        })
        
        this.plane = new THREE.Mesh(geometry, material)
        this.position = this.plane.position
    }

    draw(scene: THREE.Scene): void {
        this.plane.rotation.x = - Math.PI / 2
        scene.add(this.plane)
    }
}