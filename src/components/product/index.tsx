import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { ProductService } from '@/services'

import { ActionsComponent } from '../actions'
import { ItemComponent } from './item'

export function ProductComponent() {
  // __STATE<Next.14>
  const router = useRouter()

  const [currentState, setCurrentState] = useState<number>(-1)

  // __FETCHER's
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: ProductService.findAll,
    refetchOnWindowFocus: false
  })

  // __FUNCTION's
  const handleNext = useCallback(() => {
    if (currentState > -1) {
      router.push(`/canopies?productId=${currentState}`)
    }
  }, [currentState])

  // __RENDER
  return (
    <div className='mx-auto max-w-6xl pb-28 max-sm:pb-24'>
      {isLoading ? (
        <div className='grid grid-cols-3 gap-4 max-sm:grid-cols-2 max-sm:gap-2 max-sm:px-2'>
          <div className='aspect-square animate-pulse rounded bg-zinc-100' />
          <div className='aspect-square animate-pulse rounded bg-zinc-100' />
          <div className='aspect-square animate-pulse rounded bg-zinc-100 max-sm:hidden' />
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-4 max-sm:grid-cols-2 max-sm:gap-2 max-sm:px-2'>
          {responseData?.data.map((record, index) => (
            <ItemComponent
              name={record.name}
              src={record.poster}
              isActive={currentState === record.id}
              onClick={() => setCurrentState(record.id)}
              key={index}
            />
          ))}
        </div>
      )}

      <ActionsComponent usePrev={false} nextIsDisabled={currentState < 0} onNext={handleNext} />
    </div>
  )
}
