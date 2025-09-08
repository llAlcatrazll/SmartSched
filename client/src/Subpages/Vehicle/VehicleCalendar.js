import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const vehicleTypeColors = {
    'isuzu': '#b5d8f6',             // pastel blue
    'hi-ace': '#ffe0b2',            // pastel orange
    'kia': '#c8e6c9',               // pastel green
    'small-bus': '#f8bbd0',         // pastel pink
    'big-bus': '#d1c4e9',           // pastel purple
    'tamaraw': '#fff9c4',           // pastel yellow
    'hilux': '#b2dfdb',             // pastel teal
    'innova-manual': '#f0f4c3',     // pastel lime
    'innova-automatic': '#f3e5f5',  // pastel lavender
    'unregistered vehicle': '#e0e0e0' // pastel gray
};

export default function VehicleBookingCalendar() {
    const [filter, setFilter] = useState({
        search: '',
        vehicleType: 'All',
        department: 'All',
        dateFrom: '',
        dateTo: ''
    });
    const [bookings, setBookings] = useState([]);
    const [events, setEvents] = useState([]);

    const [vehicleTypes, setVehicleTypes] = useState(['All']);
    const [departments, setDepartments] = useState(['All']);

    const renderEventContent = (eventInfo) => {
        // Use the event's backgroundColor and textColor
        return (
            <div
                className='w-full'
                style={{
                    backgroundColor: eventInfo.event.backgroundColor || '#96161C',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    color: eventInfo.event.textColor || '#000',
                    fontSize: '0.75rem'
                }}
            >
                <b>{eventInfo.timeText && eventInfo.timeText}</b> {eventInfo.event.title}
            </div>
        );
    };

    useEffect(() => {
        fetch('http://localhost:5000/api/fetch-vehicles')
            .then(res => res.json())
            .then(data => {
                // If backend returns { success, bookings }, use bookings array
                const bookingsArr = Array.isArray(data) ? data : data.bookings || [];
                const formatted = bookingsArr.map(b => {
                    // Use the lowercase, hyphenated value for color lookup
                    const typeKey = (b.vehicleType || b.vehicle_Type || 'unregistered vehicle').toLowerCase();
                    const bgColor = vehicleTypeColors[typeKey] || '#e0e0e0';
                    return {
                        title: `${toTitleCase(b.vehicleType || b.vehicle_Type)} | ${toTitleCase(b.requestor)}`,
                        start: b.date,
                        end: b.date,
                        backgroundColor: bgColor,
                        borderColor: bgColor,
                        textColor: '#000000',
                        extendedProps: {
                            vehicleType: toTitleCase(b.vehicleType || b.vehicle_Type),
                            department: toTitleCase(b.department),
                            purpose: b.purpose,
                            requestor: toTitleCase(b.requestor)
                        }
                    };
                });
                setBookings(formatted);
                setEvents(formatted);
                // Extract unique vehicle types and departments, sort alphabetically
                const uniqueTypes = Array.from(new Set(bookingsArr.map(b => toTitleCase(b.vehicle_Type)).filter(Boolean))).sort((a, b) => a.localeCompare(b));
                setVehicleTypes(['All', ...uniqueTypes]);
                const uniqueDepts = Array.from(new Set(bookingsArr.map(b => toTitleCase(b.department)).filter(Boolean))).sort((a, b) => a.localeCompare(b));
                setDepartments(['All', ...uniqueDepts]);
            })
            .catch(err => console.error('Error fetching vehicle bookings:', err));
    }, []);

    function toTitleCase(str) {
        if (!str) return '';
        return str.replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_]/g, ' ')
            .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        let filtered = bookings;

        if (filter.search) {
            filtered = filtered.filter(ev =>
            (ev.extendedProps.requestor.toLowerCase().includes(filter.search.toLowerCase()) ||
                ev.extendedProps.purpose.toLowerCase().includes(filter.search.toLowerCase()))
            );
        }
        if (filter.vehicleType !== 'All') {
            filtered = filtered.filter(ev =>
                ev.extendedProps.vehicleType === filter.vehicleType
            );
        }
        if (filter.department !== 'All') {
            filtered = filtered.filter(ev =>
                ev.extendedProps.department === filter.department
            );
        }
        if (filter.dateFrom) {
            filtered = filtered.filter(ev => ev.start >= filter.dateFrom);
        }
        if (filter.dateTo) {
            filtered = filtered.filter(ev => ev.start <= filter.dateTo);
        }
        setEvents(filtered);
    }, [filter, bookings]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex-1 w-full">
                <div className="bg-white rounded-xl shadow-none p-4 w-full flex flex-wrap gap-4 items-end justify-between border border-[#888888]">
                    <div className="flex-1 min-w-[180px] max-w-xs">
                        <label className="block text-xs font-semibold mb-1 text-[#96161C]">Search (Requestor/Purpose)</label>
                        <input
                            type="text"
                            placeholder='Juan dela Cruz'
                            name="search"
                            value={filter.search}
                            onChange={handleFilterChange}
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                        />
                    </div>
                    <div className="flex-1 min-w-[120px] max-w-xs">
                        <label className="block text-xs font-semibold mb-1 text-[#96161C]">Vehicle Type</label>
                        <select
                            name="vehicleType"
                            value={filter.vehicleType}
                            onChange={handleFilterChange}
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                        >
                            {vehicleTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[140px] max-w-xs">
                        <label className="block text-xs font-semibold mb-1 text-[#96161C]">Department</label>
                        <select
                            name="department"
                            value={filter.department}
                            onChange={handleFilterChange}
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                        >
                            {departments.map(dep => (
                                <option key={dep} value={dep}>{dep}</option>
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
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                        />
                    </div>
                    <div className="flex-1 min-w-[120px] max-w-xs">
                        <label className="block text-xs font-semibold mb-1 text-[#96161C]">Date To</label>
                        <input
                            type="date"
                            name="dateTo"
                            value={filter.dateTo}
                            onChange={handleFilterChange}
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                        />
                    </div>
                    <button
                        className="bg-[#96161C] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#7a1217] transition"
                        onClick={() => setFilter({
                            search: '',
                            vehicleType: 'All',
                            department: 'All',
                            dateFrom: '',
                            dateTo: ''
                        })}
                        type="button"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="w-full">
                {/* <div className="bg-gray-100 border border-gray-300 p-4 rounded-md mb-4">
                    <h2 className="font-bold text-sm mb-2">Fetched Vehicle Bookings (Raw Preview)</h2>
                    <pre className="text-xs overflow-x-auto max-h-[200px]">{JSON.stringify(bookings, null, 2)}</pre>
                </div> */}

                <FullCalendar
                    eventColor="#96161C"
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        start: 'prev,next today',
                        center: 'title',
                        end: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    initialView="dayGridMonth"
                    editable={false}
                    selectable={false}
                    events={events}
                    eventContent={renderEventContent}
                />
            </div>
        </div>
    );
}
