import * as THREE from 'three'

export default class Wall {
    private wall: THREE.Mesh
    private Width: number
    private direction

    constructor(width: number, direction: Direction, color?: string) {
        this.Width = width
        this.direction = direction

        const geometry = new THREE.PlaneGeometry(width, width/2)
        const material = new THREE.MeshBasicMaterial({ color: color || 'black', side: THREE.DoubleSide})
        this.wall = new THREE.Mesh(geometry, material)
    }
    draw(scene: THREE.Scene) {
       switch (this.direction) {
        case 'right':
            this.wall.position.x = this.Width / 2; 
            this.wall.rotation.y = Math.PI / 2;
            break;

        case 'left':
            this.wall.position.x = -this.Width / 2; 
            this.wall.rotation.y = Math.PI / 2;
            break;

        case 'front':
            this.wall.position.z = this.Width / 2;
            break

        case 'back':
            this.wall.position.z = -this.Width / 2;
            break
       }
       
        scene.add(this.wall)
    }
}

// RIGHT: this.wall.position.x = this.Width / 2 ; this.wall.rotation.y = Math.PI / 2 ; W W
// LEFT: this.wall.position.x = -this.Width / 2 ; this.wall.rotation.y = Math.PI / 2 ; W W

// FORWARD: this.wall.position.z = this.Width*2 W W
// BACKWARDS: this.wall.position.z = -this.Width/2 W W