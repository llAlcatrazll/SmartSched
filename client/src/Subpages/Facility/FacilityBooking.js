import React, { useState, useEffect } from 'react';

function formatTime(timeStr) {
    if (!timeStr) return '';
    // Handles "HH:mm" or "HH:mm:ss"
    const [hour, minute] = timeStr.split(':');
    let h = parseInt(hour, 10);
    const m = minute;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
}

export default function Booking() {
    const [showForm, setShowForm] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [equipmentRows, setEquipmentRows] = useState([]);

    // const [showEquipment, setshowEquipment] = useState(false);
    const [form, setForm] = useState({
        title: '',
        facility: '',
        date: '',
        startTime: '',
        endTime: '',
        requestedBy: '',
        org: '',
        contact: ''
    });

    // Pagination state

    // Filter state
    const [filter, setFilter] = useState({
        search: '',
        status: 'All',
        facility: 'All',
        org: 'All',
        dateFrom: '',
        dateTo: ''
    });

    // Fetch bookings from backend
    useEffect(() => {
        fetch('http://localhost:5000/api/fetch-bookings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBookings(data.bookings);
                } else {
                    console.log('Fetch bookings failed:', data.message || data.error);
                }
            })
            .catch(err => {
                console.log('Fetch bookings error:', err);
            });
    }, []);

    // Filtering logic
    useEffect(() => {
        let result = bookings;

        // Search by event, facility, requested by, org, contact
        if (filter.search.trim()) {
            const q = filter.search.trim().toLowerCase();
            result = result.filter(b =>
                (b.event_name || b.title || '').toLowerCase().includes(q) ||
                (b.event_facility || b.facility || '').toLowerCase().includes(q) ||
                (b.requested_by || b.requestedBy || '').toLowerCase().includes(q) ||
                (b.organization || b.org || '').toLowerCase().includes(q) ||
                (b.contact || '').toLowerCase().includes(q)
            );
        }

        // Status filter
        if (filter.status !== 'All') {
            result = result.filter(b => (b.status || 'Pending') === filter.status);
        }

        // Facility filter
        if (filter.facility !== 'All') {
            result = result.filter(b => (b.event_facility || b.facility || '') === filter.facility);
        }

        // Org filter
        if (filter.org !== 'All') {
            result = result.filter(b => (b.organization || b.org || '') === filter.org);
        }

        // Date range filter
        if (filter.dateFrom) {
            result = result.filter(b => (b.event_date || b.date) >= filter.dateFrom);
        }
        if (filter.dateTo) {
            result = result.filter(b => (b.event_date || b.date) <= filter.dateTo);
        }

        setFiltered(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [bookings, filter]);

    // Unique values for dropdowns
    const facilities = Array.from(new Set(bookings.map(b => b.event_facility || b.facility || '').filter(Boolean)));
    const orgs = Array.from(new Set(bookings.map(b => b.organization || b.org || '').filter(Boolean)));
    const statuses = ['All', 'Approved', 'Pending', 'Rejected'];
    const [editingId, setEditingId] = useState(null);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFilterChange = e => setFilter({ ...filter, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `http://localhost:5000/api/edit-booking/${editingId}`
                : 'http://localhost:5000/api/create-booking';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_date: form.date,
                    starting_time: form.startTime,
                    ending_time: form.endTime,
                    event_name: form.title,
                    event_facility: form.facility,
                    requested_by: form.requestedBy,
                    organization: form.org,
                    contact: form.contact
                })
            });

            const data = await response.json();

            if (data.success) {
                const bookingId = data.id;


                // Post each equipment row
                for (const eq of equipmentRows) {
                    await fetch('http://localhost:5000/api/create-equipment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: eq.type,
                            quantity: eq.quantity,
                            booking_id: bookingId
                        })
                    });
                }

                alert(editingId ? 'Booking updated successfully' : 'Booking created successfully');
                fetch('http://localhost:5000/api/fetch-bookings')
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setBookings(data.bookings);
                        }
                    });
                setForm({
                    title: '',
                    facility: '',
                    date: '',
                    startTime: '',
                    endTime: '',
                    requestedBy: '',
                    org: '',
                    contact: ''
                });
                setEquipmentRows([]);
                setEditingId(null);
                setShowForm(false);
            } else {
                alert(data.message || 'Booking failed');
            }

        } catch (err) {
            alert('Server error');
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            const res = await fetch(`/api/delete-booking/${id}`, {
                method: 'PATCH'
            });
            const data = await res.json();

            if (data.success) {
                alert('Booking marked as deleted');
                // Refetch your bookings or remove from state
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            alert('Server error');
        }
    };



    const extractDate = (datetime) => {
        if (!datetime) return '';
        return datetime.split('T')[0];
    };

    const handleEdit = (booking) => {
        setEditingId(booking.id); // capture ID so we know it's edit mode
        setForm({
            title: booking.event_name || booking.title || '',
            facility: booking.event_facility || booking.facility || '',
            date: extractDate(booking.event_date || booking.date || ''),
            startTime: booking.starting_time || booking.startTime || '',
            endTime: booking.ending_time || booking.endTime || '',
            requestedBy: booking.requested_by || booking.requestedBy || '',
            org: booking.organization || booking.org || '',
            contact: booking.contact || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    // Pagination logic
    const totalRows = filtered.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleRowsPerPageChange = e => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="w-full">
            {/* Collapsible Create Booking */}
            <div className="mb-6">
                <button
                    className="w-full flex items-center justify-between px-8 py-5 bg-[#96161C] text-white text-xl font-bold rounded-t-xl focus:outline-none transition"
                    onClick={() => setShowForm(!showForm)}
                >
                    <span>Create Booking</span>
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
                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#f9f9f9] px-8 py-8 rounded-b-xl shadow-md border border-t-0 border-gray-200 w-full"
                    >
                        {/* Date & Time */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-3 text-[#96161C]">Date & Time</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event date*</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Starting time*</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={form.startTime}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ending time*</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={form.endTime}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Event and Venue */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-3 text-[#96161C]">Event and Venue</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event name*</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="General Assembly"
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event facility*</label>
                                    <input
                                        type="text"
                                        name="facility"
                                        value={form.facility}
                                        onChange={handleChange}
                                        placeholder="Gymnasium"
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Booker */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-3 text-[#96161C]">Booker</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Requested by*</label>
                                    <input
                                        type="text"
                                        name="requestedBy"
                                        value={form.requestedBy}
                                        onChange={handleChange}
                                        placeholder="Juan De la Cruz"
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Org / Dept*</label>
                                    <input
                                        type="text"
                                        name="org"
                                        value={form.org}
                                        onChange={handleChange}
                                        placeholder="AGSO"
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Contact*</label>
                                    <input
                                        type="text"
                                        name="contact"
                                        value={form.contact}
                                        onChange={(e) => {
                                            let input = e.target.value.replace(/\D/g, ''); // Remove all non-digits
                                            if (input.length <= 11) {
                                                setForm(prev => ({ ...prev, contact: input }));
                                            }
                                        }}
                                        placeholder="09XXXXXXXXX"
                                        pattern="^09\d{9}$"
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                    />


                                </div>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (equipmentRows.length < 5) {
                                                setEquipmentRows([...equipmentRows, { type: '', quantity: '' }]);
                                            }
                                        }}
                                        className="bg-[#96161C] text-white px-8 py-2 rounded-lg font-semibold hover:bg-[#7a1217] transition"
                                    >
                                        Add Equipment +
                                    </button>
                                    {equipmentRows.map((row, index) => (
                                        <div key={index} className="flex gap-4 items-center my-2">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium mb-1">Equipment Type</label>
                                                <select
                                                    value={row.type}
                                                    onChange={(e) => {
                                                        const updated = [...equipmentRows];
                                                        updated[index].type = e.target.value;
                                                        setEquipmentRows(updated);
                                                    }}
                                                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                                    required
                                                >
                                                    <option value="">Select Equipment</option>
                                                    <option value="Speaker">Speaker</option>
                                                    <option value="DLP">DLP</option>
                                                    <option value="Microphone">Microphone</option>
                                                    <option value="Extension Wire">Extension Wire</option>
                                                    <option value="HDMI Cable">HDMI Cable</option>
                                                </select>
                                            </div>

                                            <div className="flex-1">
                                                <label className="block text-sm font-medium mb-1">Quantity</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={row.quantity}
                                                    onChange={(e) => {
                                                        const updated = [...equipmentRows];
                                                        updated[index].quantity = e.target.value;
                                                        setEquipmentRows(updated);
                                                    }}
                                                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = equipmentRows.filter((_, i) => i !== index);
                                                    setEquipmentRows(updated);
                                                }}
                                                className="text-red-600 hover:text-red-800 text-lg font-bold"
                                                title="Remove"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}


                                </div>

                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 justify-end">
                            <button
                                type="submit"
                                className="bg-[#96161C] text-white px-8 py-2 rounded-lg font-semibold hover:bg-[#7a1217] transition"
                            >
                                {editingId ? 'Save' : 'Create'}
                            </button>

                            <button
                                type="button"
                                className="bg-gray-200 text-gray-800 px-8 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-xl shadow-md p-8 w-full mt-8">
                {/* My Bookings Title and Filter */}
                <div> <h2 className="text-2xl font-bold text-[#96161C] flex items-center gap-2 justify-start mb-2 md:mb-0">
                    <svg className="w-7 h-7 text-[#96161C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    My Bookings
                </h2></div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">

                    {/* Filter Controls - Full width on right */}
                    <div className="flex-1 w-full">
                        <div className="bg-white rounded-xl shadow-none p-0 w-full flex flex-wrap gap-4 items-end justify-between">
                            <div className="flex-1 min-w-[180px] max-w-xs">
                                <label className="block text-xs font-semibold mb-1 text-[#96161C]">Search</label>
                                <input
                                    type="text"
                                    name="search"
                                    value={filter.search}
                                    onChange={handleFilterChange}
                                    placeholder="Search event, facility, org, etc."
                                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                />
                            </div>
                            <div className="flex-1 min-w-[120px] max-w-xs">
                                <label className="block text-xs font-semibold mb-1 text-[#96161C]">Status</label>
                                <select
                                    name="status"
                                    value={filter.status}
                                    onChange={handleFilterChange}
                                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                >
                                    {statuses.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[140px] max-w-xs">
                                <label className="block text-xs font-semibold mb-1 text-[#96161C]">Facility</label>
                                <select
                                    name="facility"
                                    value={filter.facility}
                                    onChange={handleFilterChange}
                                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                >
                                    <option value="All">All</option>
                                    {facilities.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[140px] max-w-xs">
                                <label className="block text-xs font-semibold mb-1 text-[#96161C]">Org/Dept</label>
                                <select
                                    name="org"
                                    value={filter.org}
                                    onChange={handleFilterChange}
                                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                >
                                    <option value="All">All</option>
                                    {orgs.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[120px] max-w-xs">
                                <label className="block text-xs font-semibold mb-1 text-[#96161C]">Date From</label>
                                <input
                                    type="date"
                                    name="dateFrom"
                                    value={filter.dateFrom}
                                    onChange={handleFilterChange}
                                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                />
                            </div>
                            <div className="flex-1 min-w-[120px] max-w-xs">
                                <label className="block text-xs font-semibold mb-1 text-[#96161C]">Date To</label>
                                <input
                                    type="date"
                                    name="dateTo"
                                    value={filter.dateTo}
                                    onChange={handleFilterChange}
                                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                />
                            </div>
                            <button
                                className="bg-[#96161C] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#7a1217] transition"
                                onClick={() => setFilter({
                                    search: '',
                                    status: 'All',
                                    facility: 'All',
                                    org: 'All',
                                    dateFrom: '',
                                    dateTo: ''
                                })}
                                type="button"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Header */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#96161C]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-xl">
                                    Event
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Facility
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Requested By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Org/Dept
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((b, idx) => (
                                    <tr
                                        key={b.id || idx}
                                        className={`transition hover:bg-[#f8eaea] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#96161C]">{b.event_name || b.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{b.event_facility || b.facility || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(b.event_date || b.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: '2-digit',
                                            })}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(b.starting_time && b.ending_time)
                                                ? `${formatTime(b.starting_time)} - ${formatTime(b.ending_time)}`
                                                : b.time}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{b.requested_by || b.requestedBy || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{b.organization || b.org || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{b.contact || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow
                                                ${b.status === 'Approved'
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : b.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                                        : 'bg-red-100 text-red-700 border border-red-300'
                                                }`}>
                                                {b.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleEdit(b)}
                                                className="text-[#96161C] hover:text-[#7a1217] transition"
                                                title="Edit Booking"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M17.414 2.586a2 2 0 010 2.828L8.414 14.414l-4.828 1.414 1.414-4.828L14.586 2.586a2 2 0 012.828 0z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handleDelete(b.id)} // assuming b.id is the primary key
                                                className="text-red-600 hover:text-red-800 transition"
                                                title="Delete Booking"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M9 3v1H4v2h16V4h-5V3H9zm1 5v12h2V8h-2zm4 0v12h2V8h-2z" />
                                                </svg>
                                            </button>
                                        </td>


                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls & Rows Per Page - Centered at bottom */}
                {totalPages > 1 || filtered.length > 0 ? (
                    <div className="flex flex-col items-center gap-4 mt-6">
                        <div className="flex items-center gap-2 justify-center">
                            <label className="text-sm font-semibold text-[#96161C]">Rows per page:</label>
                            <select
                                value={rowsPerPage}
                                onChange={handleRowsPerPageChange}
                                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                            >
                                {[5, 10, 15, 25, 50, 100].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Prev
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`px-3 py-1 rounded font-semibold ${currentPage === i + 1 ? 'bg-[#96161C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}