// src/middleware/auth.ts
import { NextResponse, NextRequest } from 'next/server';
import AuthService from '../services/authService';

export function middleware(request: NextRequest) {
    if (!AuthService.isLoggedIn()) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/dashboard/:path*',
};