"use client";

import { useEffect, useState } from 'react';
import { fetchClient } from '@/utils/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Room {
    roomID: number;
    name: string;
    description: string;
    difficultyLevel: number;
    maxPlayers: number;
    durationMinutes: number;
}

export default function RoomDetailsPage() {
    const { id } = useParams();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchClient(`/rooms/${id}`)
                .then(setRoom)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="p-24 text-center text-white">Loading room details...</div>;
    if (!room) return <div className="p-24 text-center text-white">Room not found</div>;

    return (
        <div className="min-h-screen p-24 bg-slate-950 text-white">
            <div className="max-w-4xl mx-auto">
                <Link href="/rooms" className="text-slate-400 hover:text-white mb-8 inline-block">← Back to Rooms</Link>

                <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
                    <div className="h-64 bg-slate-800 flex items-center justify-center">
                        <span className="text-6xl">🕵️‍♂️</span>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-4xl font-bold">{room.name}</h1>
                            <div className="flex gap-4">
                                <span className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm">
                                    Difficulty: {room.difficultyLevel}/10
                                </span>
                                <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm">
                                    {room.durationMinutes} Minutes
                                </span>
                            </div>
                        </div>

                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            {room.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-xl font-semibold mb-4">Room Details</h3>
                                <ul className="space-y-2 text-slate-400">
                                    <li>• Max Players: {room.maxPlayers}</li>
                                    <li>• Private Booking Available</li>
                                    <li>• Live Actor (Optional)</li>
                                </ul>
                            </div>
                            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-xl font-semibold mb-4">Ready to Escape?</h3>
                                <p className="text-slate-400 mb-4">
                                    Book your slot now and challenge your team!
                                </p>
                                <Link
                                    href={`/book/${room.roomID}`}
                                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02]"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
