import { ReactNode } from 'react'
import { FieldError, FieldValues, UseFormRegister, RegisterOptions } from 'react-hook-form'

export interface InputAttrs {
  key: string
  vid?: string
  name: string
  label: string
  icon?: string
  placeholder?: string
  rules?: RegisterOptions
  register: UseFormRegister<FieldValues | any>
  errors?: FieldError
  children?: ReactNode
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}

export function errorMessage(errors?: FieldError) {
  if (!errors) return null

  switch (errors.type) {
    case 'required':
      return errors?.message || 'This Field is required!'

    default:
      return errors?.message
  }
}
