"use client";

import { useEffect, useState } from 'react';
import { fetchClient } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface Booking {
    bookingID: number;
    roomName: string;
    scheduledTime: string;
    firstName: string;
    lastName: string;
    numPlayers: number;
    durationMinutes: number;
}

interface Session {
    sessionID: number;
    bookingID: number;
    startTime: string;
}

export default function GameMasterDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            if (userData.role !== 'GameMaster' && userData.role !== 'Admin') {
                router.push('/dashboard');
                return;
            }
            setUser(userData);
            fetchSchedule();
        } else {
            router.push('/login');
        }
    }, [router]);

    const fetchSchedule = async () => {
        try {
            const data = await fetchClient('/bookings/schedule');
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const startSession = async (bookingId: number) => {
        if (!user) return;
        try {
            const data = await fetchClient('/sessions/', {
                method: 'POST',
                body: JSON.stringify({
                    bookingId: bookingId,
                    gameMasterId: user.id
                })
            });
            setActiveSession({
                sessionID: data.sessionId,
                bookingID: bookingId,
                startTime: new Date().toISOString()
            });
            alert("Session Started!");
        } catch (error) {
            console.error("Failed to start session:", error);
            alert("Failed to start session");
        }
    };

    const endSession = async (success: boolean) => {
        if (!activeSession) return;
        try {
            await fetchClient(`/sessions/${activeSession.sessionID}/end`, {
                method: 'POST',
                body: JSON.stringify({ success })
            });
            setActiveSession(null);
            alert(`Session Ended. Outcome: ${success ? 'Success' : 'Failure'}`);
            fetchSchedule(); // Refresh list
        } catch (error) {
            console.error("Failed to end session:", error);
        }
    };

    const logHint = async (hintId: number) => {
        if (!activeSession) return;
        try {
            await fetchClient(`/sessions/${activeSession.sessionID}/hint`, {
                method: 'POST',
                body: JSON.stringify({ hintId: hintId })
            });
            alert("Hint Logged!");
        } catch (error) {
            console.error("Failed to log hint:", error);
        }
    };

    if (loading) return <div className="p-24 text-white text-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen p-8 md:p-24 bg-slate-950 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                        Game Master Control
                    </h1>
                    <div className="text-right">
                        <p className="text-slate-400">Welcome, {user?.firstName}</p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('user');
                                router.push('/login');
                            }}
                            className="text-sm text-red-400 hover:text-red-300 mt-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {activeSession && (
                    <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-2xl mb-12 animate-pulse-slow">
                        <h2 className="text-2xl font-bold text-green-400 mb-4">🔴 Live Session in Progress</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => logHint(1)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold"
                            >
                                💡 Log Hint
                            </button>
                            <button
                                onClick={() => endSession(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
                            >
                                ✅ Team Escaped!
                            </button>
                            <button
                                onClick={() => endSession(false)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold"
                            >
                                ❌ Time's Up
                            </button>
                        </div>
                    </div>
                )}

                <h2 className="text-2xl font-semibold mb-6">Upcoming Missions</h2>
                <div className="grid gap-6">
                    {bookings.length === 0 ? (
                        <p className="text-slate-500">No confirmed bookings found.</p>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking.bookingID} className="bg-slate-900/60 border border-slate-700 p-6 rounded-xl flex justify-between items-center hover:border-blue-500/50 transition-all">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{booking.roomName}</h3>
                                    <p className="text-slate-400 text-sm mb-2">
                                        {new Date(booking.scheduledTime).toLocaleString('en-US', {
                                            timeZone: 'UTC',
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        })}
                                    </p>
                                    <div className="flex gap-4 text-sm text-slate-500">
                                        <span>👤 {booking.firstName} {booking.lastName}</span>
                                        <span>👥 {booking.numPlayers} Players</span>
                                        <span>⏱️ {booking.durationMinutes} mins</span>
                                    </div>
                                </div>

                                {!activeSession && (
                                    <button
                                        onClick={() => startSession(booking.bookingID)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20"
                                    >
                                        Start Mission
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
