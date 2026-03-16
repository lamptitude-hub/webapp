'use client'

import { useMemo } from 'react'
import cls from 'classnames'

import { SVG } from '@/components/svgs'
import { useTranslate } from '@/hooks'

type Props = {
  index?: number
}

export function StepComponent({ index = 1 }: Props) {
  // __STATE<Next.14>
  const { t } = useTranslate()
  const arr = useMemo(
    () =>
      [{ label: t('labelChooseLamp') }, { label: t('labelChooseCanopy') }, { label: t('labelChooseCustomLamp') }].map(
        (r, i) => {
          return {
            ...r,
            active: i + 1 === index,
            passed: i + 2 <= index
          }
        }
      ),
    [t, index]
  )

  // __RENDER
  return (
    <div className='ui--index-header border-0 border-b border-solid border-b-neutral-200/75'>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        <p className='text-lg uppercase'>DESIGN BY YOU</p>
      </div>

      <div className='mx-auto max-w-6xl px-4 pb-8 max-sm:hidden'>
        <ul className='grid select-none grid-flow-col justify-start gap-4'>
          {arr.map((record, index) => (
            <li className='flex items-center' key={index}>
              <span
                className={cls(
                  'flex h-7 w-7 items-center justify-center rounded-full',
                  record.active ? 'bg-theme font-bold' : record.passed ? 'bg-neutral-200' : 'bg-neutral-100'
                )}
              >
                {record.passed ? (
                  <SVG className='text-neutral-600' width='16' height='16' viewBox='0 0 16 16'>
                    <path d='M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z' />
                  </SVG>
                ) : (
                  index + 1
                )}
              </span>

              <span className='pl-3 pr-4'>{record.label}</span>

              {index < 2 && <span className='block w-8 border-0 border-b border-solid border-b-neutral-300'></span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
