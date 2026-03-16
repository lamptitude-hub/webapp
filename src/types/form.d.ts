import { DiskType } from '@/constants'

export interface FormLogin {
  email: string
  password: string
  keepLoggedIn?: boolean
}

export interface FormRegister {
  id?: number
  email: string
  firstName: string
  lastName: string
  gender?: string
  phoneNo: string
  password: string
  confirmPassword: string
}

export interface FormCreateDocs {
  type: DiskType.DOCUMENT
  name: string
  file: File | FileList
}

export interface FormCreateProject {
  type: DiskType.OBJECT3D
  name: string
  dataset: any
}
