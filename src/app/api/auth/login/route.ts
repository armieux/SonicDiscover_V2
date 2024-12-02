// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import AuthService from '../../../services/authService';

export async function POST(request: Request) {
    const { email, password } = await request.json();

    try {
        const { token } = await AuthService.login(email, password);
        AuthService.saveToken(token);
        return NextResponse.json({ token }, { status: 200 });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 401 });
    }
}