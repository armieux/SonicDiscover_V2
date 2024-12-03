// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import AuthService from '../../../services/authService';
export async function POST(request: Request) {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    try {
        const user = await AuthService.register(username, email, password);
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}