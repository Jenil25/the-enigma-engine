"use client";

import { useState } from 'react';
import { fetchClient } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'Customer',
        registrationCode: ''
    });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            let role = 'Customer';
            if (formData.registrationCode === 'ENIGMA_ADMIN') {
                role = 'Admin';
            } else if (formData.registrationCode === 'ENIGMA_GM') {
                role = 'GameMaster';
            }

            await fetchClient('/register', {
                method: 'POST',
                body: JSON.stringify({ ...formData, role }),
            });

            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl p-8 rounded-2xl">
                    <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Join the Engine
                    </h1>
                    <p className="text-slate-400 text-center mb-8">Create your account to start booking</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-slate-300">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 outline-none transition-all text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-slate-300">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 outline-none transition-all text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 outline-none transition-all text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-300">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 outline-none transition-all text-white"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-300">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 outline-none transition-all text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-300">Registration Code (Optional)</label>
                            <input
                                type="text"
                                name="registrationCode"
                                value={formData.registrationCode}
                                onChange={handleChange}
                                placeholder="Leave empty for Customer"
                                className="w-full p-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-purple-500 outline-none transition-all text-white placeholder-slate-600"
                            />
                            <p className="text-xs text-slate-500 mt-1">Enter staff code if applicable.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
                        >
                            Create Account
                        </button>

                        <p className="text-center text-slate-400 text-sm mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium hover:underline">
                                Login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
