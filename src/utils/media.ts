import type { IMedia } from '@/types'

/**
 * The new object URL represents the specified `File` object or `Blob` object.
 *
 * @param {Blob} object A `File`, `Blob`, or `MediaSource` object to create an object URL.
 */
export function createObjectURL(object: Blob): string {
  return 'URL' in window ? URL.createObjectURL(object) : webkitURL.createObjectURL(object)
}

/**
 * GET File from list.
 *
 * @param {object} files FileList
 * @param {number} at Index of list
 */
export function getFileListAt(files: FileList | null, at: number = 0): File | null {
  if (files instanceof FileList) {
    return files.item(at)
  }

  return null
}

export async function getMediaBlob(file: string | Blob | File): Promise<IMedia> {
  if (typeof file === 'string') {
    const response = await fetch(file).then((r) => r.blob())
    return {
      url: createObjectURL(response),
      isImage: isImage(response.type),
      isVideo: isVideo(response.type),
      isAudio: isAudio(response.type)
    }
  }

  return {
    url: createObjectURL(file),
    isImage: isImage(file.type),
    isVideo: isVideo(file.type),
    isAudio: isAudio(file.type)
  }
}

export function isImage(value: string): boolean {
  return value.includes('image')
}

export function isVideo(value: string): boolean {
  return value.includes('video')
}

export function isAudio(value: string): boolean {
  return value.includes('audio')
}
