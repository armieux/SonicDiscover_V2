// src/services/authService.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, {JwtPayload} from 'jsonwebtoken';

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
        return password.length >= minLength && hasNumber.test(password) && hasSpecialChar.test(password);
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
            throw new Error('Password must be at least 8 characters long and contain at least one number and one special character');
        }

        if (!this.validateUsername(username)) {
            throw new Error('Username must be at least 3 characters long and contain only letters, numbers, and underscores');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        try {
            const user = await prisma.user.create({
                data: {
                    name: username,
                    email,
                    password: hashedPassword
                }
            });

            return user;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            throw new Error('User already exists');
        }
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user && bcrypt.compareSync(password, user.password)) {
            const secret = process.env.JWT_SECRET || 'default_secret';
            const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
            return { user, token };
        } else {
            throw new Error('Invalid credentials');
        }
    }

    saveToken(token: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        } else {
            console.log('localStorage is not available');
        }
    }

    destroyToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        } else {
            console.log('localStorage is not available');
        }
    }

    getCurrentUser() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const secret = process.env.JWT_SECRET || 'default_secret';
                    const decoded = jwt.verify(token, secret) as JwtPayload;
                    return prisma.user.findUnique({
                        where: { id: decoded.userId }
                    });
                } catch (error) {
                    console.log('Invalid token', error);
                    return null;
                }
            }
        }
        return null;
    }

    isLoggedIn() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
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
        return false;
    }
}

export default new AuthService();