import * as THREE from 'three'
import type { ColorRepresentation } from 'three'
import FontOptimerBold from 'three/examples/fonts/optimer_bold.typeface.json'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

import type { Dataset, Object3D } from './core.type'

export class CoreUtils {
  static getBoundingBox(object: Object3D) {
    // Get the bounding box of the model
    const boundingBox = new THREE.Box3().setFromObject(object)
    const center = boundingBox.getCenter(new THREE.Vector3())
    const size = boundingBox.max.sub(boundingBox.min)

    return [center, size]
  }

  static setPosition(object: Object3D, data: Dataset, ceiling: number) {
    const [center, size] = this.getBoundingBox(object)
    object.position.sub(center)
    object.position.set(
      data.posX + object.position.x,
      ceiling - data.wireLength - size.y + 0.2,
      data.posZ + object.position.z
    )
  }

  static setScale(object: Object3D, n: number) {
    object.scale.set(object.scale.x * n, object.scale.y * n, object.scale.z * n)
  }

  static setRotate(object: Object3D, n: number) {
    object.rotation.set(0, n, 0)
  }

  static createWire(wireLength: number = 10, color: ColorRepresentation = 0xf8fafc) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, wireLength, 0),
      new THREE.Vector3(0, 0, 0)
    ])
    const material = new THREE.LineBasicMaterial({ color, linewidth: 1.5 })

    return new THREE.Line(geometry, material)
  }

  static justifyBetween(input: number, min: number, max: number): number[] {
    if (input === 1) return [(min + max) / 2]

    const totalSpace = max - min
    const gap = totalSpace / (input - 1)
    const positions: number[] = []

    for (let i = 0; i < input; i++) {
      positions.push(min + i * gap)
    }

    return positions
  }

  static createLineWithPoints({
    start = { x: 0, y: 0, z: 0 }, // Start point
    length = 1, // Length of the line
    width = 1, // Line width
    color = 0xa6aebf, // Line color
    rotation = { x: 0, y: 0, z: 0 }, // Rotation
    pointSize = 0.1, // Size of the start and end points
    pointColor = 0xa6aebf, // Color of the points
    message = '0 CM'
  }: any) {
    // Line material and geometry
    const material = new THREE.LineBasicMaterial({ color, linewidth: width })
    const end = { x: start.x + length, y: start.y, z: start.z }
    const points = [new THREE.Vector3(start.x, start.y, start.z), new THREE.Vector3(end.x, end.y, end.z)]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, material)

    // Rotation
    line.rotation.set(rotation.x, rotation.y, rotation.z)

    // Start and End points
    const cubeGeometry = new THREE.BoxGeometry(pointSize, 0, 0.32)
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: pointColor })
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    cube.rotateX(Math.PI / 2)

    const startSphere = cube.clone()
    startSphere.position.set(start.x, start.y, start.z)

    const endSphere = cube.clone()
    endSphere.position.set(end.x, end.y, end.z)

    // Text for line length
    const font = new FontLoader().parse(FontOptimerBold)
    const textGeometry = new TextGeometry(message, {
      font,
      size: 0.4,
      height: 0.02
    })
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, opacity: 0.75 })
    const textMesh = new THREE.Mesh(textGeometry, textMaterial)

    const midpoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
      z: (start.z + end.z) / 2
    }

    // Slightly above the line
    textMesh.position.set(midpoint.x, midpoint.y - 0.6, midpoint.z)

    const group = new THREE.Group()
    group.add(line, startSphere, endSphere, textMesh)

    return group
  }

  static pathToParent(object: THREE.Object3D<THREE.Object3DEventMap>): string | null {
    if (['scene'].indexOf(object.type.toLowerCase()) > -1) return null

    if (object.name.startsWith('.model')) {
      return this.parenthesesExtractor(object.parent!.name)
    } else if (object.parent) {
      return this.pathToParent(object.parent)
    }

    return null
  }

  static parenthesesExtractor(input: string): string | null {
    const match = input.match(/\(([^)]+)\)/)
    return match ? match[1] : null // Return the captured group or null if no match
  }
}
