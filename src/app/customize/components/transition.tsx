'use client'

import { type ReactNode, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'

type Props = {
  visible: boolean
  children: ReactNode
  onClosed?: () => void
}

export function TransitionComponent({ visible, children, onClosed }: Props) {
  // __STATE <Next.14>
  const nodeRef = useRef<HTMLDivElement>(null)

  // __RENDER
  return (
    <CSSTransition nodeRef={nodeRef} in={visible} timeout={200} unmountOnExit onExited={onClosed}>
      <div className='ui--labs-panel' ref={nodeRef}>
        {children}
      </div>
    </CSSTransition>
  )
}
