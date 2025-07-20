import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Building, CalendarDays, Filter } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const userId = Number(localStorage.getItem('currentUserId'));
        if (!userId) return;

        // Fetch User Details
        fetch(`http://localhost:5000/api/fetch-user/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                }
            });

        // Fetch Bookings for this user
        fetch('http://localhost:5000/api/fetch-bookings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const userBookings = data.bookings.filter(b => b.creator_id === userId);
                    setBookings(userBookings);
                }
            });
    }, []);


    return (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl mx-auto">
            {/* Left: Profile Card */}
            <div className="md:w-1/5 w-full">
                <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center mb-6">
                    <div className="bg-[#96161C] rounded-full p-3 mb-3">
                        <User className="text-white w-14 h-14" />
                    </div>
                    <h1 className="text-xl font-bold mb-1 text-center">{user?.name || 'Loading...'}</h1>
                    <div className="flex flex-col items-center gap-1 text-gray-700 text-sm">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#96161C]" />
                            <span>{user?.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#96161C]" />
                            <span>{user?.contact || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-[#96161C]" />
                            <span>{user?.affiliation || '-'}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4 mt-4">
                    <div className="font-semibold text-[#96161C] mb-2 flex items-center gap-2">
                        <Filter className="w-5 h-5" /> Preferences
                    </div>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-center gap-2">
                            <span>🔔</span> Notifications
                        </li>
                        <li className="flex items-center gap-2">
                            <span>🔒</span> Privacy
                        </li>
                        <li className="flex items-center gap-2">
                            <span>⚙️</span> Settings
                        </li>
                    </ul>
                </div>
            </div>

            {/* Center: Bookings */}
            <div className="md:w-3/5 w-full">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-[#96161C] flex items-center gap-2">
                        <CalendarDays className="w-6 h-6" /> My Bookings
                    </h2>
                    {bookings.length === 0 ? (
                        <p className="text-gray-500">No bookings yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#96161C]">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-xl">Event</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Facility</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Time</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {bookings.map((b, idx) => (
                                        <tr
                                            key={b.id}
                                            className={`transition hover:bg-[#f8eaea] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                        >
                                            <td className="px-4 py-2 font-semibold text-[#96161C]">{b.event_name}</td>
                                            <td className="px-4 py-2">{b.event_facility}</td>
                                            <td className="px-4 py-2">{b.event_date}</td>
                                            <td className="px-4 py-2">
                                                {b.starting_time} - {b.ending_time}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow
                                                    ${b.status === 'Approved'
                                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                                        : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                                    }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Filters/Actions */}
            <div className="md:w-1/5 w-full">
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <div className="font-semibold text-[#96161C] mb-4 flex items-center gap-2">
                        <Filter className="w-5 h-5" /> Filters
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-700">Status</label>
                            <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96161C]">
                                <option>All</option>
                                <option>Approved</option>
                                <option>Pending</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-700">Date</label>
                            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96161C]" />
                        </div>
                        <button className="w-full mt-2 bg-[#96161C] text-white py-2 rounded-lg font-semibold hover:bg-[#7a1217] transition">
                            Apply Filters
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="font-semibold text-[#96161C] mb-2">Quick Links</div>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-center gap-2">
                            <span>📄</span> My Settings
                        </li>
                        <li className="flex items-center gap-2">
                            <span>💬</span> Messages
                        </li>
                        <li className="flex items-center gap-2">
                            <span>📅</span> Calendar
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
