import { useEffect, useState, useRef, useMemo } from 'react'
import { CSSTransition } from 'react-transition-group'
import { isAfter } from 'date-fns'
import cls from 'classnames'

import type { Notice } from '@/types/addon'
import { getCurrentContant } from './register'
import { SVG } from '@/components/svgs'

interface Props {
  record: Notice
  onRemove: (notice: Notice) => void
}

export function NoticeItem({ record, onRemove }: Props) {
  // __STATE <Next.14>
  const nodeRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState<boolean>(false)

  const path = useMemo(() => {
    switch (record.type) {
      case 'info':
        return (
          <>
            <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z' />
            <path d='m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z' />
          </>
        )

      case 'success':
        return (
          <>
            <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z' />
            <path d='M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z' />
          </>
        )

      case 'warn':
      case 'error':
        return (
          <>
            <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z' />
            <path d='M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z' />
          </>
        )
    }
  }, [record.type])

  // __EFFECT's
  useEffect(() => {
    setVisible(Boolean(record.visible))

    let intervalId: NodeJS.Timeout
    if (record.duration) {
      const duration = record.duration
      intervalId = setInterval(() => {
        if (isAfter(Date.now(), duration)) {
          clearInterval(intervalId)
          setVisible(false)
        }
      }, 250)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [record])

  // __RENDER
  return (
    <CSSTransition nodeRef={nodeRef} in={visible} timeout={320} unmountOnExit onExited={() => onRemove(record)}>
      <div
        className='ui--notice-item pointer-events-auto relative ml-auto grid w-fit min-w-[275px] max-w-[425px] grid-cols-[40px_1fr] overflow-hidden rounded-md transition-all'
        ref={nodeRef}
      >
        <div className={cls('ui--notice-type', 'grid items-start justify-center bg-white/75 py-4', record.type)}>
          <SVG>{path}</SVG>
        </div>

        <div className='ui--notice-content bg-white/90 py-3 pl-4 pr-9'>
          <h4 className='text-sm font-bold'>{record.title}</h4>
          <div className='mt-1 text-xs text-neutral-700'>{getCurrentContant(record)}</div>
        </div>

        <div className='ui--notice-close absolute right-0 top-0 z-[1] pr-1 pt-1'>
          <button
            className='btn h-7 w-7 p-0 text-neutral-600 hover:text-rose-500'
            title='Close'
            type='button'
            onClick={() => setVisible(false)}
          >
            <span className='bi bi-x-lg text-xs'></span>
          </button>
        </div>
      </div>
    </CSSTransition>
  )
}
