import { CanopyType, DiskStatus, DiskType, ItemGroup, Roles } from '@/constants'
import type { CanopySet, CanopyWireSet, Grid } from '@/constants/canopies'
import type { State } from '@/libs/core.type'

export interface User extends BaseDate {
  id: number
  uid: string
  role: Roles
  gender: string
  email: string
  phoneNo?: string
  displayName: string
  avatar: string
  bio?: string
  isActive: boolean

  disks?: Disk[]
}

export interface Canopy extends BaseDate {
  id: number
  name: string
  code: string
  type: CanopyType
  blueprint: string
  dataset: CanopySet[]
  grid: Grid[]
  wireSet?: {
    id: number
    arr: number[]
  }[]
  isActive: boolean

  limiter?: Limitation[]
}

export interface Product extends BaseDate {
  id: number
  name: string
  code: string
  series: string
  poster: string
  mixingPoster?: string
  isActive: boolean

  items?: Item[]
}

export interface Item extends BaseDate {
  id: string
  vid: string
  group: ItemGroup
  name?: string
  code: string
  poster: string
  object3D?: string
  useIntersectObject?: boolean
  isActive: boolean

  product?: Product
}

export interface Disk extends BaseDate {
  id: number
  type: DiskType
  name: string
  url?: string
  dataset?: State
  status: DiskStatus
  isActive: boolean

  user?: User
}

export interface Banner extends BaseDate {
  id: number
  name: string
  description?: string
  index: number
  src: string
  srcTablet?: string
  srcMobile: string
}

export interface Limitation extends BaseDate {
  id: string
  canopy: Partial<Canopy>
  product: Partial<Product>
  canInatall: boolean
  /**
   * Pattern { presetId: maximumValue }
   * `e.g. { 1: 5 ,2: 4 }`
   */
  maximum: Record<number, number>
  isActive: boolean
}
