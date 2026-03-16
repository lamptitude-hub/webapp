export interface FileValidation {
  regex: any
  message: string
}

export interface FileValidatorOptions {
  /**
   * Extension type e.g. `jpg`, `mp4`
   */
  fileType?: FileValidation

  /**
   * MIME Type e.g. `image`, `video`
   */
  fileMimeType?: FileValidation

  /**
   * Unit megabyte/file `MB`
   */
  fileMaxSize?: FileValidation
}

export const digitsValidator = (message?: string) => {
  return {
    value: /^[+-]?([0-9]*[.])?[0-9]+$/,
    message: message || 'The field must be numeric only.'
  }
}

export const phoneValidator = (message?: string) => {
  return {
    value: /^\+?[0-9]{4,12}$/,
    message: message || 'The field must be a valid phone number.'
  }
}

export const emailValidator = (message?: string) => {
  return {
    value:
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    message: message || 'The field must be a valid email.'
  }
}

export const urlValidator = (message?: string) => {
  return {
    value:
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
    message: message || 'The field must be a valid URL.'
  }
}

export function citizenValidator(value: string): boolean | string {
  if (!value) return true

  let sum: number = 0
  value = value.replaceAll('-', '')

  for (let i = 0; i < 12; i++) {
    sum += parseInt(value.charAt(i)) * (13 - i)
  }

  if ((11 - (sum % 11)) % 10 === parseInt(value.charAt(12))) {
    return true
  }

  return 'Your Citizen ID is invalid.'
}

export const confirmPasswordValidator = (watch: Function, value: string, fieldName?: string): boolean | string => {
  return value === watch(fieldName || 'password') || 'Password confirmation does not match.'
}

export const fileValidator = (files: FileList, options: FileValidatorOptions): boolean | string => {
  if (files.length) {
    const { fileType, fileMimeType, fileMaxSize } = options
    let valid: boolean | string = true

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i)!

      // Check extension type.
      if (fileType && !fileType.regex.test(file.name)) {
        valid = fileType.message
        break
      }

      // Check mime type.
      if (fileMimeType && !file.type.includes(fileMimeType.regex)) {
        valid = fileMimeType.message
        break
      }

      // Check size
      if (fileMaxSize && file.size > fileMaxSize.regex * 1024 * 1024) {
        valid = fileMaxSize.message
        break
      }
    }

    return valid
  }

  return true
}
