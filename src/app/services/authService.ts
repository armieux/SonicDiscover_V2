import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

class AuthService {
  validateEmail(email: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password: string) {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      password.length >= minLength &&
      hasNumber.test(password) &&
      hasSpecialChar.test(password)
    );
  }

  validateUsername(username: string) {
    const re = /^[a-zA-Z0-9_]+$/;
    return re.test(username) && username.length >= 3;
  }

  async register(username: string, email: string, password: string) {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (!this.validatePassword(password)) {
      throw new Error(
        'Password must be at least 8 characters long and contain at least one number and one special character'
      );
    }
    if (!this.validateUsername(username)) {
      throw new Error(
        'Username must be at least 3 characters long and contain only letters, numbers, and underscores'
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      const user = await prisma.users.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'USER',
        },
      });
      return user;
    } catch (error) {
        console.error(error);
      // Typically handle unique constraint error more specifically
      throw new Error('User already exists');
    }
  }

  async login(email: string, password: string) {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      const secret = process.env.JWT_SECRET || 'default_secret';
      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
      return { user, token };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  /**
   * SERVER-SIDE cookie handling
   * If you really want these in the service, you must pass NextResponse in
   */
  saveToken(token: string, res: NextResponse) {
    res.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
  }

  destroyToken(res: NextResponse) {
    res.cookies.delete('token');
  }

  /**
   * If you want to get the current user from a cookie-based token on the server,
   * you'd pass in the request so you can read the cookie. E.g.:
   */
  async getCurrentUser() {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return null;

    try {
      const secret = process.env.JWT_SECRET || 'default_secret';
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      return prisma.users.findUnique({ where: { id: decoded.userId } });
    } catch (error) {
      console.log('Invalid token', error);
      return null;
    }
  }

  async isLoggedIn() {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) return false;

    try {
      const secret = process.env.JWT_SECRET || 'default_secret';
      jwt.verify(token, secret);
      return true;
    } catch (error) {
      console.log('Invalid token', error);
      return false;
    }
  }
}

const authService = new AuthService();
export default authService;
