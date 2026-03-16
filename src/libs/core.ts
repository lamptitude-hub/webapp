import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

import { CanopyType } from '@/constants'
import { isDevelop } from '@/constants/configs'
import type { Canopy, Item } from '@/types/schema'
import { s3Prefix as baseUrl, roundUpTo } from '@/utils'

import type { Dataset, State, TableData, UpdateClusterValues } from './core.type'
import { CoreUtils } from './core.utils'

type ResCluster = { group: THREE.Group<THREE.Object3DEventMap>; data: Dataset } | void

export class Core3D {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer

  private controls: OrbitControls

  private utils = CoreUtils

  private conf = {
    width: 1920,
    height: 1080,
    ratio: 10,
    offsetTop: 0,
    offsetLeft: 0,
    useGridHelper: isDevelop,
    environmentTextureUrl: `${location.origin}/static/media/studio_small_08_4k.hdr`
  }

  public state!: State

  private canopy?: Canopy
  private items?: Item[]

  private caching: Record<string, THREE.Object3D> = {}

  constructor(canvas: HTMLCanvasElement) {
    const { height: screenHeight } = document.body.getBoundingClientRect()
    this.conf.width = canvas.clientWidth
    this.conf.height = canvas.clientHeight
    this.conf.offsetTop = screenHeight - this.conf.height

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, this.conf.width / this.conf.height)

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.conf.width, this.conf.height)
    this.renderer.setClearColor(0xffffff, 0.92)
    this.renderer.shadowMap.enabled = true
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.025
    this.controls.minDistance = 5 // Set minimum zoom-in distance
    this.controls.maxDistance = 200 // // Set maximum zoom-out distance
    // this.controls.minPolarAngle = Math.PI * 0.32 // Limit downward rotation (set radians for the angle)
    // this.controls.maxPolarAngle = Math.PI * 0.48 // Limit upward rotation (set radians for the angle)
    this.controls.zoomSpeed = Math.PI / 3.2
    this.controls.panSpeed = Math.PI / 7.2
    this.controls.rotateSpeed = Math.PI / 7.2

    // Disable horizontal panning
    this.controls.addEventListener('change', () => {
      this.controls.target.x = 0 // Restrict target's x-axis movement
      this.controls.target.z = 0 // Restrict target's z-axis movement
    })
  }

  public async run(state: State, canopy: Canopy, items: Item[]) {
    this.state = state
    this.canopy = canopy
    this.items = items

    const texture = await this.loadAsync<THREE.DataTexture>(this.conf.environmentTextureUrl)
    this.scene.environment = texture

    this.addGridHelper()
    this.addRoomLight()
    await this.createCanopy()

    const clusters: THREE.Group<THREE.Object3DEventMap>[] = []
    for await (const data of this.state.dataset) {
      const result = await this.createCluster(data)
      if (result) {
        clusters.push(result.group)
        this.updateDatasetBy(data.uuid, result.data)
      }
    }

    this.scene.add(...clusters)

    this.createHumanSilhouette()

    if (this.state.table?.isActive) this.createTable()

    if (WebGL.isWebGLAvailable()) {
      const animationMixer = (mixer?: THREE.AnimationMixer) => {
        requestAnimationFrame(() => animationMixer(mixer))

        if (mixer) {
          const clock = new THREE.Clock()
          mixer.update(clock.getDelta())
        }

        this.controls.update()
        this.renderer.render(this.scene, this.camera)
      }

      animationMixer()
      this.resetPerspectiveCamera()
    } else {
      const warnNode = WebGL.getWebGLErrorMessage()
      document.body.appendChild(warnNode)
    }

    return Promise.resolve(this)
  }

  public getState() {
    return this.state
  }

  public setState(state: State) {
    this.state = state
  }

  public getClusterHeight() {
    const models = this.getObjectModels()
    const minY = Math.min(...models.map(({ position }) => position.y))

    return this.state.ceiling - Math.floor(minY * this.conf.ratio)
  }

  public useHitDetection(cb: (bool: boolean) => void) {
    const items = this.items?.filter((r) => r.useIntersectObject)
    if (!items?.length) return void 0

    const groups = this.scene.children.filter(({ name }) => name.startsWith('.clusterGroup'))
    const models: THREE.Object3D[] = []
    for (const group of groups) {
      const model = group.children.find(({ name }) => items.some(({ id }) => name.includes(id)))
      if (model) models.push(model)
    }

    const selected: Record<string, THREE.Object3D> = {}

    // Check for overlaps using raycasting
    for (const objectA of models) {
      const current = new THREE.Box3().setFromObject(objectA, true)

      for (const objectB of models) {
        if (objectB.uuid === objectA.uuid) continue

        const target = new THREE.Box3().setFromObject(objectB, true)
        if (current.intersectsBox(target)) {
          selected[objectA.uuid] = objectA
          selected[objectB.uuid] = objectB
        }
      }
    }

    const spheres = this.scene.children.filter((r) => r.name.startsWith(`.sphere-overlap`))
    if (spheres.length) this.scene.remove(...spheres)

    if (Object.keys(selected).length) {
      const createSphere = (uuid: string, position: THREE.Vector3) => {
        const geometry = new THREE.SphereGeometry(0.25)
        const material = new THREE.MeshBasicMaterial({ color: 0xd84040 })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.name = `.sphere-overlap(${uuid})`
        sphere.position.set(position.x, position.y - 1.25, position.z)

        this.scene.add(sphere)
      }

      for (const obj of Object.values(selected)) {
        createSphere(obj.uuid, obj.position)
      }

      cb(true)
    } else {
      cb(false)
    }
  }

  public addClickListener(cb?: (data: Dataset) => void) {
    if (!cb) return void 0

    document.addEventListener(
      'click',
      ({ clientX, clientY, target }) => {
        if (target instanceof HTMLCanvasElement && target.classList.contains('three-js')) {
          const mouse = new THREE.Vector2()
          const raycaster = new THREE.Raycaster()

          // Get the mouse coordinates normalized between -1 and 1
          mouse.x = (clientX / this.conf.width) * 2 - 1
          mouse.y = -((clientY - (this.conf.offsetTop - window.scrollY)) / this.conf.height) * 2 + 1

          raycaster.setFromCamera(mouse, this.camera)

          const intersects = raycaster.intersectObjects(this.scene.children, true)
          if (intersects.length) {
            for (const intersect of intersects) {
              const uuid = this.utils.pathToParent(intersect.object)
              if (uuid) {
                const data = this.state.dataset.find((r) => r.uuid === uuid)!
                cb(data)

                break
              }
            }
          }
        }
      },
      false
    )
  }

  public resetPerspectiveCamera(camFov: number = 2) {
    // Calculate the bounding box of the entire scene
    const box = new THREE.Box3().setFromObject(this.scene)

    // Get the center and size of the bounding box
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    // Determine the maximum dimension of the bounding box
    const maxDimension = Math.max(size.x, size.y, size.z)

    // Set the camera position
    const distance = maxDimension * 1.5 // Adjust factor as needed
    this.camera.position.set(center.x, center.y, center.z + distance)

    // Make the camera look at the center of the bounding box
    this.camera.lookAt(center)

    // Adjust camera FOV for PerspectiveCamera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      const fov = camFov * Math.atan(maxDimension / (2 * distance)) * (180 / Math.PI)
      this.camera.fov = this.state.ceiling < 360 ? fov - 6 : fov + 2
      this.camera.updateProjectionMatrix()
    }

    // Adjust OrthographicCamera (if used)
    if (this.camera instanceof THREE.OrthographicCamera) {
      this.camera.left = -size.x / 2
      this.camera.right = size.x / 2
      this.camera.top = size.y / 2
      this.camera.bottom = -size.y / 2
      this.camera.near = 0
      this.camera.far = size.z * 2 // Adjust far plane distance
      this.camera.updateProjectionMatrix()
    }

    // Update controls target (if using OrbitControls)
    if (this.controls) {
      this.controls.target.copy(center)
      this.controls.update()
    }
  }

  private addGridHelper() {
    const gridHelperFloor = new THREE.GridHelper(50, 50, 0xdddddd, 0xeeeeee)
    gridHelperFloor.name = '.gridHelper(Floor)'
    gridHelperFloor.traverse((child) => {
      child.visible = this.conf.useGridHelper
    })

    const gridHelperCeiling = gridHelperFloor.clone()
    gridHelperCeiling.name = '.gridHelper(Ceiling)'
    gridHelperCeiling.position.setY(this.state.ceiling / this.conf.ratio)

    this.scene.add(gridHelperFloor, gridHelperCeiling)
  }

  private addRoomLight() {
    const light = new THREE.AmbientLight()
    light.name = 'Ambient Light'

    this.scene.add(light)
  }

  private async createCanopy() {
    if (!this.canopy) return void 0

    const canopyColor = (this.state?.canopyColor || 'white').toUpperCase()
    const canopyData = this.canopy.dataset.find((r) => r.color.toUpperCase() === canopyColor)

    if (canopyData) {
      const canopy = await this.loadAsync<THREE.Object3D>(baseUrl(canopyData.model))
      canopy.name = `.canopy(${this.canopy.name})`

      if (canopyData.upScaling) {
        this.utils.setScale(canopy, canopyData.upScaling / this.conf.ratio)
      }

      const [canopyCenter, canopySize] = this.utils.getBoundingBox(canopy)
      canopy.position.sub(canopyCenter)

      if (this.canopy.type === CanopyType.MULTI) {
        canopy.position.setY(this.state.ceiling / this.conf.ratio - canopySize.y / 3)
        this.scene.add(canopy)
      }

      const isLinear = this.canopy.name.toUpperCase().includes('SPBA-LINEAR')
      if (isLinear && this.state?.bulbs && this.state?.presetId && [5, 6].indexOf(this.state.presetId) > -1) {
        const sizeX = (canopySize.x - 1.5) / 2

        let dataset = this.state.dataset.slice(0, this.state.bulbs)
        if (this.state.bulbs > 1) {
          let start = -sizeX
          let end = sizeX
          let spaceBetween = this.utils.justifyBetween(this.state.bulbs, start, end)

          dataset = dataset.map((r, index) => ({ ...r, posX: spaceBetween[index] }))
        }

        this.state.dataset = dataset
      }
    }
  }

  private async createCluster(data: Dataset): Promise<ResCluster> {
    const item = this.items?.find((item) => item.id === data?.itemId)

    if (!item?.object3D) return void 0

    const group = new THREE.Group()
    group.name = `.clusterGroup(${data.uuid})`

    // Lamp model.
    const model = await this.loadAsync<THREE.Object3D>(item.object3D)
    model.name = `.model(${item?.name || 'name'} - ${item.id}/${data.uuid})`

    this.utils.setScale(model, this.conf.ratio)
    if (data.rotation) {
      this.utils.setRotate(model, data.rotation)
    }

    const [center, size] = this.utils.getBoundingBox(model)
    data.modelSize = {
      x: Math.round(size.x * this.conf.ratio),
      y: Math.round(size.y * this.conf.ratio)
    }
    data.maxWireLength = this.state.ceiling - roundUpTo(data.modelSize.y, 5)
    data.maxWireLength -= this.state.table?.isActive ? this.state.table.height + 10 : 10
    data.wireLength = Math.max(10, Math.min(data.wireLength, data.maxWireLength))

    model.position.sub(center)
    model.position.setX(data.posX + model.position.x)
    model.position.setY((this.state.ceiling - data.wireLength) / this.conf.ratio - size.y + 0.128)
    model.position.setZ(data.posZ + model.position.z)
    group.add(model)

    // Wire.
    const wire = this.utils.createWire(data.wireLength / this.conf.ratio)
    wire.name = `.wire(${data.wireLength} - ${data.uuid})`
    wire.position.setX(data.posX)
    wire.position.setY((this.state.ceiling - data.wireLength) / this.conf.ratio)
    wire.position.setZ(data.posZ)
    group.add(wire)

    if (this.canopy?.type === CanopyType.SINGLE) {
      const canopyColor = (this.state?.canopyColor || 'white').toUpperCase()
      const canopyData = this.canopy.dataset.find((r) => r.color.toUpperCase() === canopyColor)

      if (canopyData) {
        const canopy = await this.loadAsync<THREE.Object3D>(baseUrl(canopyData.model))
        canopy.name = `.canopy(${this.canopy.name} - ${data.uuid})`
        canopy.position.setX(data.posX)
        canopy.position.setY(this.state.ceiling / this.conf.ratio)
        canopy.position.setZ(data.posZ)
        group.add(canopy)
      }
    }

    return { group, data }
  }

  public createRulers() {
    const _rulers = this.scene.children.filter((r) => r.name.startsWith('.rulers'))
    if (_rulers.length) {
      this.scene.remove(..._rulers)
    }

    const ceilingRatio = this.state.ceiling / this.conf.ratio
    const models = this.getObjectModels()
    const minY = Math.min(...models.map(({ position }) => position.y))

    // Ceiling height rulers.
    const ruler1 = this.utils.createLineWithPoints({
      length: ceilingRatio,
      message: `${this.state.ceiling} cm`
    })

    ruler1.name = '.rulers(Group ceiling)'
    ruler1.position.setX(-24)
    ruler1.rotation.z = Math.PI / 2
    this.scene.add(ruler1)

    // Composition height rulers.
    const ruler2 = this.utils.createLineWithPoints({
      length: ceilingRatio - minY,
      message: `${this.state.clusterHeight} cm`
    })

    ruler2.name = '.rulers(Group component height)'
    ruler2.position.setX(-22)
    ruler2.position.setY(minY + 0.0125)
    ruler2.rotation.z = Math.PI / 2
    this.scene.add(ruler2)

    if (this.state.table?.isActive) {
      const tableWidth = this.state.table.width / this.conf.ratio
      const tableHeight = this.state.table.height / this.conf.ratio + 0.1

      // Distance between table and models.
      const ruler3 = this.utils.createLineWithPoints({
        length: Number(ceilingRatio - tableHeight - (ceilingRatio - minY)) - 0.125,
        message: `${this.state.distanceFromTable} cm`
      })

      ruler3.name = '.rulers(Distance form table)'
      ruler3.position.setX(-22)
      ruler3.position.setY(tableHeight)
      ruler3.rotation.z = Math.PI / 2
      this.scene.add(ruler3)

      // Table width.
      const ruler4 = this.utils.createLineWithPoints({
        length: tableWidth,
        message: `${this.state.table.width} cm`
      })

      ruler4.name = '.rulers(Table width)'
      ruler4.position.setX(-(tableWidth / 2))
      ruler4.position.setY(-1.5)
      this.scene.add(ruler4)

      // Table height.
      const ruler5 = this.utils.createLineWithPoints({
        length: tableHeight,
        message: `${this.state.table.height} cm`
      })

      ruler5.name = '.rulers(Table height)'
      ruler5.position.setX(tableWidth / 2 + 2)
      ruler5.rotation.z = Math.PI / 2
      this.scene.add(ruler5)
    } else {
      // Distance between floor and models.
      const ruler3 = this.utils.createLineWithPoints({
        length: minY - 0.125,
        message: `${this.state.distanceFromFloor} cm`
      })

      ruler3.name = '.rulers(Distance form floor)'
      ruler3.position.setX(-22)
      ruler3.rotation.z = Math.PI / 2
      this.scene.add(ruler3)
    }
  }

  public createTable(table?: TableData) {
    if (table) this.state.table = table

    if (!this.state.table) return void 0
    this.removeTable()

    const [width, height, depth] = [
      this.state.table.width / this.conf.ratio,
      this.state.table.height / this.conf.ratio,
      this.state.table.depth / this.conf.ratio
    ]

    let tableMesh: THREE.Object3D | null = null
    let tableMaterial = new THREE.MeshBasicMaterial({ color: 0xfcfcfa })
    tableMaterial.shadowSide = THREE.DoubleSide
    tableMaterial.envMap = this.scene.environment
    tableMaterial.combine = THREE.MixOperation
    tableMaterial.reflectivity = 0.314

    const legGeometry = new THREE.BoxGeometry(1.5, height, 1.5)
    let legMesh = new THREE.Mesh(legGeometry, tableMaterial)

    switch (this.state.table.type) {
      case 'square-table':
        const squareGeometry = new THREE.BoxGeometry(width, 0.5, width)
        tableMesh = new THREE.Mesh(squareGeometry, tableMaterial)
        break

      case 'round-table':
        const roundGeometry = new THREE.CylinderGeometry(width / 2, width / 2, 0.5, 64)
        tableMesh = new THREE.Mesh(roundGeometry, tableMaterial)
        break

      case 'rectangular-table':
        const rectangularGeometry = new THREE.BoxGeometry(width, 0.5, depth)
        const rectangularLegGeometry = new THREE.BoxGeometry(0.5, height, 0.5)

        tableMesh = new THREE.Mesh(rectangularGeometry, tableMaterial)
        legMesh = new THREE.Mesh(rectangularLegGeometry, tableMaterial)
        break
    }

    const group = new THREE.Group()
    group.name = 'Table group'

    if (tableMesh) {
      tableMesh.castShadow = true
      tableMesh.receiveShadow = true
      tableMesh.position.setY(height - 0.25)
      group.add(tableMesh)
    }

    legMesh.castShadow = true
    legMesh.receiveShadow = true

    for (const leg of this.state.table.legs) {
      const cloneLegMesh = legMesh.clone()
      cloneLegMesh.position.set(leg.x, height / 2, leg.z)
      group.add(cloneLegMesh)
    }

    this.scene.add(group)
  }

  private async createHumanSilhouette() {
    const silhouette = await this.loadAsync<THREE.Object3D>('/static/media/human.glb')
    const upScaling = 100 / this.conf.ratio

    silhouette.name = 'Human Silhouette'
    silhouette.scale.set(upScaling, upScaling, upScaling)
    silhouette.position.setX(-15.125)
    silhouette.rotation.y = 1

    this.scene.add(silhouette)
  }

  private getObjectModels() {
    const groups = this.scene.children.filter(({ name }) => name.startsWith('.clusterGroup'))
    return groups.map(({ children }) => children.find(({ name }) => name.startsWith('.model'))!)
  }

  private updateDatasetBy(uuid: string, data: Dataset) {
    this.state.dataset = this.state.dataset.map((r) => {
      if (r.uuid === uuid) return data
      return r
    })
  }

  public async updateDistance() {
    const ceiling = this.state.ceiling / this.conf.ratio

    // Grid Helper.
    const gridHelperCeiling = this.scene.children.find(({ name }) => name === '.gridHelper(Ceiling)')
    if (gridHelperCeiling) gridHelperCeiling.position.setY(ceiling)

    // Update Canopy.
    if (this.canopy?.type === CanopyType.MULTI) {
      const canopy = this.scene.children.find(({ name }) => name.startsWith('.canopy'))
      if (canopy) {
        const [_, canopySize] = this.utils.getBoundingBox(canopy)
        canopy.position.setY(ceiling - canopySize.y)
      }
    }

    // Update Clusters.
    const clusters: THREE.Group<THREE.Object3DEventMap>[] = []
    for await (const data of this.state.dataset) {
      const result = await this.createCluster(data)
      if (result) {
        clusters.push(result.group)
        this.updateDatasetBy(data.uuid, result.data)
      }
    }

    this.removeCluster()
    this.scene.add(...clusters)

    return Promise.resolve()
  }

  public async updateCanopy(canopyColor: string) {
    if (!this.canopy) return void 0

    const canopyData = this.canopy.dataset.find(
      ({ color }) => color.toUpperCase() === canopyColor.toUpperCase()
    )!

    const canopy = await this.loadAsync<THREE.Object3D>(baseUrl(canopyData.model))
    canopy.name = `.canopy(${this.canopy.name})`

    this.removeCanopy()

    if (canopyData.upScaling) {
      this.utils.setScale(canopy, canopyData.upScaling / this.conf.ratio)
    }

    const [canopyCenter, canopySize] = this.utils.getBoundingBox(canopy)
    canopy.position.sub(canopyCenter)

    if (this.canopy.type === CanopyType.MULTI) {
      canopy.position.setY(this.state.ceiling / this.conf.ratio - canopySize.y / 3)
      this.scene.add(canopy)
    } else {
      for (const data of this.state.dataset) {
        const cluster = this.removeCanopy(data.uuid)
        if (cluster) {
          const newCluster = cluster.clone()
          const cloneCanopy = canopy.clone()

          cloneCanopy.name = `.canopy(${this.canopy.name} - ${data.uuid})`
          cloneCanopy.position.setX(data.posX)
          cloneCanopy.position.setY(this.state.ceiling / this.conf.ratio)
          cloneCanopy.position.setZ(data.posZ)
          newCluster.add(cloneCanopy)

          this.removeCluster(data.uuid)
          this.scene.add(newCluster)
        }
      }
    }

    return Promise.resolve()
  }

  public async updateCluster(uuid: string, payload: UpdateClusterValues) {
    if (!Object.values(payload).length) return void 0

    // Change model-lamp
    if (payload?.itemId) {
      const data = this.state.dataset.find((r) => r.uuid === uuid)
      if (data) {
        const result = await this.createCluster({ ...data, itemId: payload.itemId })
        if (result) {
          this.removeCluster(uuid)
          this.updateDatasetBy(uuid, result.data)
          this.scene.add(result.group)
        }
      }
    } else {
      const cluster = this.scene.children.find((r) => r.name === `.clusterGroup(${uuid})`)
      if (!cluster) return void 0

      const model = cluster.children.find((r) => r.name.startsWith('.model'))!

      // Update wire-length
      if (payload?.wireLength) {
        const data = this.state.dataset.find((r) => r.uuid === uuid)
        if (!data) return void 0

        const wire = cluster.children.find((r) => r.name.startsWith('.wire'))!
        cluster.remove(wire)

        const [_, size] = this.utils.getBoundingBox(model)
        model.position.setY((this.state.ceiling - payload.wireLength) / this.conf.ratio - size.y + 0.128)

        const newWire = this.utils.createWire(payload.wireLength / this.conf.ratio)
        newWire.name = `.wire(${payload.wireLength} - ${uuid})`
        newWire.position.setX(data.posX)
        newWire.position.setY((this.state.ceiling - payload.wireLength) / this.conf.ratio)
        newWire.position.setZ(data.posZ)
        cluster.add(newWire)
      }

      // Update model-rotation
      if (payload?.rotation) {
        this.utils.setRotate(model, payload.rotation)
      }
    }

    return Promise.resolve(null)
  }

  public async updateClusters(dataset: Dataset[]) {
    if (!this.canopy) return void 0

    const clusters: THREE.Group<THREE.Object3DEventMap>[] = []

    if (this.canopy.name.toUpperCase().includes('SPBA-LINEAR')) {
      const canopy = this.scene.children.find((r) => r.name.startsWith('.canopy'))!
      const [_, canopySize] = this.utils.getBoundingBox(canopy)

      const sizeX = (canopySize.x - 1.5) / 2
      let start = -sizeX
      let end = sizeX
      let spaceBetween = this.utils.justifyBetween(dataset.length, start, end)

      dataset = dataset.map((r, index) => ({ ...r, posX: spaceBetween[index] }))
    }

    for await (const data of dataset) {
      const result = await this.createCluster(data)
      if (result) {
        clusters.push(result.group)
        this.updateDatasetBy(data.uuid, result.data)
      }
    }

    this.removeCluster()
    this.scene.add(...clusters)

    return Promise.resolve()
  }

  public removeCanopy(uuid?: string) {
    if (uuid) {
      const cluster = this.scene.children.find(({ name }) => name === `.clusterGroup(${uuid})`)
      const canopy = cluster?.children.find(({ name }) => name.startsWith('.canopy'))
      if (cluster && canopy) {
        cluster.remove(canopy)
        return cluster
      }
    } else {
      const canopy = this.scene.children.find(({ name }) => name.startsWith('.canopy'))
      if (canopy) {
        this.scene.remove(canopy)
      }
    }
  }

  public removeCluster(uuid?: string) {
    const clusters = this.scene.children.filter(({ name }) =>
      uuid ? name === `.clusterGroup(${uuid})` : name.startsWith('.clusterGroup')
    )

    if (clusters.length) {
      this.scene.remove(...clusters)
    }
  }

  public removeTable() {
    if (this.state.table) {
      const table = this.scene.children.find(({ name }) => name === 'Table group')
      if (table) {
        this.scene.remove(table)
      }
    }
  }

  private async loadAsync<T = any>(url: string): Promise<T> {
    if (url.endsWith('.hdr')) {
      const loader = new RGBELoader()
      const texture = await loader.loadAsync(url)
      texture.mapping = THREE.EquirectangularReflectionMapping

      return texture as T
    } else {
      const loader = new GLTFLoader()
      const glTF = await loader.loadAsync(url)

      glTF.scene.castShadow = true
      glTF.scene.receiveShadow = true
      glTF.scene.traverse((object: any) => {
        if (object?.isObject3D) object.castShadow = true
      })

      return glTF.scene as T
    }
  }
}
