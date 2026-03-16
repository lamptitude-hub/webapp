import { useCallback, useEffect, useMemo, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'

import { useDispatch, useSelector } from '@/store'
import { setDialog } from '@/store/app.store'
import type { Dialog } from '@/types/addon'
import { scrollOff } from '@/utils'

import { getCurrentContant } from './register'

export default function DialogContainer() {
  // __STATE <Next.14>
  const dispatch = useDispatch()
  const state = useSelector(({ app }) => app.dialog)

  const nodeRef = useRef<HTMLDivElement>(null)
  const btnConfirm = useRef<HTMLButtonElement>(null)
  const useConfirm = useMemo(() => state?.type === 'confirm', [state?.type])

  // __FUNCTION's
  const handleClose = useCallback(
    (value: boolean = true) => {
      if (!state) return void 0
      if (state?.resolve) {
        state.resolve({
          isConfirmed: value,
          isDenied: !value
        })
      }

      const payload: Dialog = {
        ...state,
        visible: false,
        resolve: void 0
      }

      dispatch(setDialog(payload))
    },
    [state, dispatch]
  )

  const handleOnExited = useCallback(() => {
    dispatch(setDialog({ visible: false, content: null }))
    scrollOff(false)
  }, [dispatch])

  // __EFFECT's
  useEffect(() => {
    function listener({ code }: KeyboardEvent) {
      switch (code) {
        case 'Enter':
        case 'Space':
          handleClose()
          break

        case 'Escape':
          handleClose(false)
          break
      }
    }

    if (state?.visible) {
      addEventListener('keydown', listener)
      if (btnConfirm.current) btnConfirm.current.focus()
    } else {
      removeEventListener('keydown', listener)
    }

    return () => {
      removeEventListener('keydown', listener)
    }
  }, [state, btnConfirm])

  // __RENDER
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={state?.visible}
      timeout={128}
      unmountOnExit={true}
      onEnter={() => scrollOff(true)}
      onExited={handleOnExited}>
      <div
        className='ui--modal-wrapper z-80 fixed inset-0 grid items-start overflow-x-hidden bg-black/40 p-8'
        ref={nodeRef}>
        <div className='ui--modal-container relative mx-auto min-w-[360px] translate-y-[-10px] rounded-xl bg-white px-8 pb-6 pt-8 opacity-0 transition-all'>
          <div className='relative grid select-none grid-cols-[1fr_auto] items-center gap-8 rounded-t-xl'>
            <div className='text-base font-bold text-black'>{state?.title || 'System Alert'}</div>

            <button className='btn h-6 w-6' title='Close.' onClick={() => handleClose(false)}>
              <span className='icon bi bi-x-lg text-sm text-rose-600'></span>
            </button>
          </div>

          <div className='py-8 text-sm text-neutral-800'>{state && getCurrentContant(state)}</div>

          <div className='grid grid-flow-col justify-end gap-4'>
            {useConfirm && (
              <button className='btn h-8 w-auto px-1' onClick={() => handleClose(false)}>
                <span className='text-sm capitalize text-neutral-800'>{state?.cancelLabel}</span>
              </button>
            )}

            <button
              className='btn btn-primary h-8 w-auto min-w-[80px]  focus:outline focus:outline-1 focus:outline-offset-2 focus:outline-neutral-800'
              ref={btnConfirm}
              onClick={() => handleClose()}>
              <span className='text-sm font-bold capitalize'>{state?.confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}
