import * as THREE from 'three'

export default class Wall {
    wall: THREE.Mesh
    private Width: number
    private direction
    position: THREE.Vector3

    constructor(width: number, direction: Direction) {
        this.Width = width
        this.direction = direction

        const geometry = new THREE.PlaneGeometry(width, width/4)
        const texture = new THREE.TextureLoader().load('textures/wall.jpg')
        const material = new THREE.MeshBasicMaterial({ 
            side: THREE.DoubleSide,
            map: texture,
            transparent: true,
        })
        this.wall = new THREE.Mesh(geometry, material)
        this.wall.position.y = 6; 
        this.position = this.wall.position
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