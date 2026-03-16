import cls from 'classnames'

type Props = {
  isRendering: boolean
}

export function RenderingComponent({ isRendering }: Props) {
  // __RENDER
  return (
    <div
      className={cls('ui--loader-triangle1', 'inset-0 grid place-items-center', {
        rendering: isRendering
      })}>
      <div className='context pointer-events-none'>
        <p className='text-lg capitalize text-gray-800'>loading...</p>
        <div className='bar'>
          <div className='bar-inner' />
        </div>
      </div>
    </div>
  )
}
