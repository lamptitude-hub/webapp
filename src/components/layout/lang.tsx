'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import cls from 'classnames'

import { useTranslate } from '@/hooks'
import { Locales } from '@/types'

export function ButtonLang() {
  // __STATE's
  const { lang, switch: s } = useTranslate()

  const nodeRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<boolean>(false)

  const locale = useMemo(() => {
    return {
      'en-US': 'EN',
      'th-TH': 'TH'
    }[lang]
  }, [lang])

  const lists = useMemo(() => {
    return [
      { label: 'Thai (ภาษาไทย)', key: 'th-TH' },
      { label: 'English (US)', key: 'en-US' }
    ].map((r) => ({ ...r, active: r.key === lang }))
  }, [lang])

  // __FUNCTION's
  const handleClick = useCallback(
    (key: Locales | string) => {
      setActive(false)
      s(key as Locales)
    },
    [s]
  )

  // __EFFECT's
  useClickAway(nodeRef, () => setActive(false), ['click'])

  // __RENDER
  return (
    <div className='relative' ref={nodeRef}>
      <button className='btn bg-primary p-2 hover:underline' onClick={() => setActive(!active)}>
        <span className='text text-base font-bold'>{locale}</span>
      </button>

      {active && (
        <div className='absolute right-0 top-11 min-w-36 rounded-lg bg-white drop-shadow-md'>
          <ul className='ul p-2'>
            {lists.map((record, key) => (
              <li className='li' key={key}>
                <button
                  className={cls(
                    'btn h-8 text-nowrap rounded-lg px-2 text-sm',
                    record.active ? 'font-semibold text-gray-800' : 'text-gray-600'
                  )}
                  onClick={() => handleClick(record.key)}
                >
                  <span className='text'>{record.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
