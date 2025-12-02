"use client";

import { useEffect, useState } from 'react';
import { fetchClient } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Booking {
    bookingID: number;
    roomName: string;
    scheduledTime: string;
    status: string;
    amountDue: number;
    invoiceStatus: string;
}

export default function DashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            fetchBookings(userData.id);
        } else {
            router.push('/login');
        }
    }, [router]);

    const fetchBookings = (userId: number) => {
        fetchClient(`/bookings/customer/${userId}`)
            .then(setBookings)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    if (!user) return null;

    return (
        <div className="relative min-h-screen p-8 md:p-24 bg-slate-950 text-white">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/bg-dashboard.png"
                    alt="Dashboard Background"
                    fill
                    className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 to-slate-950" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            Agent Dashboard
                        </h1>
                        <p className="text-slate-400 mt-2">Welcome back, Agent {user.firstName}.</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl rounded-2xl p-8" >
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                        <span className="text-purple-400">📅</span> Your Missions
                    </h2>

                    {loading ? (
                        <p className="text-slate-400 animate-pulse">Loading mission data...</p>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <p className="mb-4">No active missions found.</p>
                            <a href="/rooms" className="text-purple-400 hover:underline">Book a room</a>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-medium">Mission (Room)</th>
                                        <th className="p-4 font-medium">Date & Time</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Invoice</th>
                                        <th className="p-4 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {bookings.map((booking) => (
                                        <tr key={booking.bookingID} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium text-white">{booking.roomName}</td>
                                            <td className="p-4 text-slate-300">{new Date(booking.scheduledTime).toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'Confirmed'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-gray-700 text-gray-300'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono">${booking.amountDue}</span>
                                                    <span className={`text-xs ${booking.invoiceStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'
                                                        }`}>
                                                        {booking.invoiceStatus}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {booking.invoiceStatus === 'Pending' && (
                                                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20">
                                                        Pay Now
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
