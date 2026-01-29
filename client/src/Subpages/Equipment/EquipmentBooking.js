import React, { useState, useEffect } from 'react';

export default function EquipmentBooking() {
    const [showEquipmentForm, setShowEquipmentForm] = useState(false);
    const [equipmentForm, setEquipmentForm] = useState({
        equipments: [''], // store equipmentId strings
        facilityId: '',
        departmentId: '',
        purpose: '',
        date: '',
        timeStart: '',
        timeEnd: ''
    });
    const currentUserId = localStorage.getItem("currentUserId");
    const [userEquipmentIds, setUserEquipmentIds] = useState([]);
    const [availableEquipments, setAvailableEquipments] = useState([]);
    const [filteredEquipments, setFilteredEquipments] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [expandedRow, setExpandedRow] = useState(null);
    const isAdmin = true;
    // useEffect(() => {
    //     if (!currentUserId) return;

    //     const fetchUserEquipments = async () => {
    //         const res = await fetch(
    //             `http://localhost:5000/api/user-equipments-fetch/${currentUserId}`
    //         );
    //         const data = await res.json();
    //         setUserEquipmentIds((data.equipments || []).map(Number));
    //     };

    //     fetchUserEquipments();
    // }, [currentUserId]);
    useEffect(() => {
        const { date, timeStart, timeEnd, facilityId } = equipmentForm;

        if (!date || !timeStart || !timeEnd || !facilityId) {
            setFilteredEquipments([]);
            return;
        }

        const fetchAvailableEquipments = async () => {
            const params = new URLSearchParams({
                date,
                timeStart,
                timeEnd,
                facilityId
            });

            const res = await fetch(
                `http://localhost:5000/api/available-equipments?${params}`
            );

            const data = await res.json();
            if (data.success) {
                setFilteredEquipments(data.equipments);
            }
        };

        fetchAvailableEquipments();
    }, [
        equipmentForm.date,
        equipmentForm.timeStart,
        equipmentForm.timeEnd,
        equipmentForm.facilityId
    ]);

    useEffect(() => {
        if (!bookings.length || !currentUserId) return;

        console.group("EQUIPMENT BOOKINGS — PIVOT CHECK");
        console.log("User ID:", currentUserId);
        console.log("Equipments in Pivot:", userEquipmentIds);
        console.log("--------------------------------");

        bookings.forEach((booking, index) => {
            const bookingEquipmentId = Number(booking.equipment_type_id);
            const inPivot = userEquipmentIds.includes(bookingEquipmentId);

            console.group(`Booking #${index + 1}`);
            console.log("Booking Equipment ID:", bookingEquipmentId);

            if (!inPivot) {
                console.warn("Pivot Status: ❌ NOT IN PIVOT");
                console.log("Equipments in Pivot for this User:", userEquipmentIds);
            } else {
                console.log("Pivot Status: ✅ IN PIVOT");
            }

            console.groupEnd();
        });

        console.log("--------------------------------");
        console.groupEnd();
    }, [bookings, currentUserId, userEquipmentIds]);


    // ========================== FETCH DATA ==========================
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [equipRes, facRes, depRes, bookRes] = await Promise.all([
                    fetch('http://localhost:5000/api/fetch-equipments'),
                    fetch('http://localhost:5000/api/fetch-facilities'),
                    fetch('http://localhost:5000/api/fetch-affiliation'),
                    fetch('http://localhost:5000/api/fetch-equipment-bookings')
                ]);

                const equipmentsData = await equipRes.json();
                if (equipmentsData.success) setAvailableEquipments(equipmentsData.equipments);

                const facilitiesData = await facRes.json();
                if (facilitiesData.success) setFacilities(facilitiesData.facilities);

                const departmentsData = await depRes.json();
                if (departmentsData.success) setDepartments(departmentsData.affiliations);

                const bookingsData = await bookRes.json();
                if (bookingsData.success) setBookings(bookingsData.bookings);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // ========================== HANDLE FORM CHANGES ==========================
    const handleEquipmentChange = (value, index) => {
        const updated = [...equipmentForm.equipments];
        updated[index] = value;
        setEquipmentForm({ ...equipmentForm, equipments: updated });
    };

    const addEquipment = () => {
        setEquipmentForm(prev => ({ ...prev, equipments: [...prev.equipments, ''] }));
    };

    const removeEquipment = (index) => {
        const updated = equipmentForm.equipments.filter((_, i) => i !== index);
        setEquipmentForm({ ...equipmentForm, equipments: updated });
    };

    // ========================== FILTER AVAILABLE EQUIPMENTS ==========================
    useEffect(() => {
        const { date, timeStart, timeEnd } = equipmentForm;
        if (!date || !timeStart || !timeEnd) {
            setFilteredEquipments([]);
            return;
        }

        const toMinutes = t => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };
        const startMin = toMinutes(timeStart);
        const endMin = toMinutes(timeEnd);

        const availableNow = availableEquipments.filter(eq => {
            for (let b of bookings) {
                if (!b.equipments || !Array.isArray(b.equipments)) continue;
                if (!b.dates || !b.timeStart || !b.timeEnd) continue;

                const bookedDate = new Date(b.dates[0]).toISOString().split('T')[0];
                if (bookedDate !== date) continue;

                if (!b.equipments.some(beq => parseInt(beq.equipmentId) === eq.id)) continue;

                const bookedStart = toMinutes(b.timeStart);
                const bookedEnd = toMinutes(b.timeEnd);

                if (startMin < bookedEnd && endMin > bookedStart) return false; // conflict
            }
            return true;
        });

        setFilteredEquipments(availableNow);
    }, [equipmentForm.date, equipmentForm.timeStart, equipmentForm.timeEnd, availableEquipments, bookings]);

    const getFilteredEquipmentsForDropdown = (index) => {
        const selectedIds = equipmentForm.equipments.filter((_, i) => i !== index);
        return filteredEquipments.filter(eq => !selectedIds.includes(eq.id.toString()));
    };

    // ========================== SUBMIT HANDLER ==========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!equipmentForm.date || !equipmentForm.timeStart || !equipmentForm.timeEnd) {
            alert("Please select date and time first.");
            return;
        }

        // ✅ Build payload FIRST
        const payload = {
            equipments: equipmentForm.equipments.map(id => ({
                equipmentId: Number(id),
                quantity: 1
            })),
            departmentId: equipmentForm.departmentId,
            facilityId: equipmentForm.facilityId,
            purpose: equipmentForm.purpose,
            date: equipmentForm.date,
            timeStart: equipmentForm.timeStart, // must be HH:mm
            timeEnd: equipmentForm.timeEnd      // must be HH:mm
        };

        try {
            const res = await fetch('http://localhost:5000/api/create-equipment-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                alert('Booking created!');

                // 🔄 refresh bookings
                const bookRes = await fetch('http://localhost:5000/api/fetch-equipment-bookings');
                const bookingsData = await bookRes.json();
                if (bookingsData.success) {
                    setBookings(bookingsData.bookings);
                }

                // ♻️ reset form
                setEquipmentForm({
                    equipments: [''],
                    facilityId: '',
                    departmentId: '',
                    purpose: '',
                    date: '',
                    timeStart: '',
                    timeEnd: ''
                });
            } else {
                alert(data.message || 'Failed to create booking');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating booking');
        }
    };


    // ========================== HELPERS ==========================
    const getEquipmentName = (id) => availableEquipments.find(eq => eq.id === id)?.name || 'Unknown';
    const getDepartmentName = (id) => departments.find(d => d.id === id)?.abbreviation || 'Unknown';
    const getFacilityName = (id) => facilities.find(f => f.id === id)?.name || 'Unknown';

    const formatBookingDates = (dates) => {
        if (!dates || dates.length === 0) return 'No date';
        const dateObjs = dates.map(d => new Date(d)).sort((a, b) => a - b);
        const options = { month: 'short', day: '2-digit' };
        const year = dateObjs[0].getFullYear();

        if (dateObjs.length === 1) {
            return `${dateObjs[0].toLocaleDateString('en-US', options)}, ${year}`;
        }

        // consecutive check
        let isConsecutive = true;
        for (let i = 1; i < dateObjs.length; i++) {
            if ((dateObjs[i] - dateObjs[i - 1]) / (1000 * 60 * 60 * 24) !== 1) {
                isConsecutive = false;
                break;
            }
        }

        if (isConsecutive) {
            return `${dateObjs[0].toLocaleDateString('en-US', options)}-${dateObjs[dateObjs.length - 1].toLocaleDateString('en-US', options)}, ${year}`;
        } else {
            const formatted = dateObjs.map(d => d.toLocaleDateString('en-US', options));
            const last = formatted.pop();
            return `${formatted.join(' & ')} & ${last}, ${year}`;
        }
    };

    const handleEdit = (index) => alert(`Edit booking at index ${index}`);

    // ========================== ✅ DELETE BOOKING ==========================
    const handleDelete = async (bookingId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:5000/api/delete-equipment-booking/${bookingId}`, {
                method: "DELETE"
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                alert(data.message || "Failed to delete booking");
                return;
            }

            alert("Booking deleted!");

            // remove from UI immediately
            setBookings(prev => prev.filter(b => b.id !== bookingId));
        } catch (err) {
            console.error(err);
            alert("Error deleting booking");
        }
    };

    // ========================== RENDER ==========================
    return (
        <div>
            <div className="mb-6">
                <button
                    className="w-full flex items-center justify-between px-8 py-5 bg-[#96161C] text-white text-xl font-bold rounded-t-xl focus:outline-none"
                    onClick={() => setShowEquipmentForm(!showEquipmentForm)}
                >
                    <span>Equipment Booking</span>
                    <svg
                        className={`w-7 h-7 transform transition-transform ${showEquipmentForm ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showEquipmentForm && (
                    <form onSubmit={handleSubmit} className="bg-[#f9f9f9] px-8 py-8 rounded-b-xl shadow-md border border-t-0 border-gray-200">
                        {/* EQUIPMENT SELECTION */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-bold text-[#96161C]">Equipments</h2>
                                <button type="button" onClick={addEquipment} className="bg-[#96161C] text-white px-5 py-2 rounded-lg hover:bg-[#7a1217] transition">
                                    + Add Equipment
                                </button>
                            </div>
                            <div className="space-y-3">
                                {equipmentForm.equipments.map((eq, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex gap-2 items-center">
                                            <select
                                                value={eq}
                                                onChange={e => handleEquipmentChange(e.target.value, index)}
                                                className="w-full border rounded-lg px-4 py-2"
                                                required
                                                disabled={!equipmentForm.date || !equipmentForm.timeStart || !equipmentForm.timeEnd}
                                            >
                                                <option value="">
                                                    {!equipmentForm.date || !equipmentForm.timeStart || !equipmentForm.timeEnd
                                                        ? "Select date & time first"
                                                        : "Select Equipment"}
                                                </option>
                                                {getFilteredEquipmentsForDropdown(index).map(e => (
                                                    <option key={e.id} value={e.id}>
                                                        {e.name} ({e.model_id})
                                                    </option>
                                                ))}
                                            </select>
                                            {equipmentForm.equipments.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeEquipment(index)}
                                                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DEPARTMENT / FACILITY / TIME / DATE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Department*</label>
                                <select
                                    value={equipmentForm.departmentId}
                                    onChange={e => setEquipmentForm({ ...equipmentForm, departmentId: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.abbreviation} - {d.meaning}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Facility*</label>
                                <select
                                    value={equipmentForm.facilityId}
                                    onChange={e => setEquipmentForm({ ...equipmentForm, facilityId: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {facilities.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Time Start*</label>
                                <input
                                    type="time"
                                    value={equipmentForm.timeStart}
                                    onChange={e => setEquipmentForm({ ...equipmentForm, timeStart: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Time End*</label>
                                <input
                                    type="time"
                                    value={equipmentForm.timeEnd}
                                    onChange={e => setEquipmentForm({ ...equipmentForm, timeEnd: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date*</label>
                                <input
                                    type="date"
                                    value={equipmentForm.date}
                                    onChange={e => setEquipmentForm({ ...equipmentForm, date: e.target.value })}
                                    className="border rounded px-3 py-2 w-full"
                                    required
                                />
                            </div>
                        </div>

                        {/* PURPOSE */}
                        <div className="mb-6 w-full">
                            <label className="block text-sm font-medium mb-1">Purpose*</label>
                            <textarea
                                value={equipmentForm.purpose}
                                placeholder="Equipment needed for seminar / event..."
                                onChange={e => setEquipmentForm({ ...equipmentForm, purpose: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                                required
                            />
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-3 justify-end">
                            <button type="submit" className="bg-[#96161C] text-white px-8 py-2 rounded-lg">
                                Create
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowEquipmentForm(false)}
                                className="bg-gray-200 px-8 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* BOOKINGS TABLE */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#96161C]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase rounded-tl-xl">Equipment</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Facility</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Date(s)</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">Purpose</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {bookings.map((b, index) => {
                            const bookingEquipmentId = Number(b.equipment_type_id);
                            const hasPivotAccess = userEquipmentIds.includes(bookingEquipmentId);

                            return (
                                <tr key={b.id} className="hover:bg-gray-50 transition cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {(() => {
                                            const equipment = availableEquipments.find(eq => eq.id === b.equipment_type_id);
                                            return equipment ? `${equipment.name} (${equipment.model_id})` : 'Unknown';
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">{getDepartmentName(b.affiliation_id)}</td>
                                    <td className="px-6 py-4">{getFacilityName(b.facility_id)}</td>
                                    <td className="px-6 py-4">{formatBookingDates(b.dates)}</td>
                                    <td className="px-6 py-4">
                                        {b.time_start && b.time_end
                                            ? `${b.time_start.slice(0, 5)} - ${b.time_end.slice(0, 5)}`
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4">{b.purpose}</td>
                                    <td className="px-6 py-4">
                                        {!hasPivotAccess ? (
                                            <span className="text-gray-400 italic">No Access</span>
                                        ) : (
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold
            ${b.status === 'Approved'
                                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                                        : b.status === 'Rejected'
                                                            ? 'bg-red-100 text-red-700 border border-red-300'
                                                            : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                                    }`}
                                            >
                                                {b.status}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 flex gap-2">
                                        {!hasPivotAccess ? (
                                            <span className="text-gray-400 italic">No Access</span>
                                        ) : isAdmin ? (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(index); }}
                                                    className="px-4 py-1 text-sm font-semibold rounded-full border border-[#96161C] text-[#96161C]"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                                                    className="px-4 py-1 text-sm font-semibold rounded-full border border-red-600 text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No Actions</span>
                                        )}
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
