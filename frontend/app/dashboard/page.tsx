"use client";

import { useEffect, useState } from 'react';
import { fetchClient } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface Booking {
    bookingID: number;
    roomName: string;
    scheduledTime: string;
    status: string;
    amountDue: number;
    invoiceStatus: string;
    invoiceID?: number;
}

export default function DashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [processing, setProcessing] = useState(false);

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
            .then((data) => {
                console.log("Bookings:", data)
                setBookings(data)
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    const openPaymentModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedBooking(null);
        setPaymentMethod('Credit Card');
    };

    const handlePayment = async () => {
        if (!selectedBooking) return;

        setProcessing(true);
        try {
            const invoiceId = selectedBooking.invoiceID;

            await fetchClient(`/bookings/invoices/${invoiceId}/pay`, {
                method: 'POST',
                body: JSON.stringify({
                    amount: selectedBooking.amountDue,
                    paymentMethod: paymentMethod
                })
            });

            if (user) {
                await fetchBookings(user.id);
            }

            closePaymentModal();
            alert('Payment successful! Your invoice has been marked as paid and you earned 10 loyalty points!');
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <div className="relative min-h-screen p-8 md:p-24 bg-slate-950 text-white">
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
                        <>
                            <div className="text-center py-12 text-slate-500">
                                <a href="/rooms" className="text-purple-400 hover:underline">Book a room</a>
                            </div>
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
                                                <td className="p-4 text-slate-300">
                                                    {new Date(booking.scheduledTime).toLocaleString('en-US', {
                                                        timeZone: 'UTC',
                                                        year: 'numeric',
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                    })}
                                                </td>
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
                                                        <button
                                                            onClick={() => openPaymentModal(booking)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showPaymentModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                            Complete Payment
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center py-3 border-b border-slate-700">
                                <span className="text-slate-400">Mission</span>
                                <span className="font-medium">{selectedBooking.roomName}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-slate-700">
                                <span className="text-slate-400">Scheduled</span>
                                <span className="font-medium text-sm">{new Date(selectedBooking.scheduledTime).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-slate-700">
                                <span className="text-slate-400">Amount Due</span>
                                <span className="font-mono text-xl font-bold text-green-400">${selectedBooking.amountDue}</span>
                            </div>

                            <div className="pt-4">
                                <label className="block text-slate-400 mb-2">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>Credit Card</option>
                                    <option>Debit Card</option>
                                    <option>PayPal</option>
                                    <option>Cash</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-300">
                                💎 You'll earn <span className="font-bold">10 loyalty points</span> with this payment!
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closePaymentModal}
                                disabled={processing}
                                className="flex-1 px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Processing...' : `Pay $${selectedBooking.amountDue}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
