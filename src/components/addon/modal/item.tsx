import { ReactNode, useEffect, useRef, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import cls from 'classnames'

interface Props {
  index: number
  className?: string
  vid: string
  visible: boolean
  children: ReactNode
  onExited: (vid: string) => void
}

export function ModalItem({ vid, index, visible, className, children, onExited }: Props) {
  // __STATE <Next.14>
  const nodeRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState(false)

  // __EFFECT's
  useEffect(() => {
    let timeoutId = setTimeout(() => setState(visible), 64)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [visible])

  // __RENDER
  return (
    <CSSTransition nodeRef={nodeRef} in={state} timeout={320} unmountOnExit onExited={() => onExited(vid)}>
      <div
        className={cls(
          'ui--modal-wrapper',
          'fixed inset-0 z-40 grid items-start overflow-x-hidden bg-black/40 p-8  max-sm:p-4',
          className
        )}
        style={{ zIndex: 40 + index }}
        ref={nodeRef}
      >
        <div
          className='ui--modal-container relative mx-auto min-w-[256px] translate-y-[-10px] opacity-0 transition-all  max-sm:w-full'
          data-vid={vid}
        >
          {children}
        </div>
      </div>
    </CSSTransition>
  )
}
