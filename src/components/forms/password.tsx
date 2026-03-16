'use client'

import { useForm } from 'react-hook-form'

import { useAuth, useLoader, useTranslate } from '@/hooks'
import { AuthService, supabaseAuth } from '@/services'
import { notice } from '@/utils/addon'
import { confirmPasswordValidator } from '@/utils/validator'

import { InputComponent as Input } from '../input/main'

interface FormPassword {
  password: string
  confirmPassword: string
  oldPassword: string
}

export function FormPWDComponent() {
  // __STATE <Next.14>
  const { t } = useTranslate()
  const user = useAuth()
  const loader = useLoader()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormPassword>()

  // __FUNCTION's
  const onSubmit = handleSubmit(async (data) => {
    if (!user.isAuth()) return void 0
    loader.on()

    const check = await supabaseAuth.signInWithPassword({ email: user.email!, password: data.oldPassword })
    if (!check.data?.user) notice.error(t('noticePasswordWarn'))
    else {
      const response = await supabaseAuth.updateUser({ password: data.password })
      if (response) {
        notice.success(t('noticePasswordChanged'), { title: 'Successfuly' })
        AuthService.profile()
      }
    }

    loader.off()
  })

  // __RENDER
  return (
    <form className='mt-8 grid max-w-80 gap-4 max-sm:max-w-full' onSubmit={onSubmit}>
      <div className='grid'>
        <Input
          key='.oldPassword'
          type='password'
          name='oldPassword'
          label={t('labelOldPassword')}
          register={register}
          errors={errors.oldPassword}
          rules={{ required: true }}
        />
      </div>

      <div className='grid'>
        <Input
          key='.password'
          type='password'
          name='password'
          label={t('labelNewPassword')}
          register={register}
          errors={errors.password}
          rules={{ required: true }}
        />

        <div className='mt-2 rounded-lg bg-neutral-100 p-4 text-neutral-400'>
          <p className=''>{t('textPasswordCond1')}</p>
          <p className=''>• {t('textPasswordCond2')}</p>
          <p className=''>• {t('textPasswordCond3')}</p>
          <p className=''>• {t('textPasswordCond4')}</p>
        </div>
      </div>

      <div className='grid'>
        <Input
          key='.confirmPassword'
          type='password'
          name='confirmPassword'
          label={t('labelConfirmNewPassword')}
          register={register}
          errors={errors.confirmPassword}
          rules={{ required: true, validate: (value) => confirmPasswordValidator(watch, value) }}
        />
      </div>

      <div className='mt-4 grid'>
        <button className='btn btn-text h-12 w-36 bg-black' type='submit'>
          <span className='text text-base text-white'>{t('btnSave')}</span>
        </button>
      </div>
    </form>
  )
}
