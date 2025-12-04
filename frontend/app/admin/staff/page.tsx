"use client";

import { useEffect, useState } from 'react';
import { fetchClient } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface Staff {
    userID: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Admin' | 'GameMaster';
    hireDate: string;
    payRate: number;
}

export default function StaffManagementPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            if (userData.role !== 'Admin') {
                router.push('/dashboard');
                return;
            }
            fetchStaff();
        } else {
            router.push('/login');
        }
    }, [router]);

    const fetchStaff = async () => {
        try {
            const data = await fetchClient('/staff/');
            setStaffList(data);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        try {
            await fetchClient(`/staff/${id}`, { method: 'DELETE' });
            setStaffList(staffList.filter(s => s.userID !== id));
        } catch (error) {
            alert("Failed to delete staff member");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        try {
            await fetchClient(`/staff/${editingStaff.userID}`, {
                method: 'PUT',
                body: JSON.stringify({
                    role: editingStaff.role,
                    payRate: editingStaff.payRate
                })
            });
            setEditingStaff(null);
            fetchStaff();
        } catch (error) {
            alert("Failed to update staff member");
        }
    };

    if (loading) return <div className="p-24 text-white text-center">Loading Staff Data...</div>;

    return (
        <div className="min-h-screen p-8 md:p-24 bg-slate-950 text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Staff Management
                    </h1>
                    <button
                        onClick={() => router.push('/register')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold"
                    >
                        + Add New Staff
                    </button>
                </div>

                <div className="bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-sm">
                            <tr>
                                <th className="p-6">Name</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">Email</th>
                                <th className="p-6">Pay Rate</th>
                                <th className="p-6">Hire Date</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {staffList.map((staff) => (
                                <tr key={staff.userID} className="hover:bg-white/5 transition-colors">
                                    <td className="p-6 font-medium">{staff.firstName} {staff.lastName}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs ${staff.role === 'Admin' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'
                                            }`}>
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-slate-400">{staff.email}</td>
                                    <td className="p-6 font-mono">${staff.payRate}</td>
                                    <td className="p-6 text-slate-400">{new Date(staff.hireDate).toLocaleDateString()}</td>
                                    <td className="p-6 text-right space-x-4">
                                        <button
                                            onClick={() => setEditingStaff(staff)}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(staff.userID)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {editingStaff && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-slate-900 p-8 rounded-2xl max-w-md w-full border border-slate-700">
                            <h2 className="text-2xl font-bold mb-6">Edit Staff Member</h2>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Role</label>
                                    <select
                                        value={editingStaff.role}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as any })}
                                        className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="GameMaster">Game Master</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Pay Rate ($/hr)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingStaff.payRate}
                                        onChange={(e) => setEditingStaff({ ...editingStaff, payRate: parseFloat(e.target.value) })}
                                        className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700"
                                    />
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setEditingStaff(null)}
                                        className="flex-1 py-3 rounded-lg hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
