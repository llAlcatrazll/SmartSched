import React, { useState } from 'react';

export default function VehicleBooking() {
    const [showForm, setShowForm] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [form, setForm] = useState({
        vehicleType: '',
        requestor: '',
        date: '',
        department: '',
        purpose: ''
    });
    const [editingId, setEditingId] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId !== null) {
            const updated = bookings.map((b, idx) =>
                idx === editingId ? form : b
            );
            setBookings(updated);
            setEditingId(null);
        } else {
            setBookings([...bookings, form]);
        }

        setForm({
            vehicleType: '',
            requestor: '',
            date: '',
            department: '',
            purpose: ''
        });
        setShowForm(false);
    };

    const handleEdit = (index) => {
        setEditingId(index);
        setForm(bookings[index]);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (index) => {
        if (!window.confirm('Delete this vehicle booking?')) return;
        setBookings(bookings.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            {/* Collapsible Create Booking */}
            <div className="mb-6">
                <button
                    className="w-full flex items-center justify-between px-8 py-5 bg-[#96161C] text-white text-xl font-bold rounded-t-xl focus:outline-none"
                    onClick={() => setShowForm(!showForm)}
                >
                    <span>Vehicle Booking</span>
                    <svg
                        className={`w-7 h-7 transform transition-transform ${showForm ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-[#f9f9f9] px-8 py-8 rounded-b-xl shadow-md border border-t-0 border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Vehicle Type*</label>
                                <select
                                    name="vehicleType"
                                    value={form.vehicleType}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Car">Car</option>
                                    <option value="Van">Van</option>
                                    <option value="Bus">Bus</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Requestor*</label>
                                <input
                                    type="text"
                                    name="requestor"
                                    placeholder='Juan Dela Cruz'
                                    value={form.requestor}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Department*</label>
                                <input
                                    type="text"
                                    name="department"
                                    placeholder='AGSO'
                                    value={form.department}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date*</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-1">Purpose*</label>
                            <textarea
                                name="purpose"
                                value={form.purpose}
                                placeholder='Community Outreach program'
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                                required
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="submit" className="bg-[#96161C] text-white px-8 py-2 rounded-lg">
                                {editingId !== null ? 'Save' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-gray-200 px-8 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-md p-8 w-full">
                <h2 className="text-2xl font-bold text-[#96161C] mb-4">Vehicle Bookings</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#96161C]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase rounded-tl-xl">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Requestor</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Purpose</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">No vehicle bookings yet.</td>
                            </tr>
                        ) : (
                            bookings.map((b, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">{b.vehicleType}</td>
                                    <td className="px-6 py-4">{b.requestor}</td>
                                    <td className="px-6 py-4">{b.department}</td>
                                    <td className="px-6 py-4">{b.date}</td>
                                    <td className="px-6 py-4">{b.purpose}</td>
                                    <td className="px-6 py-4 flex gap-2 justify-end">
                                        <button onClick={() => handleEdit(index)} className="text-[#96161C] hover:text-[#7a1217]">Edit</button>
                                        <button onClick={() => handleDelete(index)} className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
