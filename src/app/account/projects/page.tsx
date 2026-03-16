'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

import { useLoader, useTranslate } from '@/hooks'
import { ProjectService } from '@/services'
import type { Disk } from '@/types/schema'

export default function ProjectContainer() {
  // __STATE<Next.14>
  const { t } = useTranslate()
  const router = useRouter()
  const loader = useLoader()

  // __FETCHER's
  const {
    data: responseData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['my-projects'],
    queryFn: ProjectService.findAll,
    refetchOnWindowFocus: false
  })

  // __FUNCTION's
  const handleEdit = useCallback(({ id, dataset }: Disk) => {
    if (!dataset) return void 0
    const qs = [
      `mode=3d-editor-program`,
      `libs=three.js`,
      `ref=${id}`,
      `productId=${dataset.productId}`,
      `canopyId=${dataset.canopyId}`,
      `save=${btoa(JSON.stringify(dataset))}`
    ]

    router.push(`/customize?${qs.join('&')}`)
  }, [])

  const handleDelete = useCallback(
    async (payload: Disk) => {
      loader.on()

      await ProjectService.delete(payload.id)
      refetch()

      loader.off()
    },
    [refetch]
  )

  // __EFFECT's
  useEffect(() => {
    if (isLoading) loader.on()
    else loader.off()
  }, [isLoading])

  // __RENDER
  return (
    <div className='ui--account-project'>
      <div className='grid grid-flow-col items-center justify-start gap-3'>
        <span className='icon bi bi-folder text-2xl text-theme'></span>
        <h3 className='text-2xl'>{t('btnMyProject')}</h3>
      </div>

      <div className='mt-8 grid grid-flow-row gap-4 max-sm:mt-4'>
        {responseData?.data?.map((record, index) => (
          <div
            className='grid grid-cols-[20px_1fr_80px_80px] items-center gap-4 border-b border-neutral-200 p-4 max-sm:grid-cols-[20px_1fr_auto_auto] max-sm:gap-2 max-sm:px-2'
            key={index}>
            <span className='bi bi-box-seam'></span>
            <span className='text-lg font-bold max-sm:text-sm'>{`${record.id}. ${record.name}`}</span>

            <button className='btn btn-text text-theme' type='button' onClick={() => handleEdit(record)}>
              <span className='bi bi-pen-fill'></span>
              <span className='text'>{t('btnEdit')}</span>
            </button>

            <button className='btn btn-text max-sm:px-2' type='button' onClick={() => handleDelete(record)}>
              <span className='text text-gray-600'>{t('btnDelete')}</span>
            </button>
          </div>
        ))}
      </div>

      {!responseData?.total && <i>{t('textEmpty')}</i>}
    </div>
  )
}
