'use client'

import { useQuery } from '@tanstack/react-query'
import cls from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ActionsComponent } from '@/components/actions'
import { CanopyType } from '@/constants'
import { canopyLimiters } from '@/constants/limiter'
import { useLoader, useTranslate } from '@/hooks'
import { CanopyService, ProductService } from '@/services'
import type { Canopy } from '@/types/schema'
import { s3Prefix } from '@/utils'

export default function CanopyContainer() {
  // __STATE<Next.14>
  const router = useRouter()
  const loader = useLoader()
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')!

  const { t } = useTranslate()

  const [currentSelected, setCurrentSelected] = useState<Canopy>()

  // __FETCHER's
  const {
    data: responseData,
    isLoading,
    isRefetching,
    isFetched
  } = useQuery({
    queryKey: ['canopies'],
    queryFn: CanopyService.findAll,
    refetchOnWindowFocus: false
  })

  const { data: product } = useQuery({
    queryKey: [`product-${productId}`],
    queryFn: async () => ProductService.findOne(+productId),
    refetchOnWindowFocus: false
  })

  // __FUNCTION's
  const handleNext = useCallback(() => {
    if (currentSelected) {
      const qs: string[] = [
        `productId=${productId}`,
        `canopyId=${currentSelected.id}`,
        `canopyType=${currentSelected.type}`
      ]

      router.push(`/canopies/color?${qs.join('&')}`)
    }
  }, [productId, currentSelected])

  // __EFFECT's
  useEffect(() => {
    if (isLoading || isRefetching) loader.on()
    if (isFetched) loader.off()
  }, [isLoading, isRefetching, isFetched])

  // __REMAP's
  const state = useMemo(() => {
    return {
      single: responseData?.filter((canopy) => canopy.type === CanopyType.SINGLE),
      multi: responseData
        ?.filter((canopy) => canopy.type === CanopyType.MULTI)
        .map((canopy) => {
          if (
            canopyLimiters.some(
              (r) =>
                (canopy.id === r.canopy?.id || canopy.name === r.canopy?.name) &&
                (product?.id === r.product?.id || product?.name === r.product?.name) &&
                !r.canInatall
            )
          ) {
            canopy.isActive = false
          }

          return canopy
        })
    }
  }, [responseData, product])

  // __RENDER
  return (
    <div className='ui--canopy-body max-sm:pb-26 pb-24'>
      <div className='mx-auto max-w-6xl py-8'>
        <h2 className='mb-4 text-center'>{t('labelStep2')}</h2>
        <div className='flex items-center justify-center gap-3'>
          <img className='w-8' src='/static/images/icons/canopy.svg' />
          <span className='text-lg font-medium'>{t('labelChooseCanopy')}</span>
        </div>
      </div>

      <div className='mx-auto mt-4 grid max-w-6xl gap-16 pb-8 sm:mt-16'>
        <div className='rows'>
          <h3 className='mb-8 text-lg text-slate-700'>{t('labelCanopySingle')}</h3>

          <div className='grid grid-cols-4 gap-8 max-sm:grid-cols-2 max-sm:gap-4'>
            {state.single?.map((record, index) => (
              <div
                className='relative aspect-square w-full cursor-pointer'
                key={index}
                onClick={() => setCurrentSelected(record)}>
                {currentSelected?.id === record.id && (
                  <span className='bi bi-check-circle-fill absolute right-4 top-4 text-4xl text-theme' />
                )}
                <img
                  className={cls('block aspect-square w-full bg-zinc-100 object-contain object-center', {
                    'ring-2 ring-theme': currentSelected?.id === record.id
                  })}
                  src={s3Prefix(record.dataset[0].poster)}
                />
                <p className='mt-4 text-center text-base'>{record.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='rows'>
          <h3 className='mb-8 text-lg text-slate-700'>{t('labelCanopyMulti')}</h3>

          <div className='grid grid-cols-4 gap-8 max-sm:grid-cols-2 max-sm:gap-4'>
            {state.multi?.map((record, index) => (
              <div
                className={cls(
                  'relative aspect-square w-full',
                  record.isActive ? 'cursor-pointer' : 'pointer-events-none grayscale-[50%]'
                )}
                key={index}
                onClick={() => setCurrentSelected(record)}>
                {currentSelected?.id === record.id && (
                  <span className='bi bi-check-circle-fill absolute right-4 top-4 text-4xl text-theme' />
                )}
                <img
                  className={cls('block aspect-square w-full bg-zinc-100 object-contain object-center', {
                    'ring-2 ring-theme': currentSelected?.id === record.id,
                    'opacity-50': !record.isActive
                  })}
                  src={s3Prefix(record.dataset[0].poster)}
                />
                <p className={cls('mt-4 text-center text-base', { 'opacity-50': !record.isActive })}>
                  {record.name}
                </p>

                {!record.isActive && (
                  <div className='absolute inset-0 z-10 grid aspect-square p-2'>
                    <p className='self-center text-center text-xs font-semibold'>Unavailable to install</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ActionsComponent nextIsDisabled={!currentSelected} onNext={handleNext} />
    </div>
  )
}
