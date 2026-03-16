import Image from 'next/image'

import { UserComponent } from './user'
import Link from 'next/link'

export function NavigatorComponent() {
  // __RENDER
  return (
    <nav className='ui--navigator sticky inset-x-0 top-0 z-50 border-0 border-b border-solid border-b-neutral-200/75 bg-white'>
      <div className='ui--navigator-container grid grid-flow-col items-center justify-between gap-8 px-8 py-5 max-sm:px-4 max-sm:py-2'>
        <div className='ui--navigator-main'>
          <Link className='btn btn-home' href='/'>
            <Image
              className='object-contain object-center max-sm:h-5 max-sm:object-left'
              src='/static/images/lamtitude.png'
              alt='Lamtitude Logo'
              width={150}
              height={28}
              quality={100}
              loading='eager'
              priority
            />
          </Link>
        </div>

        <UserComponent />
      </div>
    </nav>
  )
}
