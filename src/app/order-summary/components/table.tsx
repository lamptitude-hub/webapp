'use client'

import cls from 'classnames'
import { sortBy } from 'lodash'

import { CanopyType } from '@/constants'
import { useTranslate } from '@/hooks'
import type { State } from '@/libs/core.type'
import type { Canopy, Product } from '@/types/schema'
import { storage } from '@/utils/storage'

type Props = {
  state: State
  canopy: Canopy
  product: Product
  isPrint?: boolean
}

export function TableComponent({ state, canopy, product, ...rest }: Props) {
  // __STATE's
  const { t } = useTranslate()

  // __FUNCTION's
  const getItemName = (id: string) => {
    const item = product.items?.find((r) => r.id === id)
    return item?.name || '-'
  }

  // __RENDER
  return (
    <div className='ui--summary-table py-8 max-sm:py-4'>
      <div
        className={cls(
          'rows mb-8 max-sm:mb-4',
          rest?.isPrint ? 'block' : 'grid grid-flow-col items-start gap-8 max-sm:grid-flow-row max-sm:gap-4'
        )}>
        <div className={cls({ hidden: rest?.isPrint })}>
          <img className='object-cover object-center' src={storage.get('aria-image') as string} />
        </div>

        <div className={cls('rows my-2 sm:my-8', { hidden: !rest?.isPrint })}>
          <img
            className='block max-h-36 max-w-96 object-contain object-left max-sm:mx-auto'
            src={`/static/images/canopies/NS-${canopy.name}.png`}
            alt=''
          />
        </div>

        <div className='ui--table table w-full'>
          <div className='thead'>
            <div className='tr'>
              <div className='td capitalize'>{t('labelNo')}</div>
              <div className='td'>{t('labelProductCode')}</div>
              <div className='td'>{t('labelColor')}</div>
              <div className='td'>{t('labelWire')}</div>
            </div>
          </div>

          <div className='tbody'>
            {sortBy(state.dataset, ['sorting']).map((record, index) => (
              <div className='tr' key={index}>
                <div className='td'>{index + 1}.</div>
                <div className='td uppercase'>{getItemName(record.itemId)}</div>
                <div className='td uppercase'>black</div>
                <div className='td'>{record.wireLength} cm</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cls(
          'rows',
          rest?.isPrint ? 'block' : 'grid grid-flow-col items-start gap-8 max-sm:grid-flow-row max-sm:gap-4'
        )}>
        <div
          className={cls('grid items-start justify-center', {
            'mb-8 hidden h-[320px]': rest?.isPrint,
            'opacity-0': canopy.type === CanopyType.MULTI
          })}>
          <img
            className='block h-full object-contain object-center'
            src={storage.get('img-composition') || ''}
          />
        </div>

        <div className='ui--table table w-full'>
          <div className='thead'>
            <div className='tr'>
              <div className='td capitalize'>{t('labelNo')}</div>
              <div className='td'>{t('labelCanopyType')}</div>
              <div className='td'>{t('labelQuantity')}</div>
              <div className='td'>{t('labelColor')}</div>
            </div>
          </div>

          <div className='tbody'>
            <div className='tr'>
              <div className='td'>1.</div>
              <div className='td capitalize'>{canopy.name}</div>
              <div className='td'>{canopy.type === CanopyType.SINGLE ? canopy.grid?.length : 1}</div>
              <div className='td capitalize'>{state.canopyColor}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={cls('rows ml-60 mt-4', { hidden: rest?.isPrint })}>
        <img
          className='block max-h-32 max-w-80 object-contain object-left max-sm:mx-auto'
          src={`/static/images/canopies/NS-${canopy.name}.png`}
          alt=''
        />
      </div>

      <div className='rows mt-12'>
        <h4 className='mb-1.5 text-lg font-bold'>Lamptitude</h4>
        <p className='text-sm font-light'>
          299/1 Sukhumvit 63 (Ekamai) Rd, Klongton-Nua
          <br />
          Wattana Bangkok Thailand 10110
          <br />
          T+ (02)392 6371-5 / E+ info@lmptitude.net
        </p>
      </div>
    </div>
  )
}
