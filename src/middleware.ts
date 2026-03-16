import { NextRequest, NextResponse } from 'next/server'
import { APP_AUTH_ACCESS } from '@/constants/configs'

export const config = {
  matcher: ['/account/:path*']
}

export async function middleware({ url, nextUrl, cookies }: NextRequest) {
  if (!cookies.has(APP_AUTH_ACCESS)) {
    const searchParams = new URLSearchParams(nextUrl.searchParams)
    searchParams.set('fallback', nextUrl.pathname)

    return NextResponse.redirect(new URL(`${url}?${searchParams}`, url))
  }

  return NextResponse.next()
}
