// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import AuthService from '../../../services/authService';

export async function POST(request: Request) {
    const { email, password } = await request.json();

    try {
        const { token } = await AuthService.login(email, password);
    
        const response = NextResponse.json({ token }, { status: 200 });
        
        AuthService.saveToken(token, response);
        
        return response;
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 401 });
    }
}