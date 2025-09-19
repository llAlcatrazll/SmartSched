import React, { useState, useEffect } from 'react';
import { orgAbbreviations } from '../../constants/OrgAbbreviations';
import { orgAbbreviations as facilityList } from '../../constants/FacilitiesListing';
import { useLocation } from 'react-router-dom';

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
    const [editStatusIndex, setEditStatusIndex] = useState(null);
    const [showFacilityBreakdown, setShowFacilityBreakdown] = useState(false);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showRequesterInfo, setShowRequesterInfo] = useState(false);
    const [equipmentMap, setEquipmentMap] = useState({});
    const [deletedEquipmentIds, setDeletedEquipmentIds] = useState([]);
    const [orgSuggestions, setOrgSuggestions] = useState([]);
    const [showOrgSuggestions, setShowOrgSuggestions] = useState(false);
    const [facilitySuggestions, setFacilitySuggestions] = useState([]);
    const [showFacilitySuggestions, setShowFacilitySuggestions] = useState(false);
    const location = useLocation();


    useEffect(() => {
        const storedRole = localStorage.getItem('currentUserRole');
        if (storedRole === 'admin') {
            setShowFacilityBreakdown(true);
        }
    }, []);
    const handleStatusClick = (index) => {
        setEditStatusIndex(index);
    };

    const handleStatusChange = (index, newStatus, bookingId) => {
        // -> EDIT AND SAVE THE BOOKING
        const updated = [...bookings];
        updated[index].status = newStatus;
        setBookings(updated);
        setEditStatusIndex(null);

        try {
            fetch(`http://localhost:5000/api/update-booking-status/${bookingId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            }).then((res) => res.json())
                .then((data) => {
                    if (!data.success) {
                        alert('Failed to update status');
                    }
                });
        } catch (err) {
            console.log(err)
        }
    };

    const fetchEquipmentForBooking = async (bookingId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/fetch-booking-equipment?booking_id=${bookingId}`);
            const data = await res.json();

            if (data.success) {
                setEquipmentMap(prev => ({
                    ...prev,
                    [bookingId]: data.equipment,
                }));
            }
        } catch (err) {
            console.error(`Error fetching equipment for booking ${bookingId}:`, err);
        }
    };





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
    // useEffect(() => {
    //     fetch('http://localhost:5000/api/fetch-bookings')
    //         .then(res => res.json())
    //         .then(data => {
    //             if (data.success) {
    //                 setBookings(data.bookings);
    //             } else {
    //                 console.log('Fetch bookings failed:', data.message || data.error);
    //             }
    //         })
    //         .catch(err => {
    //             console.log('Fetch bookings error:', err);
    //         });
    // }, []);
    useEffect(() => {
        const storedUserId = localStorage.getItem('currentUserId');
        const storedUserRole = localStorage.getItem('currentUserRole');

        if (storedUserId && storedUserRole) {
            setUser({ id: parseInt(storedUserId), role: storedUserRole });
            setUserId(parseInt(storedUserId));
        }
    }, []);
    useEffect(() => {
        if (!user || !userId) return;

        fetch('http://localhost:5000/api/fetch-bookings')
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    console.log('Fetch bookings failed:', data.message || data.error);
                    return;
                }

                let visibleBookings = [];

                if (user.role === 'admin') {
                    visibleBookings = data.bookings.filter(b => b.deleted === false);
                } else if (user.role === 'user') {
                    visibleBookings = data.bookings.filter(
                        b => b.creator_id === userId && b.deleted === false
                    );
                }

                setBookings(visibleBookings);

                // Fetch equipment for each visible booking
                visibleBookings.forEach(b => {
                    fetchEquipmentForBooking(b.id);
                });
            })
            .catch(err => {
                console.log('Fetch bookings error:', err);
            });
    }, [user, userId]);



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
            result = result.filter(b => (b.status || 'pending') === filter.status);
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
    const statuses = ['All', 'approved', 'pending', 'declined', 'rescheduled'];
    const [editingId, setEditingId] = useState(null);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFilterChange = e => setFilter({ ...filter, [e.target.name]: e.target.value });
    const currentUserId = localStorage.getItem('currentUserId');
    const isConflict = false;

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Venue from form:', form.facility);

        let isConflict = false;

        // Only check for conflicts if NOT editing
        if (!editingId) {
            try {
                // Fetch bookings for this venue
                const res = await fetch(`http://localhost:5000/api/fetch-booking-conflicts?venue=${encodeURIComponent(form.facility)}`);
                const data = await res.json();
                if (data.success) {
                    console.log('Bookings for this venue:', data.bookings);

                    // Check for date and time conflicts
                    const newDate = form.date;
                    const newStart = form.startTime;
                    const newEnd = form.endTime;

                    function isTimeOverlap(startA, endA, startB, endB) {
                        return (startA < endB && endA > startB);
                    }

                    for (const b of data.bookings) {
                        const bDate = (b.event_date || b.date || '').split('T')[0];
                        const bStart = b.starting_time || b.startTime || '';
                        const bEnd = b.ending_time || b.endTime || '';

                        if (
                            bDate === newDate &&
                            isTimeOverlap(newStart, newEnd, bStart, bEnd)
                        ) {
                            isConflict = true;
                            console.log('Conflict found with booking:', b);
                            break;
                        }
                    }
                } else {
                    console.log('Failed to fetch bookings for this venue:', data.message);
                }
            } catch (err) {
                console.log('Error fetching bookings for this venue:', err);
            }

            if (isConflict) {
                console.log('Booking creation halted due to a conflict.');
                alert('Cannot create booking due to a conflict.');
                return;
            }
        }

        // Check if equipmentRows is empty or all equipment types are empty
        const hasEquipment = equipmentRows.some(eq => eq.type && eq.quantity);

        if (!hasEquipment) {
            const proceed = window.confirm(
                "Are you going to finish booking a venue without an equipment?\n\nPress OK to continue without equipment, or Cancel to go back."
            );
            if (!proceed) {
                // User chose not to proceed
                return;
            }
        }

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
                    contact: form.contact,
                    creator_id: currentUserId
                })
            });

            const data = await response.json();

            if (data.success) {
                const bookingId = editingId ? editingId : data.id;

                // If editing, update equipment using the new endpoint
                if (editingId) {
                    await fetch(`http://localhost:5000/api/edit-booking-equipment/${bookingId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            equipment: equipmentRows,
                            deletedIds: deletedEquipmentIds
                        })
                    });
                } else {
                    // If creating, add equipment as before
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
                window.location.reload(); // <-- reloads the page
                return;
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
            const res = await fetch(`http://localhost:5000/api/delete-booking/${id}`, {
                method: 'PUT'
            });
            const data = await res.json();

            if (data.success) {
                alert('Booking marked as deleted');
                // Refetch your bookings or remove from state
                window.location.reload(); // <-- reloads the page
                return;
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
        // Always fetch latest equipment for this booking and hydrate equipmentRows
        fetch(`http://localhost:5000/api/fetch-booking-equipment?booking_id=${booking.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEquipmentRows(data.equipment || []);
                } else {
                    setEquipmentRows([]);
                }
            })
            .catch(() => setEquipmentRows([]));
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        // If navigated with an editBookingId, trigger handleEdit
        if (location.state && location.state.editBookingId && bookings.length > 0) {
            const bookingToEdit = bookings.find(b => b.id === location.state.editBookingId);
            if (bookingToEdit) {
                handleEdit(bookingToEdit);
            }
        }
        // Optionally clear the state after using it
        // eslint-disable-next-line
    }, [location.state, bookings]);


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


    function getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    function calculateMinEndTime(startTime) {
        if (!startTime) return "06:00";

        const [hour, minute] = startTime.split(':').map(Number);
        const endHour = hour + 1;
        const resultHour = endHour < 10 ? `0${endHour}` : `${endHour}`;
        return `${resultHour}:${minute.toString().padStart(2, '0')}`;
    }
    function clearForm() {
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
    }

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
                                        min={!editingId ? getTomorrowDate() : undefined}
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
                                        min="06:00"
                                        max="22:00"
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
                                        disabled={!form.startTime}
                                        min={calculateMinEndTime(form.startTime)}
                                        max="22:00"
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
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1">Event facility*</label>
                                    <input
                                        type="text"
                                        name="facility"
                                        value={form.facility}
                                        onChange={e => {
                                            const value = e.target.value;
                                            setForm(prev => ({ ...prev, facility: value }));
                                            if (value.length > 0) {
                                                const suggestions = facilityList.filter(
                                                    f => f.toLowerCase().includes(value.toLowerCase())
                                                );
                                                setFacilitySuggestions(suggestions);
                                                setShowFacilitySuggestions(true);
                                            } else {
                                                setShowFacilitySuggestions(false);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setShowFacilitySuggestions(false), 100)}
                                        onFocus={() => {
                                            if (form.facility.length > 0) setShowFacilitySuggestions(true);
                                        }}
                                        placeholder="Gymnasium"
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                        autoComplete="off"
                                    />
                                    {showFacilitySuggestions && facilitySuggestions.length > 0 && (
                                        <ul className="absolute z-10 bg-white border border-gray-200 rounded shadow-md mt-1 max-h-48 overflow-y-auto w-full">
                                            {facilitySuggestions.map((f, idx) => (
                                                <li
                                                    key={idx}
                                                    className="px-4 py-2 hover:bg-[#fde8e8] cursor-pointer"
                                                    onMouseDown={() => {
                                                        setForm(prev => ({ ...prev, facility: f }));
                                                        setShowFacilitySuggestions(false);
                                                    }}
                                                >
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                                        onChange={e => {
                                            const value = e.target.value;
                                            setForm(prev => ({ ...prev, org: value }));
                                            if (value.length > 0) {
                                                const suggestions = orgAbbreviations.filter(
                                                    o =>
                                                        o.abbr.toLowerCase().includes(value.toLowerCase()) ||
                                                        o.meaning.toLowerCase().includes(value.toLowerCase())
                                                );
                                                setOrgSuggestions(suggestions);
                                                setShowOrgSuggestions(true);
                                            } else {
                                                setShowOrgSuggestions(false);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setShowOrgSuggestions(false), 100)}
                                        onFocus={() => {
                                            if (form.org.length > 0) setShowOrgSuggestions(true);
                                        }}
                                        placeholder="AGSO"
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                                        required
                                        autoComplete="off"
                                    />
                                    {showOrgSuggestions && orgSuggestions.length > 0 && (
                                        <ul className="absolute z-10 bg-white border border-gray-200 rounded shadow-md mt-1 max-h-48 overflow-y-auto w-full">
                                            {orgSuggestions.map((o, idx) => (
                                                <li
                                                    key={idx}
                                                    className="px-4 py-2 hover:bg-[#fde8e8] cursor-pointer"
                                                    onMouseDown={() => {
                                                        setForm(prev => ({ ...prev, org: o.abbr }));
                                                        setShowOrgSuggestions(false);
                                                    }}
                                                >
                                                    <span className="font-bold">{o.abbr}</span>
                                                    {o.abbr && <span className="text-gray-500 ml-2">{o.meaning}</span>}
                                                    {!o.abbr && <span className="text-gray-500">{o.meaning}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                                                    max="5"// MAX VALUE
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
                                                    // When removing equipment row:
                                                    if (equipmentRows[index].id) {
                                                        setDeletedEquipmentIds([...deletedEquipmentIds, equipmentRows[index].id]);
                                                    }
                                                    setEquipmentRows(equipmentRows.filter((_, i) => i !== index));
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
                                type="submit"
                                className="bg-[#727272] text-white px-8 py-2 rounded-lg font-semibold hover:bg-[#d4d4d4] transition"
                                onClick={() => clearForm()}
                            >
                                Clear
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
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={showRequesterInfo}
                                onChange={() => setShowRequesterInfo(prev => !prev)}
                                id="toggle-requester"
                                className="accent-[#96161C]"
                            />
                            <label htmlFor="toggle-requester" className="text-sm text-[#96161C] font-medium">
                                Show Requested By & Contact
                            </label>
                        </div>

                    </div>
                </div>

                {/* Table Header */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#96161C] position-sticky z-10 top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider rounded-tl-xl">Event</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">Facility</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">Date</th>
                                <th className="px-2 py-3 text-sm font-bold text-white uppercase tracking-wider text-center">Time</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">Org/Dept</th>
                                <th className="px-6 py-2 text-left text-sm font-bold text-white uppercase tracking-wider">Equipment</th>
                                {showRequesterInfo && (
                                    <>
                                        <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">Requested By</th>
                                        <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">Contact</th>
                                    </>
                                )}
                                <th className="px-6 py-3 text-left text-sm font-bold text-white uppercase tracking-wider">Status</th>
                                {showFacilityBreakdown && (
                                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">No bookings found.</td>
                                </tr>
                            ) : (
                                paginated.map((b, idx) => (
                                    <tr
                                        key={b.id || idx}
                                        className={`transition hover:bg-[#f8eaea] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fde8e8]'}`}>
                                        {/*  */}
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#96161C]">{b.event_name || b.title}</td>
                                        {/*  */}
                                        <td className="px-6 py-4 whitespace-nowrap">{b.event_facility || b.facility || '-'}</td>
                                        {/*  */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(() => {
                                                const d = (b.event_date || b.date || '').split('T')[0];
                                                if (!d) return '';
                                                const [year, month, day] = d.split('-');
                                                const dateObj = new Date(`${year}-${month}-${day}`);
                                                return dateObj.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                            })()}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {(b.starting_time && b.ending_time)
                                                ? `${formatTime(b.starting_time)} - ${formatTime(b.ending_time)}`
                                                : b.time}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">{b.organization || b.org || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {equipmentMap[b.id]?.length > 0 ? (
                                                <ul className="list-disc list-inside space-y-1">
                                                    {equipmentMap[b.id].map((item, idx) => (
                                                        <li key={idx}>{item.quantity}x {item.type}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-400 italic">No equipment</span>
                                            )}
                                        </td>

                                        {showRequesterInfo && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">{b.requested_by || b.requestedBy || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{b.contact || '-'}</td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleStatusClick(idx)}>
                                            {editStatusIndex === idx ? (
                                                <select
                                                    value={b.status}
                                                    onChange={(e) => handleStatusChange(idx, e.target.value, b.id)}
                                                    onBlur={() => setEditStatusIndex(null)}
                                                    autoFocus
                                                    className="text-xs px-3 py-1 border rounded-full focus:ring-2 focus:ring-[#96161C] font-bold shadow"
                                                    style={{ minWidth: 120 }}
                                                >
                                                    <option value="" disabled className="text-gray-400">Select status</option>
                                                    <option value="Pending" style={{ background: '#FEF3C7', color: '#B45309', fontWeight: 'bold' }}>Pending</option>
                                                    <option value="Approved" style={{ background: '#D1FAE5', color: '#047857', fontWeight: 'bold' }}>Approved</option>
                                                    <option value="Declined" style={{ background: '#FECACA', color: '#B91C1C', fontWeight: 'bold' }}>Declined</option>
                                                    <option value="Rescheduled" style={{ background: '#DBEAFE', color: '#1D4ED8', fontWeight: 'bold' }}>Rescheduled</option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold shadow
                                                        ${b.status === 'approved'
                                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                                            : b.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                                                : b.status === 'declined'
                                                                    ? 'bg-red-100 text-red-700 border border-red-300'
                                                                    : b.status === 'rescheduled'
                                                                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                        }`}
                                                >
                                                    {b.status || 'Pending'}
                                                </span>
                                            )}
                                        </td>

                                        {showFacilityBreakdown && (<td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
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
                                        </td>)}


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