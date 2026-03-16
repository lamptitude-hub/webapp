'use client'

import { useCallback, useState } from 'react'

import { SignInComponent } from '@/components/modals/sign-in'
import { useAuth, useTranslate } from '@/hooks'
import { modal } from '@/utils/addon'

type Props = {
  canSave?: boolean
  onSave?: () => void
}

export function ButtonSave(props: Props) {
  // __STATE's
  const { t } = useTranslate()
  const user = useAuth()

  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // __FUNCTION's
  const handleSave = useCallback(() => {
    if (!props?.canSave || isProcessing) return void 0
    if (user.isAuth()) {
      if (props.onSave) {
        setIsProcessing(true)
        props.onSave()
      }
    } else {
      const className = 'md-signin'
      modal.on(<SignInComponent />, { className, allowEscape: true })
    }
  }, [user, props, isProcessing])

  // __RENDER
  return (
    <button
      className='btn h-10 min-w-24 bg-black text-white hover:text-theme'
      type='button'
      disabled={!props?.canSave || isProcessing}
      onClick={handleSave}>
      <span className='font-semibold capitalize'>{isProcessing ? 'processing...' : t('btnSave')}</span>
    </button>
  )
}
