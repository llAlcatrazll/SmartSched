import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../styles/calendar-theme.css';

export default function MyCalendar() {
    const [filter, setFilter] = useState({
        search: '',
        status: 'All',
        facility: 'All',
        org: 'All',
        dateFrom: '',
        dateTo: ''
    });
    const [bookings, setBookings] = useState([]);
    const [events, setEvents] = useState([]);

    const statuses = ['All', 'Approved', 'Pending', 'Rejected'];
    const facilities = ['Gym', 'Auditorium', 'Room A'];
    const orgs = ['Org 1', 'Org 2', 'Org 3'];

    useEffect(() => {
        fetch('/api/fetch-bookings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log('Fetched bookings:', data.bookings); // ✅ See what's coming back

                    const formatted = data.bookings.map(b => ({
                        title: b.title,
                        start: b.event_date, // Assuming this is already ISO8601 like '2025-07-17T16:00:00.000Z'
                        end: b.ending_time ? `${b.event_date.split('T')[0]}T${b.ending_time}` : undefined,
                        extendedProps: {
                            status: b.status,
                            facility: b.facility,
                            org: b.org
                        }
                    }));

                    console.log('Formatted events for FullCalendar:', formatted); // ✅ Confirm conversion worked

                    setBookings(formatted);
                    setEvents(formatted);
                }
            });
    }, []);


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        let filtered = bookings;
        if (filter.search) {
            filtered = filtered.filter(ev =>
                ev.title.toLowerCase().includes(filter.search.toLowerCase())
            );
        }
        if (filter.status !== 'All') {
            filtered = filtered.filter(ev =>
                ev.extendedProps.status === filter.status
            );
        }
        if (filter.facility !== 'All') {
            filtered = filtered.filter(ev =>
                ev.extendedProps.facility === filter.facility
            );
        }
        if (filter.org !== 'All') {
            filtered = filtered.filter(ev =>
                ev.extendedProps.org === filter.org
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
                        <label className="block text-xs font-semibold mb-1 text-[#96161C]">Search</label>
                        <input
                            type="text"
                            name="search"
                            value={filter.search}
                            onChange={handleFilterChange}
                            placeholder="Search event, facility, org, etc."
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                        />
                    </div>
                    <div className="flex-1 min-w-[120px] max-w-xs">
                        <label className="block text-xs font-semibold mb-1 text-[#96161C]">Status</label>
                        <select
                            name="status"
                            value={filter.status}
                            onChange={handleFilterChange}
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
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
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
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
                            className="border border-[#888888] rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#96161C]"
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

            <div className="w-full">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        start: 'prev,next today',
                        center: 'title',
                        end: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    initialView="dayGridMonth"
                    editable={true}
                    selectable={true}
                    events={events}
                />
            </div>
        </div>
    );
}
