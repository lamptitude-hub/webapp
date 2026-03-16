import { useState, useMemo, useCallback } from 'react'
import { errorMessage, InputAttrs } from './utils'
import cls from 'classnames'

interface Props extends InputAttrs {
  type?: 'text' | 'number' | 'search' | 'email' | 'password' | 'date'
  value?: string | number
  autoFocus?: boolean
  autoComplete?: string
  maxLength?: number
}

export function InputComponent({ name, value, register, rules, errors, ...props }: Props) {
  // __STATE <Next.14>
  const vid = useMemo(() => `ui--form-model-${name}`, [name])
  const defaultValue = useMemo(() => value, [value])

  const [required, isPassword] = useMemo(() => [rules?.required, props.type === 'password'], [])
  const [type, setType] = useState(props.type || 'text')

  // __FUNCTION's
  const handleSwitchType = useCallback(() => {
    if (isPassword) setType((prev) => (prev === 'text' ? 'password' : 'text'))
  }, [])

  // __RENDER
  return (
    <div className='ui--input-provider relative'>
      <label
        className={cls('ui--input-label inline-flex items-center capitalize leading-none', { required })}
        htmlFor={vid}
      >
        {props?.icon && (
          <span
            className={cls(
              `icon bi bi-${props.icon}`,
              'mr-2 border-r border-solid border-neutral-700 pr-1 text-base leading-none text-neutral-200'
            )}
          ></span>
        )}
        <span className='text'>{props.label}</span>
      </label>

      {props?.children && <div className='mt-2 text-xs text-neutral-400'>{props.children}</div>}

      <div className='ui--input-field relative'>
        <input
          className='mt-2 h-12 border-b-2 border-solid border-neutral-300 px-4 font-normal text-black'
          type={type}
          id={vid}
          defaultValue={defaultValue}
          autoComplete={props.autoComplete}
          placeholder={props.placeholder}
          maxLength={props.maxLength}
          disabled={props.disabled}
          {...register(name, rules)}
        />

        {isPassword && (
          <button
            className={cls(
              'absolute bottom-px right-0 flex h-11 w-8 place-items-center text-neutral-500 hover:text-neutral-300',
              'icon',
              { 'is-text': type === 'text' }
            )}
            type='button'
            onClick={handleSwitchType}
          >
            <span className='bi bi-upc text-xl'></span>
          </button>
        )}
      </div>

      <span className='block text-xs font-normal italic text-rose-500'>{errorMessage(errors)}</span>
    </div>
  )
}
