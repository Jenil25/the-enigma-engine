"use client";

import { useEffect, useState } from 'react';
import { fetchClient } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';

export default function BookingPage() {
    const { roomId } = useParams();
    const router = useRouter();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [numPlayers, setNumPlayers] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserId(user.id);
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!userId) {
            setError("You must be logged in to book.");
            setLoading(false);
            return;
        }

        try {
            const scheduledTime = `${date} ${time}:00`;
            await fetchClient('/bookings/', {
                method: 'POST',
                body: JSON.stringify({
                    customerId: userId,
                    roomId: roomId,
                    scheduledTime,
                    numPlayers
                }),
            });

            alert('Booking Confirmed!');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-24 bg-slate-950 text-white">
            <div className="max-w-md w-full">
                <h1 className="text-3xl font-bold mb-8 text-center">Book Your Adventure</h1>

                <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-lg shadow-lg border border-slate-800">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block mb-2 text-slate-400">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-slate-400">Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-slate-400">Number of Players</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={numPlayers}
                            onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                            className="w-full p-2 rounded bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
}
