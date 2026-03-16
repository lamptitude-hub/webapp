'use client'

import { useQuery } from '@tanstack/react-query'
import cls from 'classnames'
import { useEffect, useState } from 'react'

import { BannerService } from '@/services'

import { SVG } from '../svgs'

export function BannerComponent() {
  // __STATE<Next.14>
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // __FETCHER's
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: BannerService.findAll,
    refetchOnWindowFocus: false
  })

  // __EFFECT's
  useEffect(() => {
    if (banners?.length) {
      const intervalId = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1 < banners.length ? prev + 1 : 0))
      }, 5e3)

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [banners])

  // __RENDER
  return (
    <div className='ui--index-banner relative h-[320px] bg-[#eff1f5]'>
      <div className='absolute left-8 top-8 z-20 grid grid-flow-col items-center gap-3 max-sm:left-4 max-sm:top-4'>
        <span className='cursor-pointer text-sm hover:underline'>Home</span>
        <SVG width={16} height={16} viewBox='0 0 16 16'>
          <path d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z' />
        </SVG>
        <span className='cursor-pointer text-sm hover:underline'>Design by you</span>
      </div>

      <div className='absolute inset-x-0 bottom-4 z-20 grid grid-flow-col justify-center gap-4'>
        {banners?.map((_, index) => (
          <div
            className={cls('size-3 rounded-full', index === currentIndex ? 'bg-black' : 'bg-neutral-300/75')}
            key={index}
          />
        ))}
      </div>

      <div className='relative mx-auto size-full overflow-hidden'>
        {banners?.map((record, index) => (
          <div
            className={cls(
              'absolute size-full  transition-all duration-1000 ',
              index === currentIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
            key={index}>
            <img className='size-full object-cover object-center' src={record.src} />

            <img className='size-full object-cover object-center' src={record.srcMobile} />
          </div>
        ))}
      </div>
    </div>
  )
}
