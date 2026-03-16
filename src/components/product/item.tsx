'use client'

import cls from 'classnames'

import { SVG } from '@/components/svgs'

type Props = {
  name: string
  src: string
  isActive: boolean
  onClick?: () => void
}

export function ItemComponent({ name, src, isActive, onClick }: Props) {
  // __STATE <Next.14>

  // __RENDER
  return (
    <div
      className={cls('group relative aspect-square w-full cursor-pointer overflow-hidden', {
        'ring-2 ring-theme': isActive
      })}
      onClick={onClick}>
      <img
        className='h-[80%] w-full object-contain transition-transform duration-1000 group-hover:scale-105'
        src={src}
        loading='lazy'
      />
      <p className='absolute inset-x-6 bottom-6 text-center text-lg font-medium max-sm:bottom-2 max-sm:text-base'>
        {name}
      </p>

      {isActive && (
        <span className='bi bi-check-circle-fill absolute right-4 top-4 text-4xl text-theme'></span>
      )}
    </div>
  )
}
