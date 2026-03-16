export * as configs from './configs'
export { Fruit } from './fruit'

export enum Theme {
  DEFAULT = 'default',
  LIGHT = 'light',
  DARK = 'dark'
}

export enum Roles {
  ROOT = 'ROOT',
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum CanopyType {
  SINGLE = 'SINGLE',
  MULTI = 'MULTI'
}

export enum ItemGroup {
  MODEL = 'MODEL',
  COLOR = 'COLOR'
}

export enum DiskType {
  OBJECT3D = 'OBJECT3D',
  DOCUMENT = 'DOCUMENT'
}

export enum DiskStatus {
  CREATED = 'CREATED',
  AWAIT = 'AWAIT',
  APPROVED = 'APPROVED',
  CANCELED = 'CANCELED',
  REJECT = 'REJECT'
}

export enum DialogName {
  SYSTEM_ALERT = '@DIALOG:SYSTEM_ALERT'
}

export enum ModalName {}

export enum NoticeName {}
