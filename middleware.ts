// Auth middleware temporarily disabled — Next.js 16 deprecated middleware convention
// TODO: Migrate to Next.js 16 "proxy" convention or use route-level auth checks

import { NextResponse } from 'next/server'

export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-.*|manifest.json|sw.js|.*\\.svg$).*)'],
}
