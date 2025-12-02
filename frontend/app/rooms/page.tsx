"use client";

import { useEffect, useState } from 'react';
import { fetchClient } from '@/utils/api';
import Link from 'next/link';
import Image from 'next/image';

interface Room {
    roomID: number;
    name: string;
    description: string;
    difficultyLevel: number;
    maxPlayers: number;
    durationMinutes: number;
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClient('/rooms')
            .then(setRooms)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-pulse text-purple-500 text-xl font-mono">Loading Enigma Engine...</div>
        </div>
    );

    return (
        <div className="relative min-h-screen p-8 md:p-24 bg-slate-950 text-white overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/bg-rooms.png"
                    alt="Rooms Background"
                    fill
                    className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Choose Your Adventure
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Step into a world of mystery. Select a room to begin your journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room) => (
                        <div key={room.roomID} className="group bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] hover:-translate-y-2">
                            <div className="h-48 bg-slate-800/50 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                                <span className="text-6xl transform group-hover:scale-110 transition-transform duration-500">🗝️</span>
                            </div>

                            <div className="p-6 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold group-hover:text-purple-400 transition-colors">{room.name}</h2>
                                    <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
                                        {room.durationMinutes}m
                                    </span>
                                </div>

                                <p className="text-slate-400 mb-6 line-clamp-2 text-sm leading-relaxed">{room.description}</p>

                                <div className="flex justify-between items-center text-sm text-slate-500 mb-6 border-t border-slate-700/50 pt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-500">★</span>
                                        <span>Difficulty: {room.difficultyLevel}/10</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-400">👥</span>
                                        <span>Max {room.maxPlayers}</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/rooms/${room.roomID}`}
                                    className="block w-full text-center bg-white/5 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-white/10 hover:border-transparent"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
