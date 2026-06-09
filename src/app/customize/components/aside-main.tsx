'use client'

import cls from 'classnames'
import { clone, pick, shuffle } from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ItemGroup } from '@/constants'
import { useTranslate } from '@/hooks'
import type { Dataset, State, TableData, TableType, UpdateDistanceValues } from '@/libs/core.type'
import type { Canopy, Item, Product } from '@/types/schema'
import { clampMinMax, createCycler } from '@/utils'
import { Arrs } from '@/utils/array'

import { ItemComponent } from './item'
import { ButtonSave } from './save'

type FormState = Pick<
  State,
  'ceiling' | 'canopyColor' | 'clusterHeight' | 'distanceFromFloor' | 'distanceFromTable' | 'table'
>

type Props = {
  state: State
  product: Product
  canopy: Canopy
  onSave?: () => void
  onClose?: () => void
  onUpdateDistance?: (values: UpdateDistanceValues) => void
  onUpdateTable?: (action: string, payload: TableData) => void
  onUpdateClusters?: (payload: Dataset[], isMixing?: boolean) => void
  onUpdateCanopy?: (color: string) => void
}

export function AsideMainComponent({ state, product, canopy, ...rest }: Props) {
  // __STATE's
  const router = useRouter()
  const { t } = useTranslate()

  const { register, getValues, setValue, watch } = useForm<FormState>({
    defaultValues: pick(state, [
      'ceiling',
      'canopyColor',
      'clusterHeight',
      'distanceFromFloor',
      'distanceFromTable',
      'table'
    ])
  })

  const items = product?.items || []
  const [selected, setSelected] = useState<string[]>(() =>
    !state?.isMixing
      ? items.filter((r) => state.dataset.map((r) => r.itemId).includes(r.id)).map((r) => r.vid)
      : []
  )

  const models = useMemo(() => items.filter((r) => r.group === ItemGroup.MODEL), [items])

  // __FUNCTION's
  const handleFocusOut = useCallback(
    (field: keyof UpdateDistanceValues) => {
      const data = pick(state, ['ceiling', 'clusterHeight', 'distanceFromFloor', 'distanceFromTable'])

      let ceiling = getValues('ceiling')
      let clusterHeight = getValues('clusterHeight')
      let distanceFromFloor = getValues('distanceFromFloor')
      let distanceFromTable = getValues('distanceFromTable')
      let table = getValues('table')

      const longestModelSizeY = Math.max(...state.dataset.map((r) => r.modelSize?.y))

      if (field === 'ceiling') {
        const min = table?.isActive ? clusterHeight + table.height + 10 : 100

        data.ceiling = Math.min(Math.max(ceiling, min), 1000)
        data.distanceFromFloor = data.ceiling - clusterHeight
        if (table?.isActive) data.distanceFromTable = data.ceiling - table.height - clusterHeight
      }

      if (field === 'clusterHeight') {
        const [min, max] = [
          longestModelSizeY + 10,
          table?.isActive ? ceiling - table.height - 10 : ceiling - 100
        ]

        data.clusterHeight = Math.min(Math.max(clusterHeight, min), max)
        data.distanceFromFloor = ceiling - data.clusterHeight
        if (table?.isActive) data.distanceFromTable = ceiling - table.height - data.clusterHeight
      }

      if (field === 'distanceFromFloor') {
        data.distanceFromFloor = Math.min(Math.max(distanceFromFloor, 10), clusterHeight)
        data.clusterHeight = ceiling - data.distanceFromFloor
        data.distanceFromTable = ceiling - table.height - data.clusterHeight
      }

      if (field === 'distanceFromTable') {
        const max = ceiling - table.height - longestModelSizeY

        data.distanceFromTable = Math.min(Math.max(distanceFromTable, 10), max + 10)
        data.clusterHeight = ceiling - table.height - data.distanceFromTable
        data.distanceFromFloor = ceiling - data.clusterHeight
      }

      setValue('ceiling', data.ceiling)
      setValue('clusterHeight', data.clusterHeight)
      setValue('distanceFromFloor', data.distanceFromFloor)
      setValue('distanceFromTable', data.distanceFromTable)

      console.table(data)
      if (rest?.onUpdateDistance) rest.onUpdateDistance(data)
    },
    [state, rest?.onUpdateDistance]
  )

  const handleTableChange = useCallback(
    (type?: TableType) => {
      if (!rest?.onUpdateTable) return void 0

      let table = getValues('table')
      table.isActive = !!type

      if (type) {
        table.type = type

        switch (type) {
          case 'rectangular-table':
            table = {
              ...table,
              legs: [
                { x: 0, z: 0 },
                { x: 0, z: 0 },
                { x: 0, z: 0 },
                { x: 0, z: 0 }
              ]
            }
            break

          case 'square-table':
          case 'round-table':
            table = {
              ...table,
              legs: [{ x: 0, z: 0 }]
            }
            break
        }
      }

      setValue('table', table)

      if (table?.isActive) {
        setTimeout(() => {
          handleFocusOut('distanceFromTable')
        }, 100)

        rest.onUpdateTable('create', table)
      } else {
        rest.onUpdateTable('remove', table)
      }
    },
    [state, rest?.onUpdateTable]
  )

  const handleTableSizeChange = useCallback(() => {
    if (!rest?.onUpdateTable) return void 0

    const table = getValues('table')
    table.height = Math.min(
      Math.max(20, table.height),
      Math.min(150, state.ceiling - (state.clusterHeight + 10))
    )
    table.width = Math.min(Math.max(table.width, 60), 250)
    table.depth = Math.min(Math.max(table.depth, 60), 250)

    setValue('table', table)

    const ceiling = getValues('ceiling')
    const clusterHeight = getValues('clusterHeight')
    if (table.height + clusterHeight > ceiling - 10) {
      setTimeout(() => {
        handleFocusOut('distanceFromTable')
      }, 100)
    }

    rest.onUpdateTable('create', table)
  }, [state, rest?.onUpdateTable, handleFocusOut])

  const handleModelChoose = useCallback(
    (vid: string) => {
      const vids = selected.includes(vid)
        ? selected.length > 1
          ? selected.filter((r) => r !== vid)
          : selected
        : selected.length < 3
          ? [...selected, vid]
          : selected

      setSelected(vids)

      const list: Item[] = items.filter((item) => vids.includes(item.vid) && item.group === ItemGroup.COLOR)
      const dataset = state.dataset.map((r) => ({
        ...r,
        itemId: shuffle(list)[0].id
      }))

      if (rest?.onUpdateClusters) rest.onUpdateClusters(dataset, false)
    },
    [state, items, selected, rest?.onUpdateClusters]
  )

  const handleMixingModel = useCallback(() => {
    setSelected([])

    const objects = new Map<string, Item>()
    for (const item of items) {
      if (objects.has(item.vid)) continue
      if (item.group === ItemGroup.COLOR && item.object3D) {
        objects.set(item.vid, item)
      }
    }

    const models = objects.values().toArray()
    const cycler = createCycler(shuffle(models))
    const dataset = state.dataset.map((r) => ({
      ...r,
      itemId: cycler().id
    }))

    if (rest?.onUpdateClusters) rest.onUpdateClusters(dataset, true)
  }, [state, items, canopy, rest?.onUpdateClusters])

  const handleCanopyChange = useCallback(
    (color: string) => {
      if (rest?.onUpdateCanopy) {
        setValue('canopyColor', color)
        rest.onUpdateCanopy(color)
      }
    },
    [rest?.onUpdateCanopy]
  )

  const handleBulbs = useCallback(
    (action: 'minus' | 'plus') => {
      let dataset = state.dataset
      let bulbs = state.bulbs

      if (action === 'plus') {
        bulbs = clampMinMax(bulbs + 1, 1, state.maxBulbs)

        const target = clone(dataset[bulbs - 3] || dataset[0])
        dataset.push(target)

        if (bulbs > 1 && state.isMixing) {
          const objects = new Map<string, Item>()
          for (const item of items) {
            if (objects.has(item.vid)) continue
            if (item.group === ItemGroup.COLOR && item.object3D) {
              objects.set(item.vid, item)
            }
          }

          const models = objects.values().toArray()
          const cycler = createCycler(shuffle(models))
          dataset = dataset.map((r) => ({
            ...r,
            itemId: cycler().id
          }))
        }
      } else if (action === 'minus') {
        bulbs = clampMinMax(bulbs - 1, 1, state.maxBulbs)
        dataset = dataset.slice(0, bulbs)
      }

      if (rest?.onUpdateClusters) rest.onUpdateClusters(dataset, true)
    },
    [state, items, rest?.onUpdateClusters]
  )

  // __EFFECT's
  useEffect(() => {
    setValue('clusterHeight', state.clusterHeight)
    setValue('distanceFromFloor', state.distanceFromFloor)
    setValue('distanceFromTable', state.distanceFromTable)
  }, [state])

  // __RENDER
  return (
    <>
      <div className='ui--labs-panel-header bg-white/50 px-6 py-4'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-xl font-semibold'>{t('btnSetting')}</h2>

          <button className='btn text-zinc-500 hover:text-red-600' type='button' onClick={rest.onClose}>
            <span className='bi bi-x text-2xl'></span>
          </button>
        </div>
      </div>

      <div className='ui--labs-panel-body overflow-y-auto'>
        <form className='ui--labs-panel-form grid gap-8'>
          <div className='rows grid gap-4'>
            <div className='grid gap-2'>
              <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelCeilingHeight')}</label>
              <div className='relative rounded-lg border border-solid border-zinc-200'>
                <input
                  className='h-10 w-full pl-4 pr-9 font-bold'
                  type='number'
                  {...register('ceiling', { valueAsNumber: true })}
                  onBlur={() => handleFocusOut('ceiling')}
                />
                <small className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500'>
                  cm
                </small>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelElementHeight')}</label>
                <div className='relative rounded-lg border border-solid border-zinc-200'>
                  <input
                    className='h-10 w-full pl-4 pr-9 font-bold'
                    type='number'
                    {...register('clusterHeight', { valueAsNumber: true })}
                    onBlur={() => handleFocusOut('clusterHeight')}
                  />
                  <small className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500'>
                    cm
                  </small>
                </div>
              </div>

              {watch('table.isActive') ? (
                <div className='grid gap-2' key={105}>
                  <label className='whitespace-nowrap text-sm text-zinc-600'>
                    {t('labelTableClearance')}
                  </label>
                  <div className='relative rounded-lg border border-solid border-zinc-200'>
                    <input
                      className='h-10 w-full pl-4 pr-9 font-bold'
                      type='number'
                      {...register('distanceFromTable', { valueAsNumber: true })}
                      onBlur={() => handleFocusOut('distanceFromTable')}
                    />
                    <small className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500'>
                      cm
                    </small>
                  </div>
                </div>
              ) : (
                <div className='grid gap-2' key={106}>
                  <label className='whitespace-nowrap text-sm text-zinc-600'>
                    {t('labelFloorClearance')}
                  </label>
                  <div className='relative rounded-lg border border-solid border-zinc-200'>
                    <input
                      className='h-10 w-full pl-4 pr-9 font-bold'
                      type='number'
                      {...register('distanceFromFloor', { valueAsNumber: true })}
                      onBlur={() => handleFocusOut('distanceFromFloor')}
                    />
                    <small className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500'>
                      cm
                    </small>
                  </div>
                </div>
              )}
            </div>

            {canopy.name.toUpperCase().includes('-LINEAR-') ? (
              <div className='grid gap-2'>
                <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelMaxOfLamp')}</label>
                <div className='relative flex items-center justify-between rounded-lg border border-solid border-zinc-200 px-1'>
                  <button
                    className='btn size-8 hover:bg-zinc-200'
                    type='button'
                    disabled={state.bulbs < 2}
                    onClick={() => handleBulbs('minus')}>
                    <span className='icon bi bi-dash text-xl leading-none' />
                  </button>

                  <div className='flex h-10 items-center justify-center px-2'>
                    <span className='font-bold'>{state.bulbs}</span>
                    <span className='px-1 font-light text-zinc-400'>/</span>
                    <span className='text-zinc-400'>{state.maxBulbs}</span>
                  </div>

                  <button
                    className='btn size-8 hover:bg-zinc-200'
                    type='button'
                    disabled={state.bulbs >= state.maxBulbs}
                    onClick={() => handleBulbs('plus')}>
                    <span className='icon bi bi-plus text-xl leading-none' />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <hr className='border-zinc-200' />

          <div className='rows grid gap-4'>
            <div className='grid grid-cols-2 gap-4'>
              <button
                className={cls(
                  'btn h-10 gap-2 rounded-lg border border-solid px-2',
                  !watch('table.isActive') ? 'border-theme bg-white/50' : 'border-neutral-200'
                )}
                type='button'
                onClick={() => handleTableChange()}>
                <span className='text-base font-semibold'>{t('labelFreeSuspension')}</span>
              </button>

              <button
                className={cls(
                  'btn h-10 gap-2 rounded-lg border border-solid px-2',
                  watch('table.isActive') ? 'border-theme bg-white/50' : 'border-neutral-200'
                )}
                type='button'
                onClick={() => handleTableChange('square-table')}>
                <span className='text-base font-semibold'>{t('labelHangingOnTheTable')}</span>
              </button>
            </div>

            {watch('table.isActive') && (
              <>
                <div className='grid gap-2'>
                  <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelTableShape')}</label>

                  <div className='mt-2 flex gap-2'>
                    <button
                      className={cls(
                        'btn aspect-square size-16 rounded-lg border border-solid',
                        watch('table.type') === 'square-table' ? 'border-theme' : 'border-neutral-200'
                      )}
                      type='button'
                      onClick={() => handleTableChange('square-table')}>
                      <div className='block h-8 w-8 border-2 border-solid border-neutral-300/75'></div>
                    </button>

                    <button
                      className={cls(
                        'btn aspect-square size-16 rounded-lg border border-solid',
                        watch('table.type') === 'rectangular-table' ? 'border-theme' : 'border-neutral-200'
                      )}
                      type='button'
                      onClick={() => handleTableChange('rectangular-table')}>
                      <div className='block h-6 w-10 border-2 border-solid border-neutral-300/75'></div>
                    </button>

                    <button
                      className={cls(
                        'btn aspect-square size-16 rounded-lg border border-solid',
                        watch('table.type') === 'round-table' ? 'border-theme' : 'border-neutral-200'
                      )}
                      type='button'
                      onClick={() => handleTableChange('round-table')}>
                      <div className='block h-8 w-8 rounded-full border-2 border-solid border-neutral-300/75'></div>
                    </button>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelTableHeight')}</label>
                    <div className='relative rounded-lg border border-solid border-zinc-200'>
                      <input
                        className='h-10 w-full pl-4 pr-9 font-bold'
                        type='number'
                        min={60}
                        max={250}
                        {...register('table.height', { valueAsNumber: true })}
                        onBlur={() => handleTableSizeChange()}
                      />
                      <small className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500'>
                        cm
                      </small>
                    </div>
                  </div>

                  <div className='grid gap-2'>
                    <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelTableLength')}</label>
                    <div className='relative rounded-lg border border-solid border-zinc-200'>
                      <input
                        className='h-10 w-full pl-4 pr-9 font-bold'
                        type='number'
                        min={60}
                        max={250}
                        {...register('table.width', { valueAsNumber: true })}
                        onBlur={() => handleTableSizeChange()}
                      />
                      <small className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500'>
                        cm
                      </small>
                    </div>
                  </div>

                  {watch('table.type') === 'rectangular-table' && (
                    <div className='grid gap-2' key={112}>
                      <label className='whitespace-nowrap text-sm text-zinc-600'>
                        {t('labelTableWidth')}
                      </label>
                      <div className='relative rounded-lg border border-solid border-zinc-200'>
                        <input
                          className='h-10 w-full pl-4 pr-9 font-bold'
                          type='number'
                          min={60}
                          max={250}
                          {...register('table.depth', { valueAsNumber: true })}
                          onBlur={() => handleTableSizeChange()}
                        />
                        <small className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500'>
                          cm
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <hr className='border-zinc-200' />

          <div className='rows grid gap-2'>
            <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelLampStyle')}</label>

            <div className='grid grid-cols-4 justify-start gap-4'>
              {models.map((record, index) => (
                <ItemComponent
                  key={index}
                  name={record?.name}
                  image={record.poster}
                  isActive={selected.includes(record.vid)}
                  isDisable={
                    (selected.length < 2 && selected.includes(record.vid)) ||
                    (selected.length > 2 && !selected.includes(record.vid))
                  }
                  onClick={() => handleModelChoose(record.vid)}
                />
              ))}

              {models.length > 1 && product?.mixingPoster && (
                <ItemComponent
                  key='.mixing'
                  name='Mixing'
                  image={product?.mixingPoster || ''}
                  isActive={state?.isMixing}
                  onClick={handleMixingModel}
                />
              )}
            </div>
          </div>

          <hr className='border-zinc-200' />

          <div className='rows grid gap-2'>
            <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelChooseCanopyColor')}</label>

            <ul className='flex gap-4'>
              {canopy.dataset.map((record, index) => (
                <li className='' key={index}>
                  <button
                    className='cursor-pointer text-center'
                    type='button'
                    onClick={() => handleCanopyChange(record.color)}>
                    <div
                      className={cls(
                        'canopy-color',
                        record.color.toUpperCase(),
                        'mx-auto size-12 rounded-full ring-2',
                        record.color === watch('canopyColor') ? 'ring-yellow-400' : 'ring-neutral-200'
                      )}
                    />
                    <p
                      className={cls('mt-1 text-[10px] font-medium', {
                        'text-zinc-600': record.color !== watch('canopyColor')
                      })}>
                      {record.color}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </form>
      </div>

      <div className='ui--labs-panel-footer bg-white/50 px-6 py-4'>
        <div className='grid grid-cols-2 gap-4'>
          <button className='btn h-10 bg-zinc-100 hover:bg-zinc-200' type='button' onClick={router.back}>
            <span className='text font-semibold capitalize'>{t('btnPrev')}</span>
          </button>

          <ButtonSave onSave={rest?.onSave} />
        </div>
      </div>
    </>
  )
}
