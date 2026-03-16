import cls from 'classnames'

type Props = {
  image: string
  name?: string
  isActive?: boolean
  isDisable?: boolean
  onClick?: () => void
}

export function ItemComponent({ image, name, ...rest }: Props) {
  // __RENDER
  return (
    <button
      className='disabled:cursor-not-allowed'
      type='button'
      disabled={rest?.isDisable}
      onClick={rest?.onClick}>
      <img
        className={cls(
          'aspect-square w-full rounded-lg object-cover  object-center',
          rest?.isActive ? 'ring-2 ring-theme' : 'opacity-90 hover:opacity-100'
        )}
        src={image}
        onError={({ target }: any) => (target.src = '/static/images/no-image.png')}
      />
      <p
        className={cls('mt-1 line-clamp-1 select-none text-[9px] font-medium', {
          'text-zinc-600 ': !rest?.isActive
        })}>
        {name || 'Unnamed'}
      </p>
    </button>
  )
}
