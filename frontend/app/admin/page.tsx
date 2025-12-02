"use client";

import { useEffect, useState } from 'react';
import { fetchClient } from '@/utils/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminDashboard() {
    const [revenue, setRevenue] = useState<any[]>([]);
    const [performance, setPerformance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            if (userData.role !== 'Admin') {
                router.push('/dashboard');
                return;
            }
            setUser(userData);
            fetchAnalytics();
        } else {
            router.push('/login');
        }
    }, [router]);

    const fetchAnalytics = async () => {
        try {
            const [revData, perfData] = await Promise.all([
                fetchClient('/analytics/revenue'),
                fetchClient('/analytics/performance')
            ]);
            setRevenue(revData);
            setPerformance(perfData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="relative min-h-screen p-8 md:p-24 bg-slate-950 text-white">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/bg-dashboard.png"
                    alt="Admin Background"
                    fill
                    className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 to-slate-950" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                    Command Center
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Revenue Report */}
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl p-8 rounded-2xl">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                            <span className="text-green-400">💰</span> Monthly Revenue
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3 font-medium">Room</th>
                                        <th className="p-3 font-medium">Month</th>
                                        <th className="p-3 font-medium text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {revenue.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-medium">{item.roomName}</td>
                                            <td className="p-3 text-slate-400">{item.month}</td>
                                            <td className="p-3 text-right font-mono text-green-400">${item.totalRevenue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 shadow-2xl p-8 rounded-2xl">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                            <span className="text-blue-400">📊</span> Success Rates
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3 font-medium">Team Size</th>
                                        <th className="p-3 font-medium">Sessions</th>
                                        <th className="p-3 font-medium">Success Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {performance.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-medium">{item.numPlayers} Players</td>
                                            <td className="p-3 text-slate-400">{item.totalSessions}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${item.successRate > 70 ? 'bg-green-500' :
                                                                item.successRate > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${item.successRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-mono w-12 text-right">{Math.round(item.successRate)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
