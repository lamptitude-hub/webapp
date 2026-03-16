'use client'

import { useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import cls from 'classnames'

import { useLoader, useTranslate } from '@/hooks'
import { DocsService } from '@/services'

export default function DocsContainer() {
  // __STATE<Next.14>
  const { t } = useTranslate()
  const loader = useLoader()

  // __FETCHER's
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['my-docs'],
    queryFn: DocsService.findAll,
    refetchOnWindowFocus: false
  })

  // __FUNCTION's
  const handleDownload = useCallback(async (url: string, name: string) => {
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.setAttribute('download', name)
    a.click()
  }, [])

  // __EFFECT's
  useEffect(() => {
    if (isLoading) loader.on()
    else loader.off()
  }, [isLoading])

  // __RENDER
  return (
    <div className='ui--account-docs'>
      <div className='grid grid-flow-col items-center justify-start gap-3'>
        <span className='icon bi bi-download text-2xl text-theme'></span>
        <h3 className='text-2xl'>{t('btnDownloadDocs')}</h3>
      </div>

      <div className='mt-8 grid grid-flow-row gap-4 max-sm:mt-4'>
        {responseData?.data?.map((record, index) => (
          <div
            className='grid grid-cols-[30px_1fr_auto] items-center gap-4 border-b border-neutral-200 p-4 max-sm:grid-cols-[20px_1fr_auto_auto] max-sm:gap-2 max-sm:px-2'
            key={index}
          >
            <span
              className={cls('bi text-xl', {
                'bi-filetype-pdf': record.name.endsWith('.pdf'),
                'bi-filetype-png': record.name.endsWith('.png')
              })}
            ></span>

            <div className='grid'>
              <span className='text-lg font-bold max-sm:text-sm'>{record.name}</span>
              <span className='text-xs text-gray-400'>0 MB</span>
            </div>

            <button
              className='btn btn-primary h-10 px-2 max-sm:h-6'
              type='button'
              onClick={() => handleDownload(record.url!, record.name)}
            >
              <span className='text'>{t('btnDownload')}</span>
            </button>
          </div>
        ))}
      </div>

      {!responseData?.total && <i>{t('textEmpty')}</i>}
    </div>
  )
}
