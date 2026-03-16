'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useAuth, useLoader, useTranslate } from '@/hooks'
import { AuthService } from '@/services'
import { notice } from '@/utils/addon'
import type { FormRegister } from '@/types/form'

import { InputComponent as Input } from '../input/main'

export function FormProfileComponent() {
  // __STATE <Next.14>
  const { t } = useTranslate()
  const user = useAuth()
  const loader = useLoader()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<FormRegister>()

  // __FUNCTION's
  const onSubmit = handleSubmit(async (data) => {
    loader.on()

    const response = await AuthService.update(data)
    if (response) {
      notice.success(t('noticeProfileUpdated'), { title: 'Successfuly' })
      AuthService.profile()
    }

    loader.off()
  })

  // __EFFECT's
  useEffect(() => {
    if (user.isAuth()) {
      const [firstname, ...lastname] = user.displayName!.split(' ')

      setValue('id', user.id)
      setValue('email', user.email!)
      setValue('firstName', firstname || '')
      setValue('lastName', lastname.join(' ') || '')
      setValue('phoneNo', user.phoneNo || '')
      setValue('gender', user?.gender || 'MALE')
    }
  }, [user])

  // __RENDER
  return (
    <form className='mt-8 grid max-w-80 gap-4' onSubmit={onSubmit}>
      <div className='grid'>
        <Input
          key='.email'
          type='email'
          name='email'
          label={t('labelEmail')}
          disabled
          register={register}
          errors={errors.email}
        />
      </div>

      <div className='grid '>
        <Input
          key='.firstName'
          name='firstName'
          label={t('labelFirstName')}
          register={register}
          errors={errors.firstName}
          rules={{ required: true }}
        />
      </div>

      <div className='grid'>
        <Input
          key='.lastName'
          name='lastName'
          label={t('labelLastName')}
          register={register}
          errors={errors.lastName}
          rules={{ required: true }}
        />
      </div>

      <div className='grid'>
        <label className='ui--input-label required inline-flex items-center capitalize leading-none'>
          <span className='text'>{t('labelGender')}</span>
        </label>

        <div className='mt-4 grid grid-flow-col items-center justify-start gap-4'>
          <div className='grid grid-flow-col gap-2'>
            <input type='radio' value='MALE' {...register('gender', { required: true })} />
            <label className='pr-2'>{t('labelGenderMale')}</label>
          </div>

          <div className='grid grid-flow-col gap-2'>
            <input type='radio' value='FEMALE' {...register('gender', { required: true })} />
            <label className='pr-2'>{t('labelGenderFemale')}</label>
          </div>

          <div className='grid grid-flow-col gap-2'>
            <input type='radio' value='UNSET' {...register('gender', { required: true })} />
            <label className='pr-2'>{t('labelGenderUnset')}</label>
          </div>
        </div>
      </div>

      <div className='grid'>
        <Input
          key='.phoneNo'
          name='phoneNo'
          label={t('labelPhoneNo')}
          register={register}
          errors={errors.phoneNo}
          rules={{ required: true }}
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
