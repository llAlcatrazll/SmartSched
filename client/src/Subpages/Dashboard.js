import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Pie chart for booking status
const campaignData = [
    { name: 'Approved', value: 12 },
    { name: 'Pending', value: 5 },
    { name: 'Declined', value: 3 },
];
const CAMPAIGN_COLORS = ['#34d399', '#fbbf24', '#ef4444'];

// Bar chart for bookings per month
const salesData = [
    { month: 'Jan', bookings: 20 },
    { month: 'Feb', bookings: 35 },
    { month: 'Mar', bookings: 28 },
    { month: 'Apr', bookings: 40 },
    { month: 'May', bookings: 32 },
    { month: 'Jun', bookings: 25 },
];

// Line chart for bookings per college
const revenueData = [
    { college: 'CCIS', bookings: 120 },
    { college: 'CEDAS', bookings: 95 },
    { college: 'CHS', bookings: 80 },
    { college: 'COE', bookings: 110 },
    { college: 'CABE', bookings: 60 },
];

const transactions = [
    { user: 'johndoe', date: '2021-09-01', facility: 'Room 101', status: 'Approved' },
    { user: 'jackdower', date: '2022-04-01', facility: 'Gym', status: 'Pending' },
    { user: 'aberdhonny', date: '2021-09-01', facility: 'Auditorium', status: 'Approved' },
    { user: 'goodmanave', date: '2022-11-05', facility: 'Conference Hall', status: 'Approved' },
    { user: 'stevebower', date: '2022-11-02', facility: 'Room 202', status: 'Rejected' },
    { user: 'aberdhonny', date: '2021-09-01', facility: 'Room 101', status: 'Approved' },
    { user: 'wootzifer', date: '2019-04-15', facility: 'Lab', status: 'Pending' },
    { user: 'jackdower', date: '2022-04-01', facility: 'Gym', status: 'Pending' },
];

export default function Dashboard() {
    return (
        <div className="bg-white min-h-screen p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#96161C]">DASHBOARD</h1>
                    <p className="text-green-600 mt-1">Welcome to your dashboard</p>
                </div>
                <button className="bg-[#96161C] hover:bg-red-700 text-white px-4 py-2 rounded font-semibold mt-4 md:mt-0 shadow-lg border-b-4 border-[#ffb3b3] transition">
                    DOWNLOAD REPORTS
                </button>
            </div>

            {/* Top Row: Booking Status | Bookings Per Month | Recent Bookings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Booking Status */}
                <div className="bg-gray-50 rounded-lg p-4 shadow flex flex-col items-center border-t-4 border-[#96161C]">
                    <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#96161C] inline-block"></span>
                        Booking Status
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={campaignData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value" z
                                label={({ name, percent }) =>
                                    `${name} (${(percent * 100).toFixed(0)}%)`
                                }
                            >
                                {campaignData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CAMPAIGN_COLORS[index % CAMPAIGN_COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2">
                        {campaignData.map((entry, idx) => (
                            <div key={entry.name} className="flex items-center gap-1 text-xs">
                                <span className="inline-block w-3 h-3 rounded-full" style={{ background: CAMPAIGN_COLORS[idx] }}></span>
                                <span className="font-semibold text-gray-700">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Bookings Per Month */}
                <div className="bg-gray-50 rounded-lg p-4 shadow flex flex-col items-center border-t-4 border-[#96161C]">
                    <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#96161C] inline-block"></span>
                        Bookings Per Month
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="bookings" fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Recent Bookings */}
                <div className="bg-gray-50 rounded-lg p-4 shadow border-t-4 border-[#96161C]">
                    <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#96161C] inline-block"></span>
                        Recent Bookings
                    </div>
                    <div>
                        {/* Header Row */}
                        <div className="hidden md:grid grid-cols-4 font-semibold text-gray-600 text-xs pb-2 border-b">
                            <div>Booked By</div>
                            <div>Facility</div>
                            <div>Date</div>
                            <div>Status</div>
                        </div>
                        {/* Booking Rows */}
                        {transactions.map((t, i) => (
                            <div
                                key={i}
                                className={`grid grid-cols-1 md:grid-cols-4 items-center py-3 border-b last:border-b-0
                                    ${i % 2 === 0 ? 'bg-white md:bg-transparent' : 'bg-gray-100 md:bg-transparent'}`}
                            >
                                {/* Booked By & Facility (stacked on mobile, inline on desktop) */}
                                <div className="md:col-span-1">
                                    <span className="font-medium text-gray-800">{t.user}</span>
                                    <span className="block md:hidden text-gray-500 text-xs">{t.facility}</span>
                                </div>
                                <div className="hidden md:block md:col-span-1 text-gray-500">{t.facility}</div>
                                <div className="md:col-span-1 text-gray-700 text-sm">{t.date}</div>
                                <div className="md:col-span-1">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold
                                            ${t.status === 'Approved'
                                                ? 'bg-green-100 text-green-700'
                                                : t.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700 border border-[#96161C]'
                                            }`}
                                    >
                                        {t.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom: Bookings Per College */}
            <div className="bg-gray-50 rounded-lg p-4 shadow mb-6 border-l-4 border-[#96161C]">
                <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#96161C] inline-block"></span>
                    Bookings Per College
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="college" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bookings" stroke="#96161C" strokeWidth={3} dot={{ r: 6, fill: "#96161C" }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}