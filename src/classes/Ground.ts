import * as THREE from 'three'

export default class Ground {
    private plane: THREE.Mesh

    constructor(width: number, color: string) {
        const geometry = new THREE.PlaneGeometry(width, width);
        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide})
        
        this.plane = new THREE.Mesh(geometry, material)
    }

    draw(scene: THREE.Scene): void {
        this.plane.rotation.x = - Math.PI / 2
        console.log(this.plane.position.x, this.plane)
        scene.add(this.plane)
    }
}