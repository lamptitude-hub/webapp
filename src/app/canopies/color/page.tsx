'use client'

import { useQuery } from '@tanstack/react-query'
import cls from 'classnames'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ActionsComponent } from '@/components/actions'
import { CanopyType } from '@/constants'
import { CanopySet, wireArray } from '@/constants/canopies'
import { canopyLimiters } from '@/constants/limiter'
import { useLoader, useTranslate } from '@/hooks'
import { CanopyService, ProductService } from '@/services'
import { clampMinMax, s3Prefix } from '@/utils'

export default function CanopyColorContainer() {
  // __STATE<Next.14>
  const loader = useLoader()
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')!
  const canopyId = +searchParams.get('canopyId')!

  const { t } = useTranslate()

  const [currentSelected, setCurrentSelected] = useState<CanopySet>()
  const [currentPresetId, setCurrentPresetId] = useState<number>()
  const [totalBulbs, setTotalBulbs] = useState<number>(1)

  const { register, getValues, setValue } = useForm<{ ceilingHeight: number }>({
    defaultValues: { ceilingHeight: 300 }
  })

  // __FETCHER's
  const {
    data: responseData,
    isLoading,
    isRefetching,
    isFetched
  } = useQuery({
    queryKey: ['canopy-one', canopyId],
    queryFn: async () => {
      const data = await CanopyService.findOne(canopyId)
      if (data) {
        setCurrentSelected(data.dataset[0])
        return data
      }
    },
    refetchOnWindowFocus: false
  })

  const { data: product } = useQuery({
    queryKey: [`product-${productId}`],
    queryFn: async () => ProductService.findOne(+productId),
    refetchOnWindowFocus: false
  })

  const maxBulbs = useMemo(() => {
    if (responseData && product) {
      const i = canopyLimiters.find((r) => {
        return (
          (responseData.id === r.canopy?.id ||
            responseData.name.toUpperCase().includes(r.canopy?.name || '')) &&
          (product.id === r.product?.id || product.name.toUpperCase().includes(r.product?.name || '')) &&
          r.canInatall &&
          r.isActive
        )
      })

      return currentPresetId && i ? i.maximum[currentPresetId] : responseData.grid.length || 1
    }

    return 1
  }, [responseData, product, currentPresetId])

  // __FUNCTION's
  const handlePresetChange = useCallback(
    (id: number) => {
      if (!responseData) return void 0

      setValue('ceilingHeight', 300)

      if (id === 3) {
        if (responseData.name.endsWith(`TEAR-10`)) {
          setValue('ceilingHeight', 600)
        }
      }

      if (id === 4) {
        if (responseData.name.endsWith(`TEAR-10`)) {
          setValue('ceilingHeight', 600)
        }

        if (responseData.name.endsWith(`TEAR-6`) || responseData.name.endsWith(`CEIL-5`)) {
          setValue('ceilingHeight', 400)
        }
      }

      setCurrentPresetId(id)
    },
    [responseData]
  )

  const handleBulbs = useCallback(
    (action: 'minus' | 'plus') => {
      const max = responseData?.grid?.length || maxBulbs || 10

      setTotalBulbs((prev) => {
        if (action === 'plus') {
          return clampMinMax(prev + 1, 1, max)
        } else if (action === 'minus') {
          return clampMinMax(prev - 1, 1, max)
        }

        return prev
      })
    },
    [responseData, maxBulbs]
  )

  const handleNext = useCallback(() => {
    if (!currentSelected) return void 0

    let href = ''
    const qs: string[] = [
      `mode=3d-editor-program`,
      `libs=three.js`,
      `productId=${productId}`,
      `canopyId=${canopyId}`,
      `canopyColor=${currentSelected.color}`,
      `ceilingHeight=${getValues('ceilingHeight')}`,
      `bulbs=${totalBulbs}`
    ]

    const canopyType = searchParams.get('canopyType')!
    if (canopyType === CanopyType.MULTI) {
      qs.push(`canopyPresetId=${currentPresetId}`)
      href = `/customize?${qs.join('&')}`
    } else {
      href = `/canopies/composition?${qs.join('&')}`
    }

    location.assign(href)
  }, [productId, canopyId, responseData, currentSelected, currentPresetId, totalBulbs])

  // __EFFECT's
  useEffect(() => {
    if (isLoading || isRefetching) loader.on()
    if (isFetched) loader.off()
  }, [isLoading, isRefetching, isFetched])

  useEffect(() => {
    setTotalBulbs(maxBulbs)
  }, [maxBulbs])

  // __REMAP's
  const wires = useMemo(() => {
    if (responseData?.wireSet?.length) {
      const ws = responseData.wireSet.map(({ id }) => wireArray.find((r) => r.id === id)!)
      setCurrentPresetId(ws[0].id)
      return ws
    }

    return []
  }, [responseData])

  const isBulbs = useMemo(() => {
    if (responseData) {
      return /(LINEAR-ADJ-800|LINEAR-ADJ-1400)$/g.test(responseData.name)
    }
  }, [responseData])

  // __RENDER
  return (
    <div className='ui--canopy-body pb-36 max-sm:pb-20'>
      <div className='mx-auto max-w-6xl py-8'>
        <h2 className='mb-4 text-center'>{t('labelStep2')}</h2>
        <div className='flex items-center justify-center gap-3'>
          <img className='w-8' src='/static/images/icons/canopy.svg' />
          <span className='text-lg font-medium'>{t('labelChooseCanopyColor')}</span>
        </div>
      </div>

      {responseData?.type === CanopyType.MULTI && (
        <div className='mx-auto flex max-w-6xl items-center justify-start gap-8 max-sm:mt-4 max-sm:gap-4 max-sm:px-2'>
          <div className='text-base text-neutral-500'>{t('labelMaxOfLamp')}</div>

          <div className='flex items-center justify-start rounded-xl px-2 py-1 ring-2 ring-yellow-400'>
            {isBulbs && (
              <button className='btn size-8' type='button' onClick={() => handleBulbs('minus')}>
                <span className='icon bi bi-dash text-xl leading-none' />
              </button>
            )}

            <div className={cls('select-none text-base', { 'px-2': !isBulbs })}>
              <span className='font-bold'>{totalBulbs}</span>
              <small className='pl-1'>{t('labelBulb')}</small>
            </div>

            {isBulbs && (
              <button className='btn size-8' type='button' onClick={() => handleBulbs('plus')}>
                <span className='icon bi bi-plus text-xl leading-none' />
              </button>
            )}
          </div>
        </div>
      )}

      <div className='mx-auto mt-8 max-w-6xl max-sm:mt-4 max-sm:px-2'>
        <div className='grid grid-cols-[2fr_1fr] gap-8 max-sm:grid-cols-1'>
          <div className='relative max-h-80 min-h-72 rounded-sm bg-zinc-100 max-sm:aspect-video max-sm:min-h-min max-sm:w-full'>
            <img
              className='size-full object-cover object-center'
              src={s3Prefix(currentSelected?.poster.replace('.png', '-Lg.png') || '')}
            />
          </div>

          <div className='grid grid-rows-[1fr_auto] gap-8'>
            <img
              className='block h-auto w-full rounded-sm object-cover object-center ring-1 ring-zinc-100 max-sm:aspect-video'
              src={s3Prefix(responseData?.blueprint || '')}
            />

            <div className='grid grid-cols-2 items-center justify-between max-sm:justify-start max-sm:gap-4'>
              <div className=''>
                <b>{t('labelColor')}</b>: {currentSelected?.color}
              </div>

              <ul className='flex gap-1'>
                {responseData?.dataset.map((record, index) => (
                  <li key={index}>
                    <div
                      className={cls(
                        'canopy-color',
                        record.color.toUpperCase(),
                        'size-8 cursor-pointer rounded-full border-2 border-solid',
                        record.color === currentSelected?.color ? 'border-yellow-400' : 'border-neutral-200'
                      )}
                      key={index}
                      onClick={() => setCurrentSelected(record)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {responseData?.type === CanopyType.MULTI && wires.length && (
        <div className='mx-auto mt-8 max-w-6xl max-sm:px-2'>
          <div className='text-base text-neutral-500'>{t('labelComponentType')}</div>

          <div className='mt-8 grid grid-cols-4 gap-8 max-sm:mt-4 max-sm:grid-cols-2 max-sm:gap-4'>
            {wires.map((record, index) => (
              <div
                className='relative aspect-square w-full cursor-pointer'
                onClick={() => handlePresetChange(record.id)}
                key={index}>
                {currentPresetId === record.id && (
                  <span className='bi bi-check-circle-fill absolute right-4 top-4 text-4xl text-theme max-sm:hidden'></span>
                )}

                <img
                  className={cls('size-full bg-neutral-200/80 object-contain object-center', {
                    'ring-2 ring-theme': currentPresetId === record.id
                  })}
                  src={record.poster}
                />

                <p className='mt-4 text-center text-base'>{t(record.name)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='mx-auto mt-8 max-w-6xl max-sm:px-2'>
        <div className='text-base text-neutral-500'>{t('labelCeilingHeight')}</div>

        <div className='mr-auto mt-8 grid max-w-52 justify-center gap-4'>
          <svg className='svg' width='200' height='100' viewBox='0 0 200 103' fill='none'>
            <path d='M0.75 1H199.25' stroke='#D8D8D8' strokeWidth='2' />
            <path
              d='M100.707 2.29289C100.317 1.90237 99.6834 1.90237 99.2929 2.29289L92.9289 8.65685C92.5384 9.04738 92.5384 9.68054 92.9289 10.0711C93.3195 10.4616 93.9526 10.4616 94.3431 10.0711L100 4.41421L105.657 10.0711C106.047 10.4616 106.681 10.4616 107.071 10.0711C107.462 9.68054 107.462 9.04738 107.071 8.65685L100.707 2.29289ZM101 103V3H99V103H101Z'
              fill='#D8D8D8'
            />
          </svg>

          <form className='relative mx-auto mt-2 max-w-40 rounded-xl ring-1 ring-neutral-200'>
            <input
              className='h-11 w-32 px-3 text-base font-bold'
              type='number'
              min={200}
              max={1000}
              {...register('ceilingHeight', {
                min: 200,
                max: 1000,
                required: true,
                valueAsNumber: true
              })}
            />
            <small className='pointer-events-none absolute bottom-3 right-2 text-sm leading-none text-neutral-500'>
              cm
            </small>
          </form>

          <svg className='svg rotate-180' width='200' height='100' viewBox='0 0 200 103' fill='none'>
            <path d='M0.75 1H199.25' stroke='#D8D8D8' strokeWidth='2' />
            <path
              d='M100.707 2.29289C100.317 1.90237 99.6834 1.90237 99.2929 2.29289L92.9289 8.65685C92.5384 9.04738 92.5384 9.68054 92.9289 10.0711C93.3195 10.4616 93.9526 10.4616 94.3431 10.0711L100 4.41421L105.657 10.0711C106.047 10.4616 106.681 10.4616 107.071 10.0711C107.462 9.68054 107.462 9.04738 107.071 8.65685L100.707 2.29289ZM101 103V3H99V103H101Z'
              fill='#D8D8D8'
            />
          </svg>
        </div>
      </div>

      <ActionsComponent nextIsDisabled={!currentSelected} onNext={handleNext} />
    </div>
  )
}
