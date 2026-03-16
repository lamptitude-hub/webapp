'use client'

import cls from 'classnames'
import capture from 'html2canvas'
import { useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

import { ActionsComponent } from '@/components/actions'
import { SVG } from '@/components/svgs'
import { CompositionType, type Grid, compositionArray } from '@/constants/canopies'
import { useLoader, useTranslate } from '@/hooks'
import { storage } from '@/utils/storage'

export default function CanopyContainer() {
  // __STATE<Next.14>
  const nodeRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  const loader = useLoader()
  const { t } = useTranslate()

  const [currentType, setCurrentType] = useState<CompositionType>(CompositionType.FREE)
  const [currentSelected, setCurrentSelected] = useState<Grid[]>([])

  const composition = useMemo(() => {
    return compositionArray
      .find((r) => r.type === currentType)
      ?.grid.map((r) => ({
        ...r,
        isSelected: currentSelected.some(({ top, left }) => top === r.top && left === r.left)
      }))
  }, [currentType, currentSelected])

  const ruler = useMemo(() => {
    const top = currentSelected.map((r) => r.top)
    const left = currentSelected.map((r) => r.left)

    const [minTop, maxTop] = [Math.min(...top), Math.max(...top)]
    const [minLeft, maxLeft] = [Math.min(...left), Math.max(...left)]

    const x = [
      currentSelected.find((r) => r.left === minLeft)!,
      currentSelected.find((r) => r.left === maxLeft)!
    ]
    const y =
      currentType !== CompositionType.LINEAR
        ? [currentSelected.find((r) => r.top === minTop)!, currentSelected.find((r) => r.top === maxTop)!]
        : void 0

    return { x, y }
  }, [currentType, currentSelected])

  // __FUNCTION's
  const handleNext = useCallback(async () => {
    if (!currentSelected.length) return void 0

    loader.on()

    if (nodeRef.current) {
      const canvas = await capture(nodeRef.current)
      const imageDataURL = canvas.toDataURL('image/png')
      storage.set('img-composition', imageDataURL)
    }

    const [productId, canopyId, canopyColor, ceilingHeight] = [
      searchParams.get('productId'),
      searchParams.get('canopyId'),
      searchParams.get('canopyColor'),
      searchParams.get('ceilingHeight')
    ]

    const grid = currentSelected.map((r) => ({ x: r.x, z: r.z }))
    const qs: string[] = [
      `mode=3d-editor-program`,
      `libs=three.js`,
      `productId=${productId}`,
      `canopyId=${canopyId}`,
      `canopyColor=${canopyColor}`,
      `grid=${JSON.stringify(grid)}`,
      `ceilingHeight=${ceilingHeight}`
    ]

    if (currentType === CompositionType.CIRCULAR) {
      const canopyWireSet = currentSelected
        .sort((a, b) => a.index! - b.index!)
        .map((_, index) => [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180][index])

      qs.push(`canopyWireSet=${JSON.stringify(canopyWireSet)}`)
    }

    location.assign(`/customize?${qs.join('&')}`)
  }, [nodeRef, currentType, currentSelected])

  const handleTab = useCallback((value: CompositionType) => {
    setCurrentType(value)
    setCurrentSelected([])
  }, [])

  const handleClick = useCallback(
    (data: Grid) => {
      if (currentSelected.length === 20) return void 0

      const count = currentSelected.find((r) => r.top === data.top && r.left === data.left)
      if (count) {
        setCurrentSelected((prev) => {
          return prev.filter((r) => r.top !== data.top && r.left !== data.left)
        })
      } else {
        setCurrentSelected((prev) => {
          return [...prev, { ...data, selected: true }]
        })
      }
    },
    [currentSelected]
  )

  // __RENDER
  return (
    <div className='ui--canopy-body max-sm:pb-26 pb-36'>
      <div className='mx-auto max-w-6xl py-8'>
        <h2 className='mb-4 text-center'>{t('labelStep2')}</h2>
        <div className='flex items-center justify-center gap-3'>
          <img className='w-8' src='/static/images/icons/canopy.svg' />
          <span className='text-lg font-medium'>{t('labelChooseLampPosition')}</span>
        </div>
      </div>

      <div className='mx-auto mt-10 max-w-6xl max-sm:mt-4 max-sm:px-2'>
        <div className='grid grid-cols-[auto_1fr] gap-8 max-sm:grid-cols-1'>
          <div className='grid grid-flow-col items-center justify-start gap-3 max-sm:block'>
            <div className='text-neutral-500 max-sm:mb-2'>{t('labelNumberOfLamp')}</div>

            <div className='flex items-center gap-1 rounded-xl bg-neutral-100 px-6 py-3 max-sm:justify-center'>
              <SVG className='svg-12 text-transparent' width={20} height={20} viewBox='0 0 24 24'>
                <path d='M9.5 22H14.5M15 15.3264C17.3649 14.2029 19 11.7924 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 11.7924 6.63505 14.2029 9 15.3264V16C9 16.9319 9 17.3978 9.15224 17.7654C9.35523 18.2554 9.74458 18.6448 10.2346 18.8478C10.6022 19 11.0681 19 12 19C12.9319 19 13.3978 19 13.7654 18.8478C14.2554 18.6448 14.6448 18.2554 14.8478 17.7654C15 17.3978 15 16.9319 15 16V15.3264Z' />
              </SVG>

              <span className='text-neutral-400'>
                {currentSelected.length}/20 {t('labelBulb')}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-[auto_1fr] items-center justify-start gap-3 max-sm:grid-cols-1'>
            <div className='text-neutral-500'>{t('labelComponentType')}</div>

            <div className='grid w-full grid-cols-4 gap-2'>
              <button
                className={cls(
                  'btn gap-2 rounded-xl border-2 border-solid px-6 py-3 max-sm:grid-flow-row max-sm:gap-1 max-sm:px-2 max-sm:py-4',
                  currentType === CompositionType.FREE ? 'border-yellow-400' : 'border-neutral-200'
                )}
                type='button'
                onClick={() => handleTab(CompositionType.FREE)}>
                <SVG
                  className={cls('svg-12 text-transparent max-sm:mx-auto', {
                    active: currentType === CompositionType.FREE
                  })}
                  width={22}
                  height={21}
                  viewBox='0 0 25 24'>
                  <path d='M17.9151 8.31001C19.2737 8.31001 20.3751 7.20863 20.3751 5.85001C20.3751 4.49139 19.2737 3.39001 17.9151 3.39001C16.5564 3.39001 15.4551 4.49139 15.4551 5.85001C15.4551 7.20863 16.5564 8.31001 17.9151 8.31001Z' />
                  <path d='M6.83501 8.31001C8.19363 8.31001 9.295 7.20863 9.295 5.85001C9.295 4.49139 8.19363 3.39001 6.83501 3.39001C5.47639 3.39001 4.375 4.49139 4.375 5.85001C4.375 7.20863 5.47639 8.31001 6.83501 8.31001Z' />
                  <path d='M17.9151 20.61C19.2737 20.61 20.3751 19.5086 20.3751 18.15C20.3751 16.7914 19.2737 15.69 17.9151 15.69C16.5564 15.69 15.4551 16.7914 15.4551 18.15C15.4551 19.5086 16.5564 20.61 17.9151 20.61Z' />
                  <path d='M6.83501 20.61C8.19363 20.61 9.295 19.5086 9.295 18.15C9.295 16.7914 8.19363 15.69 6.83501 15.69C5.47639 15.69 4.375 16.7914 4.375 18.15C4.375 19.5086 5.47639 20.61 6.83501 20.61Z' />
                </SVG>

                <span className='text-base max-sm:text-sm'>{t('labelComponentFree')}</span>
              </button>

              <button
                className={cls(
                  'btn gap-2 rounded-xl border-2 border-solid px-6 py-3 max-sm:grid-flow-row max-sm:gap-1 max-sm:px-2 max-sm:py-4',
                  currentType === CompositionType.CIRCULAR ? 'border-yellow-400' : 'border-neutral-200'
                )}
                type='button'
                onClick={() => handleTab(CompositionType.CIRCULAR)}>
                <SVG
                  className={cls('svg-12 text-transparent max-sm:mx-auto', {
                    active: currentType === CompositionType.CIRCULAR
                  })}
                  width={22}
                  height={21}
                  viewBox='0 0 25 24'>
                  <path d='M2.85759 8.2408C2.06568 10.1923 1.88217 12.4052 2.4671 14.5882C3.89578 19.9201 9.38263 23.0879 14.7145 21.6592C20.0465 20.2305 23.2143 14.7437 21.7856 9.41177C20.3569 4.07986 14.8701 0.912022 9.53816 2.3407' />
                  <path d='M5.20071 13.0288C5.76951 16.8568 9.32556 19.4928 13.1535 18.924C16.9815 18.3552 19.6175 14.7991 19.0487 10.9712C18.4799 7.14319 14.9238 4.50722 11.0959 5.07602' />
                  <path d='M11.625 16C13.835 16 15.625 14.21 15.625 12C15.625 9.79 13.835 8 11.625 8' />
                </SVG>

                <span className='text-base max-sm:text-sm'>{t('labelComponentSpiral')}</span>
              </button>

              <button
                className={cls(
                  'btn gap-2 rounded-xl border-2 border-solid px-6 py-3 max-sm:grid-flow-row max-sm:gap-1 max-sm:px-2 max-sm:py-4',
                  currentType === CompositionType.LINEAR ? 'border-yellow-400' : 'border-neutral-200'
                )}
                type='button'
                onClick={() => handleTab(CompositionType.LINEAR)}>
                <SVG
                  className={cls('svg-12 text-transparent max-sm:mx-auto', {
                    active: currentType === CompositionType.LINEAR
                  })}
                  width={22}
                  height={2}
                  viewBox='0 0 22 2'>
                  <path d='M1.625 1H21.125' />
                </SVG>
                <span className='text-base max-sm:text-sm'>{t('labelComponentLinear')}</span>
              </button>

              <button
                className={cls(
                  'btn gap-2 rounded-xl border-2 border-solid px-6 py-3 max-sm:grid-flow-row max-sm:gap-1 max-sm:px-2 max-sm:py-4',
                  currentType === CompositionType.SPIRAL ? 'border-yellow-400' : 'border-neutral-200'
                )}
                type='button'
                onClick={() => handleTab(CompositionType.SPIRAL)}>
                <SVG
                  className={cls('svg-12 text-transparent max-sm:mx-auto', {
                    active: currentType === CompositionType.SPIRAL
                  })}
                  width={22}
                  height={21}
                  viewBox='0 0 25 24'>
                  <circle cx='12.125' cy='12' r='10.75' />
                  <circle cx='12.125' cy='12' r='5.75' />
                </SVG>

                <span className='text-base max-sm:text-sm'>{t('labelComponentCircular')}</span>
              </button>
            </div>
          </div>
        </div>

        <div
          className='mx-auto mt-10 max-w-[64rem] overflow-hidden rounded-sm bg-neutral-100 p-24 max-sm:overflow-auto max-sm:pb-8 max-sm:pr-8'
          ref={nodeRef}>
          <div className='relative m-auto size-[485px]'>
            <img
              className='pointer-events-none absolute inset-x-0 top-[-5rem] mx-auto max-w-md'
              src='/static/images/4005.png'
              width={445}
              height={31}
            />

            <img
              className='pointer-events-none absolute left-[-5rem] top-2/4'
              src='/static/images/4006.png'
              width={33}
              height={445}
              style={{ transform: 'translateY(-50%)' }}
            />

            <div className='relative size-full'>
              {composition?.map((record, index) => (
                <div
                  className={cls(
                    'grid-composition',
                    'absolute block size-1.5 cursor-pointer rounded-full bg-neutral-400',
                    {
                      active: record?.isSelected
                    }
                  )}
                  style={{ top: record.top, left: record.left }}
                  key={index}
                  onClick={() => handleClick(record)}
                />
              ))}

              {currentSelected.length > 1 && (
                <>
                  <div className='pointer-events-none select-none' aria-label='ruler-x'>
                    {ruler.x.map((r, index) => (
                      <div
                        className='absolute -bottom-8 border-r border-dashed border-zinc-400'
                        style={{ top: r.top, left: r.left + 3 }}
                        key={index}
                      />
                    ))}

                    {
                      <div
                        className='absolute -bottom-12 h-4 border-t-2 border-t-theme'
                        style={{
                          left: ruler.x[0].left + 4,
                          width: ruler.x[1].left - ruler.x[0].left
                        }}>
                        <div className='pt-2 text-center text-xs font-bold'>
                          {(((ruler.x[1].left - ruler.x[0].left) * 250) / 485).toFixed(0)} CM
                        </div>
                      </div>
                    }
                  </div>

                  {ruler?.y && (
                    <div className='pointer-events-none select-none' aria-label='ruler-y'>
                      {ruler.y.map((r, index) => (
                        <div
                          className='absolute -right-8 border-t border-dashed border-zinc-400'
                          style={{ top: r.top + 3, left: r.left }}
                          key={index}
                        />
                      ))}

                      {
                        <div
                          className='absolute -right-12 flex w-4 border-l-2 border-l-theme'
                          style={{
                            top: ruler.y[0].top + 4,
                            height: ruler.y[1].top - ruler.y[0].top
                          }}>
                          <div className='-rotate-90 self-center text-nowrap text-xs font-bold'>
                            {(((ruler.y[1].top - ruler.y[0].top) * 250) / 485).toFixed(0)} CM
                          </div>
                        </div>
                      }
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ActionsComponent nextIsDisabled={!currentSelected.length} onNext={handleNext} />
    </div>
  )
}
