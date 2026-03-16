import { ReactNode, useEffect, useRef, useState } from 'react'
import { modal } from '@/utils/addon'

interface Props {
  title: string
  children: ReactNode
}

export function ModalComponent({ title, children }: Props) {
  // __STATE <Next.14>
  const nodeRef = useRef<HTMLDivElement>(null)
  const [vid, setVid] = useState<string>('')

  // __EFFECT's
  useEffect(() => {
    if (nodeRef.current) {
      const target = nodeRef.current.parentElement!
      setVid(target.dataset.vid!)
    }
  }, [nodeRef])

  // __RENDER
  return (
    <>
      <div
        className='relative grid select-none grid-cols-[1fr_auto] items-center gap-8 rounded-t-xl bg-white'
        ref={nodeRef}
      >
        <div className='text-base font-bold text-black'>{title}</div>

        <button className='btn h-6 w-6' title='Close.' onClick={() => modal.off(vid)}>
          <span className='bi bi-x-lg text-sm text-rose-600'></span>
        </button>
      </div>

      {children}
    </>
  )
}
