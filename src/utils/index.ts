import { SUPABASE_URL } from '@/constants/configs'

import { dialog, modal, notice } from './addon'

export { dataset } from './save'
export class xs {
  static readonly alert = dialog
  static readonly modal = modal
  static readonly notice = notice
}

export function isIE() {
  return new RegExp('MSIE|Trident').test(navigator.userAgent)
}

export function generateId(radix: number = 16) {
  return Math.random().toString(radix).slice(2)
}

export function scrollOff(input: boolean = true) {
  document.body.style.overflowY = input ? 'hidden' : 'auto'
}

export function s3Prefix(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public${path}`
}

export async function delay(t: number = 1e3) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1)
    }, t)
  })
}

export function clampMinMax(input: number, min: number, max: number) {
  return Math.min(Math.max(input, min), max)
}

/**
 * Rounds a number up to the next multiple of a given step.
 *
 * @param input - The input number to round.
 * @param step - The step value for rounding.
 * @returns The next multiple of the step.
 */
export function roundUpTo(input: number, step: number): number {
  if (step <= 0) {
    throw new Error('Step value must be greater than 0.')
  }
  return Math.ceil(input / step) * step
}

export function centimeterToPixel(cm: number, dpi: number = 96) {
  return 0.03937007 * dpi * cm
}

export async function dataURLtoFile(dataUrl: string, fileName: string, fileType: string = 'image/png') {
  const res = await fetch(dataUrl)
  const blob = await res.blob()

  return new File([blob], fileName, { type: fileType })
}

export function transformData<T = any>(input: T[][]): T[] {
  const result: T[] = []
  const maxLength = Math.max(...input.map((arr) => arr.length))

  for (let col = 0; col < maxLength; col++) {
    for (let row = 0; row < input.length; row++) {
      if (col < input[row].length) {
        result.push(input[row][col])
      }
    }
  }

  return result
}

export function createCycler<T = any>(array: T[]) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Input must be a non-empty array')
  }

  let currentIndex = 0

  return (): T => {
    const item = array[currentIndex]
    currentIndex = (currentIndex + 1) % array.length
    return item
  }
}

/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values,
 * which can then be easily sent using the XMLHttpRequest.send() method.
 *
 * @param {object} data FormData
 */
export function createFormData(data: Record<string, any>): [FormData, any] {
  const formData = new FormData()

  for (const name in data) {
    const value = data[name]
    if (value instanceof FileList) {
      if (value?.length) formData.append(name, value?.item(0)!)
    } else {
      formData.append(name, value)
    }
  }

  return [
    formData,
    {
      'Content-Type': 'multipart/form-data'
    }
  ]
}
