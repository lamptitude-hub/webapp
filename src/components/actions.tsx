'use client'

import cls from 'classnames'
import { useRouter } from 'next/navigation'

import { useTranslate } from '@/hooks'

type Props = {
  usePrev?: boolean
  prevIsDisabled?: boolean
  onPrev?: () => void
  nextIsDisabled?: boolean
  onNext?: () => void
}

export function ActionsComponent({ usePrev = true, ...props }: Props) {
  // __STATE's
  const router = useRouter()
  const { t } = useTranslate()

  // __RENDER
  return (
    <div className='ui--page-actions'>
      <div className={cls('mx-auto flex max-w-6xl', usePrev ? 'justify-between' : 'justify-end')}>
        {usePrev && (
          <button
            className='btn btn-prev'
            type='button'
            disabled={props?.prevIsDisabled}
            onClick={() => props?.onPrev || router.back()}>
            <span className='icon bi bi-arrow-left'></span>
            <span className='text text-base font-normal'>{t('btnPrev')}</span>
          </button>
        )}

        <button
          className='btn btn-next'
          type='button'
          disabled={props?.nextIsDisabled}
          onClick={props.onNext}>
          <span className='text text-base font-normal'>{t('btnNext')}</span>
          <span className='icon bi bi-arrow-right'></span>
        </button>
      </div>
    </div>
  )
}
