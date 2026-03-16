import * as THREE from 'three'

export type Object3D = THREE.Object3D<THREE.Object3DEventMap>

export type Dataset = {
  uuid: string
  posX: number
  posZ: number
  rotation?: number
  wireLength: number
  maxWireLength?: number
  modelSize: Record<'x' | 'y', number>
  itemId: string
  canopy?: {
    id: number
    currentColor: string
  }
  object?: {
    canopy?: THREE.Object3D<THREE.Object3DEventMap>
    model: THREE.Object3D<THREE.Object3DEventMap>
    wire: THREE.Line<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.LineBasicMaterial>
  }
  sorting?: number
}

export type TableType = 'square-table' | 'round-table' | 'rectangular-table'
export type TableData = {
  type: TableType
  width: number
  height: number
  depth: number
  legs: { x: number; z: number }[]
  isActive?: boolean
}

export type State = {
  uuid: string
  ceiling: number
  clusterHeight: number
  distanceFromTable: number
  distanceFromFloor: number
  productId?: number
  presetId?: number
  canopyId?: number
  canopyColor?: string
  dataset: Dataset[]
  isMixing?: boolean
  bulbs?: number
  table: TableData
  timestamp: number
}

export type UpdateDistanceValues = Pick<
  State,
  'ceiling' | 'clusterHeight' | 'distanceFromFloor' | 'distanceFromTable'
>

export type UpdateClusterValues = {
  itemId?: string
  rotation?: number
  wireLength?: number
}
