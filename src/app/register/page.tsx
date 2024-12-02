"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (res.ok) {
            setError(null); // Clear any previous error
            router.push('/'); // Redirect to home page
        } else {
            const data = await res.json();
            setError(data.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#353445] items-center justify-center">
            <div className="w-full max-w-md bg-[#282733] p-8 rounded-lg">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="w-full px-3 py-2 rounded-lg bg-[#353445] text-white border border-gray-600 focus:border-[#00B76C] focus:ring-[#00B76C] focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white text-sm font-medium mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 rounded-lg bg-[#353445] text-white border border-gray-600 focus:border-[#00B76C] focus:ring-[#00B76C] focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white text-sm font-medium mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 rounded-lg bg-[#353445] text-white border border-gray-600 focus:border-[#00B76C] focus:ring-[#00B76C] focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-white text-sm font-medium mb-2" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full px-3 py-2 rounded-lg bg-[#353445] text-white border border-gray-600 focus:border-[#00B76C] focus:ring-[#00B76C] focus:outline-none"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-[#00B76C] text-white font-semibold hover:bg-[#00a35d] focus:outline-none"
                    >
                        Register
                    </button>
                </form>
                <p className="text-sm text-center text-white mt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-[#FF6A92] hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;