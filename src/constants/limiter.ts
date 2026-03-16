import { v4 as uuidV4 } from 'uuid'

import type { Limitation } from '@/types/schema'

export const canopyLimiters: Limitation[] = [
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-800'
    },
    product: {
      name: 'COTDY'
    },
    maximum: { 5: 4, 6: 4 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-800'
    },
    product: {
      name: 'TEE'
    },
    maximum: { 5: 3, 6: 3 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-800'
    },
    product: {
      name: 'PAX'
    },
    maximum: { 5: 7, 6: 7 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-800'
    },
    product: {
      name: 'CUKI'
    },
    maximum: { 5: 3, 6: 3 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-800'
    },
    product: {
      name: 'TARGA'
    },
    maximum: { 5: 2, 6: 2 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-1400'
    },
    product: {
      name: 'COTDY'
    },
    maximum: { 5: 6, 6: 6 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-1400'
    },
    product: {
      name: 'TEE'
    },
    maximum: { 5: 5, 6: 5 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-1400'
    },
    product: {
      name: 'PAX'
    },
    maximum: { 5: 12, 6: 12 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-1400'
    },
    product: {
      name: 'CUKI'
    },
    maximum: { 5: 5, 6: 5 },
    canInatall: true,
    isActive: true
  },
  {
    id: uuidV4(),
    canopy: {
      name: 'SPBA-LINEAR-ADJ-1400'
    },
    product: {
      name: 'TARGA'
    },
    maximum: { 5: 3, 6: 3 },
    canInatall: true,
    isActive: true
  }
]
