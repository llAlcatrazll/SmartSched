import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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

    const vehicleTypes = ['All', 'isuzu', 'hi-ace', 'kia', 'small-bus', 'big-bus', 'tamaraw', 'hilux', 'innova-manual', 'innova-automatic',];
    const departments = ['All', 'AGSO', 'IT', 'Finance']; // You can update this list from DB if needed

    const renderEventContent = (eventInfo) => {
        return (
            <div
                className='w-full'
                style={{
                    backgroundColor: '#96161C',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    color: '#fff',
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
                const formatted = data.map(b => ({
                    title: `${b.vehicleType} | ${b.requestor}`,
                    start: b.date,
                    end: b.date,
                    backgroundColor: '#ff9f89',
                    borderColor: '#ff9f89',
                    textColor: '#000000',
                    extendedProps: {
                        vehicleType: b.vehicleType,
                        department: b.department,
                        purpose: b.purpose,
                        requestor: b.requestor
                    }
                }));
                setBookings(formatted);
                setEvents(formatted);
            })
            .catch(err => console.error('Error fetching vehicle bookings:', err));
    }, []);

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
                <div className="bg-gray-100 border border-gray-300 p-4 rounded-md mb-4">
                    <h2 className="font-bold text-sm mb-2">Fetched Vehicle Bookings (Raw Preview)</h2>
                    <pre className="text-xs overflow-x-auto max-h-[200px]">{JSON.stringify(bookings, null, 2)}</pre>
                </div>

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
