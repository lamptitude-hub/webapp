'use client'

import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

import { useLoader, useTranslate } from '@/hooks'
import { supabaseAuth } from '@/services/supabase'
import type { FormLogin } from '@/types/form'
import { modal, notice } from '@/utils/addon'

import { InputComponent as Input } from '../input/main'
import { SVG } from '../svgs'
import { SignUpComponent } from './sign-up'

export function SignInComponent() {
  // __STATE <Next.14>
  const { t } = useTranslate()
  const loader = useLoader()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormLogin>()

  // __FUNCTION's
  const onSubmit = handleSubmit(async (data) => {
    loader.on()

    const response = await supabaseAuth.signInWithPassword(data)
    if (!response.data?.user) notice.error(response.error?.message)
  })

  const handleSignInWithGoogle = useCallback(() => {
    loader.on()
    supabaseAuth.signInWithOAuth({ provider: 'google' })
  }, [])

  const handleSignInWithFaceebook = useCallback(() => {
    loader.on()
    supabaseAuth.signInWithOAuth({ provider: 'facebook' })
  }, [])

  const handleSignUp = useCallback(() => {
    modal.off('md-signin')
    modal.on(<SignUpComponent />, { className: 'md-signup', allowEscape: true })
  }, [])

  // __RENDER
  return (
    <div className='ui--login-modal'>
      <div className='ui--login-header text-center'>
        <h2 className='text-3xl'>{t('textSignIn')}</h2>
        <p className='mt-2 text-neutral-500'>{t('textWelcome')}</p>

        <button className='btn absolute right-4 top-4 p-2' onClick={() => modal.off('md-signin')}>
          <SVG width={30} height={30} viewBox='0 0 25 25'>
            <path
              d='M16.7431 8.25786L8.25781 16.7431M16.7431 16.7431L8.25781 8.25781'
              stroke='#28303F'
              strokeWidth={1.5}
            />
          </SVG>
        </button>
      </div>

      <form className='ui--login-form' onSubmit={onSubmit}>
        <div className='rows'>
          <Input
            key='.email'
            type='email'
            name='email'
            label={t('labelEmail')}
            register={register}
            errors={errors.email}
            rules={{ required: true }}
          />

          <Input
            key='.password'
            type='password'
            name='password'
            label={t('labelPassword')}
            register={register}
            errors={errors.password}
            rules={{ required: true }}
          />
        </div>

        <div className='rows'>
          <button className='btn btn-text h-12 bg-black' type='submit'>
            <span className='text text-base text-white'>{t('btnSignIn')}</span>
          </button>
        </div>
      </form>

      <div className='ui--login-footer pt-1'>
        <p className='text-center text-neutral-500'>{t('textSignOr')}</p>

        <div className='mb-6 mt-4 grid gap-4'>
          {/* <button
            className='btn btn-text h-12 gap-2 border border-solid border-neutral-200'
            onClick={handleSignInWithFaceebook}>
            <SVG width={20} height={20} viewBox='0 0 17 17'>
              <path
                d='M16.5 8.54865C16.5 4.10384 12.9179 0.5 8.5 0.5C4.08206 0.5 0.5 4.10384 0.5 8.54865C0.5 12.5656 3.42507 15.8955 7.25012 16.5V10.8758H5.21832V8.54865H7.25012V6.77501C7.25012 4.75802 8.44488 3.64314 10.2719 3.64314C11.1471 3.64314 12.0629 3.80046 12.0629 3.80046V5.78124H11.0538C10.0604 5.78124 9.74988 6.4015 9.74988 7.03872V8.54858H11.9684L11.614 10.8757H9.74981V16.4999C13.5749 15.8966 16.5 12.5667 16.5 8.54865Z'
                fill='#0078FF'
              />
            </SVG>

            <span className='text'>{t('btnSignInWithFaceebook')}</span>
          </button> */}

          <button
            className='btn btn-text h-12 gap-2 border border-solid border-neutral-200'
            onClick={handleSignInWithGoogle}>
            <SVG width={20} height={20} viewBox='0 0 17 17'>
              <path
                d='M16.309 8.68417C16.309 8.14035 16.2649 7.59359 16.1708 7.05859H8.625V10.1392H12.9461C12.7668 11.1328 12.1907 12.0117 11.347 12.5703V14.5692H13.925C15.4389 13.1758 16.309 11.1181 16.309 8.68417Z'
                fill='#4285F4'
              />
              <path
                d='M8.62556 16.5002C10.7832 16.5002 12.6028 15.7918 13.9285 14.5689L11.3505 12.57C10.6333 13.058 9.70732 13.3343 8.6285 13.3343C6.54142 13.3343 4.7718 11.9263 4.13686 10.0332H1.47656V12.0938C2.83464 14.7953 5.60076 16.5002 8.62556 16.5002Z'
                fill='#34A853'
              />
              <path
                d='M4.13336 10.0338C3.79825 9.04023 3.79825 7.96435 4.13336 6.97079V4.91016H1.476C0.341333 7.17067 0.341333 9.83391 1.476 12.0944L4.13336 10.0338Z'
                fill='#FBBC04'
              />
              <path
                d='M8.62556 3.66644C9.76611 3.6488 10.8684 4.07798 11.6945 4.86578L13.9785 2.58174C12.5322 1.22367 10.6127 0.477023 8.62556 0.500539C5.60076 0.500539 2.83464 2.20548 1.47656 4.90987L4.13392 6.9705C4.76592 5.07449 6.53848 3.66644 8.62556 3.66644Z'
                fill='#EA4335'
              />
            </SVG>

            <span className='text'>{t('btnSignInWithGoogle')}</span>
          </button>
        </div>

        <div className='grid grid-flow-col justify-center gap-4 border-0 border-t border-solid border-neutral-200 pt-4'>
          <button className='btn hover:underline' type='button' disabled>
            <span className='font-normal'>{t('btnForgotPassword')}</span>
          </button>

          <span>|</span>

          <button className='btn hover:underline' type='button' onClick={handleSignUp}>
            <span className='font-normal'>{t('btnSignUp')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
