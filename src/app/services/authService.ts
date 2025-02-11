import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { NextApiRequest } from 'next';
import { parse } from 'cookie';

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

  async getCurrentUser(req: NextApiRequest) {
    try {
      // 1. Read token from the request cookies
      const cookiesHeader = req.headers.cookie || '';
      const cookies = parse(cookiesHeader);
      const token = cookies.token;

      if (!token) return null;

      // 2. Verify the JWT
      const secret = process.env.JWT_SECRET || 'default_secret';
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      // 3. Query the user from the DB using the decoded userId
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
      });
      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  async getCurrentUserFromRequest(req: Request) {
    const cookiesHeader = req.headers.get('cookie') || '';
    const cookies = parse(cookiesHeader);
    const token = cookies.token;

    if (!token) return null;

    try {
      const secret = process.env.JWT_SECRET || 'default_secret';
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
      });
      return user;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  async isLoggedIn(req: Request): Promise<boolean> {
    const cookiesHeader = req.headers.get('cookie') || '';
    const { token } = parse(cookiesHeader);

    if (!token) return false;

    try {
      const secret = process.env.JWT_SECRET || 'default_secret';
      jwt.verify(token, secret);
      return true;
    } catch (error) {
      console.error('Invalid token', error);
      return false;
    }
  }
}

const authService = new AuthService();
export default authService;
