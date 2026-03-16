'use client'

import cls from 'classnames'
import { pick } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ItemGroup } from '@/constants'
import { useTranslate } from '@/hooks'
import type { Dataset, State, UpdateClusterValues } from '@/libs/core.type'
import type { Item } from '@/types/schema'
import { roundUpTo } from '@/utils'

import { ItemComponent } from './item'

type FormState = Pick<Dataset, 'itemId' | 'wireLength' | 'rotation'>

type Props = {
  state: State
  data: Dataset
  items: Item[]
  onApply?: (uuid: string, values: UpdateClusterValues) => void
  onClose?: () => void
}

export function AsideSubComponent({ state, data, items, ...rest }: Props) {
  // __STATE's
  const { t } = useTranslate()
  const { register, getValues, setValue, watch } = useForm<FormState>({
    defaultValues: pick(data, ['itemId', 'wireLength', 'rotation'])
  })

  const [currentModel, setCurrentModel] = useState<Item>(() => {
    const currentItem = items.find((r) => r.id === data.itemId)!
    return items.find((r) => r.vid === currentItem.vid && r.group === ItemGroup.MODEL)!
  })

  const [models, colors] = useMemo(() => {
    const currentItem = items.find((r) => r.id === watch('itemId'))!

    const models = items.filter((r) => r.group === ItemGroup.MODEL)
    const colors = items.filter((r) => r.vid === currentItem.vid && r.group === ItemGroup.COLOR)

    return [models, colors]
  }, [items, watch('itemId')])

  const maxWireLength = useMemo(() => {
    let value = state.ceiling - roundUpTo(data.modelSize.y, 5)
    value -= state.table?.isActive ? state.table.height + 10 : 10
    return value
  }, [state, data])

  // __FUNCTION's
  const handleChooseModel = useCallback(
    (model: Item) => {
      setCurrentModel(model)

      const colors = items.filter((r) => r.vid === model.vid && r.group === ItemGroup.COLOR)
      if (colors.length > 0) {
        const { id } = colors[0]
        setValue('itemId', id)

        if (rest?.onApply) rest.onApply(data.uuid, { itemId: id })
      }
    },
    [data, items, rest?.onApply]
  )

  // __EFFECT's
  useEffect(() => {
    if (maxWireLength && maxWireLength < getValues('wireLength')) {
      setValue('wireLength', maxWireLength)
    }
  }, [maxWireLength])

  // __RENDER
  return (
    <>
      <div className='ui--labs-panel-header bg-white/50 px-6 py-4'>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-xl font-semibold'>{t('labelEditLamp')}</h2>

          <button className='btn text-zinc-500 hover:text-red-600' type='button' onClick={rest.onClose}>
            <span className='bi bi-arrow-left-short text-2xl'></span>
          </button>
        </div>
      </div>

      <div className='ui--labs-panel-body overflow-y-auto'>
        <div className='grid gap-8'>
          <div className='grid gap-4'>
            <div className='flex items-center justify-between gap-2'>
              <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelWireLength')}</label>
              <span className='text-sm font-semibold'>{watch('wireLength')} cm</span>
            </div>

            <input
              type='range'
              min={10}
              step={5}
              max={maxWireLength}
              {...register('wireLength', {
                min: 10,
                max: maxWireLength,
                valueAsNumber: true,
                onChange: ({ target }) => {
                  if (rest?.onApply) rest.onApply(data.uuid, { wireLength: +target.value })
                  return null
                }
              })}
            />
          </div>

          <div className='grid gap-4'>
            <div className='flex items-center justify-between gap-2'>
              <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelRotateLamp')}</label>
              <span className='text-sm font-semibold'>{watch('rotation') || 0}°</span>
            </div>

            <input
              type='range'
              step={5}
              min={0}
              max={180}
              {...register('rotation', {
                value: 0,
                min: 0,
                max: 180,
                valueAsNumber: true,
                onChange: ({ target }) => {
                  if (rest?.onApply) rest.onApply(data.uuid, { rotation: +target.value })
                  return null
                }
              })}
            />
          </div>

          <div className='grid gap-2'>
            <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelLampStyle')}</label>
            <div className='grid grid-cols-4 justify-start gap-4'>
              {models.map((record, index) => (
                <ItemComponent
                  key={index}
                  name={record?.name}
                  image={record.poster}
                  isActive={record.id === currentModel.id}
                  onClick={() => handleChooseModel(record)}
                />
              ))}
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='whitespace-nowrap text-sm text-zinc-600'>{t('labelLampColor')}</label>
            <div className='grid grid-cols-5 justify-start gap-4'>
              {colors.map((record, index) => (
                <button
                  className={cls(
                    'aspect-square overflow-hidden rounded-full',
                    record.id === watch('itemId') ? 'ring-2 ring-theme' : 'opacity-80 hover:opacity-100'
                  )}
                  type='button'
                  key={index}
                  onClick={() => {
                    if (rest?.onApply) rest.onApply(data.uuid, { itemId: record.id })
                    setValue('itemId', record.id)
                  }}>
                  <img className='aspect-square w-full object-cover object-center' src={record.poster} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='ui--labs-panel-footer bg-white/50 px-6 py-4'>
        <div className='flex gap-2'>
          <button
            className='btn h-10 w-full bg-zinc-100 hover:bg-zinc-200'
            type='button'
            onClick={rest?.onClose}>
            <span className='font-semibold capitalize'>{t('btnPrev')}</span>
          </button>
        </div>
      </div>
    </>
  )
}
