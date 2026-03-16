'use client'

import { useQuery } from '@tanstack/react-query'
import cls from 'classnames'
import { format } from 'date-fns'
import capture from 'html2canvas'
import { jsPDF } from 'jspdf'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { DiskType } from '@/constants'
import { CanopyType } from '@/constants'
import { useLoader, useTranslate } from '@/hooks'
import { CanopyService, DocsService, ProductService, ProjectService } from '@/services'
import { dataURLtoFile } from '@/utils'
import { notice } from '@/utils/addon'
import { storage } from '@/utils/storage'

import { TableComponent } from './components/table'

export default function OrderSummaryContainer() {
  // __STATE<Next.14>
  const { t } = useTranslate()

  const loader = useLoader()
  const router = useRouter()
  const searchParams = useSearchParams()

  const qs = useMemo(() => {
    const params = Object.fromEntries(searchParams)
    return { id: Number(params.id) }
  }, [])

  const [isConverting, setIsConverting] = useState(false)

  // __FETCHER's
  const {
    data: responseData,
    isLoading,
    isRefetching,
    isFetched
  } = useQuery({
    queryKey: ['aria-summary'],
    queryFn: async () => {
      const data = await ProjectService.findOne(qs.id)
      if (data?.dataset) {
        const [product, canopy] = await Promise.all([
          ProductService.findOne(data.dataset.productId!),
          CanopyService.findOne(data.dataset.canopyId!)
        ])

        return {
          project: data,
          product,
          canopy
        }
      }
    },
    refetchOnWindowFocus: false
  })

  // __FUNCTION's
  const handleClick = useCallback(() => {
    if (responseData?.project) {
      loader.on()
      setIsConverting(true)

      setTimeout(async () => {
        const pageA = document.querySelector('.page-1')
        const pageB = document.querySelector('.page-2')
        const pageC = document.querySelector('.page-3')

        if (!pageA || !pageC) return void 0

        const [capturePageA, capturePageC] = await Promise.all([
          capture(pageA as HTMLElement, { scale: 1, backgroundColor: '#ffffff' }),
          capture(pageC as HTMLElement, { scale: 1, backgroundColor: '#ffffff' })
        ])

        const pageAimageDataURL = capturePageA.toDataURL('image/png')
        const pageCimageDataURL = capturePageC.toDataURL('image/png')

        const doc = new jsPDF('portrait', 'mm', 'a4', true)
        const margin = 10 // 10mm margin on all sides
        const pageWidth = 210 // A4 width in mm
        const pageHeight = 297 // A4 height in mm
        const imgWidth = pageWidth - 2 * margin // Adjust for margins

        doc.addImage(
          pageAimageDataURL,
          'PNG',
          10,
          10,
          imgWidth,
          (capturePageA.height * imgWidth) / capturePageA.width
        )

        if (pageB) {
          const capturePageB = await capture(pageB as HTMLElement, { scale: 1, backgroundColor: '#ffffff' })
          const pageBimageDataURL = capturePageB.toDataURL('image/png')

          doc.addPage()
          doc.addImage(
            pageBimageDataURL,
            'PNG',
            10,
            10,
            imgWidth,
            (capturePageB.height * imgWidth) / capturePageB.width
          )
        }

        doc.addPage()
        doc.addImage(
          pageCimageDataURL,
          'PNG',
          10,
          10,
          imgWidth,
          (capturePageC.height * imgWidth) / capturePageC.width
        )

        const fileName = `${responseData.product?.name}_${format(new Date(), 'yyyy-MM-dd_k-m')}.pdf`
        const file = await dataURLtoFile(doc.output('dataurlstring'), fileName, 'application/pdf')
        // doc.save(fileName)

        DocsService.create({
          type: DiskType.DOCUMENT,
          name: fileName,
          file
        })
          .then(() => {
            notice.success(t('noticeFileSaved'), { title: 'Successfuly' })

            storage.remove('aria-image')
            storage.remove('img-composition')

            setIsConverting(false)
            loader.off()
            router.push('/account/docs')
          })
          .catch(() => {
            setIsConverting(false)
            loader.off()
          })
      }, 1e3)
    }
  }, [responseData])

  // __EFFECT's
  useEffect(() => {
    if (isLoading || isRefetching) loader.on()
    if (isFetched) loader.off()

    const elm = document.querySelector('.canvas-treejs')
    if (elm) elm.remove()
  }, [isLoading, isRefetching, isFetched])

  // __RENDER
  if (!responseData) {
    return <div className='px-8 py-16 text-center text-lg italic text-zinc-500'>{t('textLoading')}</div>
  } else if (isConverting) {
    return (
      <>
        <div className='fixed inset-0 z-[980] flex items-center justify-center bg-white/50 backdrop-blur-lg'>
          <div className='animate-pulse text-lg italic text-zinc-800'>Processing...</div>
        </div>

        <div className='page-1 flex w-full flex-col overflow-hidden' style={{ aspectRatio: 190 / 277 }}>
          <img
            className='w-64 flex-none justify-self-start object-cover object-center'
            src='/static/images/lamtitude.png'
          />
          <img className='grow object-contain object-top' src={storage.get('aria-image') as string} />
        </div>

        {responseData.canopy?.type === CanopyType.SINGLE && (
          <div className='page-2 flex w-full flex-col overflow-hidden' style={{ aspectRatio: 190 / 277 }}>
            <img
              className=' self-center object-contain object-center'
              src={storage.get('img-composition') as string}
            />
          </div>
        )}

        <div className='page-3 w-full overflow-hidden' style={{ aspectRatio: 190 / 277 }}>
          <div className='flex items-center gap-4'>
            <span className='bi bi-receipt text-xl text-theme'></span>
            <h2 className='text-2xl'>{t('labelOederSummary')}</h2>
          </div>

          <TableComponent
            state={responseData.project.dataset!}
            product={responseData.product!}
            canopy={responseData.canopy!}
            isPrint={true}
          />
        </div>
      </>
    )
  } else {
    return (
      <div className='ui--summary-context bg-white'>
        <TableComponent
          state={responseData.project.dataset!}
          product={responseData.product!}
          canopy={responseData.canopy!}
        />

        <div className='ui--summary-footer flex justify-between gap-4 pt-3'>
          <div className='max-sm:hidden'>
            <Link className='btn btn-text gap-3 px-4 pl-0' href='/' replace>
              <span className='bi bi-arrow-left'></span>
              <span className='text'>{t('btnPrev')}</span>
            </Link>
          </div>

          <div className='grid grid-flow-col gap-4'>
            <button className={cls('btn ring-the px-3 ring-1')}>
              <span className='text uppercase'>pdf</span>
            </button>

            <button className='btn btn-text px-3' disabled>
              <span className='text'>{t('btnRequestQuotation')}</span>
            </button>

            <button className='btn rounded-none bg-black px-8' onClick={handleClick}>
              <span className='text text-white'>{t('btnSave')}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }
}
