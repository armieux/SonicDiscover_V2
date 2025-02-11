import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret')

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // jose’s jwtVerify is async:
    await jwtVerify(token, secretKey)
  } catch (err) {
    console.error('Invalid token', err)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!login|register|_next|favicon.ico|api).*)',
  ],
};
