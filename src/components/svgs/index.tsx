import { SVGAttributes } from 'react'
import cls from 'classnames'

interface Props extends SVGAttributes<SVGElement> {}

export function SVG({ fill = 'currentColor', viewBox = '0 0 16 16', width = 16, height = 16, ...rest }: Props) {
  // __RENDER
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className={cls('icon', rest.className)}
      width={width}
      height={height}
      fill={fill}
      viewBox={viewBox}
    >
      {rest.children}
    </svg>
  )
}
