'use client'

import { useCallback } from 'react'

import { setNotice } from '@/store/app.store'
import { useDispatch, useSelector } from '@/store'
import type { Notice } from '@/types/addon'

import { NoticeItem } from './item'

export default function NoticeContainer() {
  // __STATE <Next.14>
  const dispatch = useDispatch()
  const notices = useSelector(({ app }) => app.notice)

  // __FUNCTION's
  const handleRemove = useCallback((notice: Notice) => {
    const payload: Notice = {
      ...notice,
      name: `rm:${notice.name}`,
      visible: false
    }

    dispatch(setNotice(payload))
  }, [])

  // __RENDER
  if (!notices) return null
  return (
    <div className='ui--notice pointer-events-none fixed right-8 top-8 z-50'>
      {Object.values(notices).map((record, index) => (
        <NoticeItem key={index} record={record} onRemove={handleRemove} />
      ))}
    </div>
  )
}
