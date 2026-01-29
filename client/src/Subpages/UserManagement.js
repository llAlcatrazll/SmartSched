import React, { useEffect, useMemo, useState } from 'react';
import { Trash, Edit, Users } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [affiliations, setAffiliations] = useState([]);

    // Facilities
    const [facilities, setFacilities] = useState([]);
    const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // selected facilities for current user
    const [selectedFacilities, setSelectedFacilities] = useState([]);
    const [originalSelectedFacilities, setOriginalSelectedFacilities] = useState([]);

    // modal UI
    const [facilitySearch, setFacilitySearch] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [savingFacilities, setSavingFacilities] = useState(false);

    const [form, setForm] = useState({
        name: '',
        affiliation: '',
        role: 'user',
        email: '',
        password: ''
    });

    const [editingId, setEditingId] = useState(null);

    // Fetch users
    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/fetchAll-user');
            const data = await res.json();
            setUsers(data.users.filter(u => !u.deleted));
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    // Fetch affiliations
    useEffect(() => {
        const fetchAffiliations = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/fetch-affiliation');
                const data = await res.json();
                if (data.success) setAffiliations(data.affiliations);
            } catch (err) {
                console.error('Error fetching affiliations:', err);
            }
        };

        fetchAffiliations();
    }, []);

    // Fetch facilities (all)
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/fetch-facilities');
                const data = await res.json();

                // handle different response shapes
                if (data.success && Array.isArray(data.facilities)) setFacilities(data.facilities);
                else if (Array.isArray(data.facilities)) setFacilities(data.facilities);
                else if (Array.isArray(data)) setFacilities(data);
            } catch (err) {
                console.error('Error fetching facilities:', err);
            }
        };

        fetchFacilities();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId
            ? `http://localhost:5000/api/update-user/${editingId}`
            : `http://localhost:5000/api/create-user`;

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        const data = await res.json();
        if (data.success) {
            setForm({ name: '', affiliation: '', role: 'user', email: '', password: '' });
            setEditingId(null);
            fetchUsers();
        } else {
            alert('Error saving user');
        }
    };

    const handleEdit = (user) => {
        setForm({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            affiliation: user.affiliation ? Number(user.affiliation) : '',
        });
        setEditingId(user.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;

        const res = await fetch(`http://localhost:5000/api/delete-user/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        if (data.success) {
            fetchUsers();
        } else {
            alert('Delete failed');
        }
    };

    // =========================
    // FACILITIES MODAL LOGIC
    // =========================

    const openFacilitiesModal = async (user) => {
        setSelectedUser(user);
        setFacilitySearch('');
        setHasChanges(false);
        setSelectedFacilities([]);
        setOriginalSelectedFacilities([]);
        setShowFacilitiesModal(true);

        try {
            // YOUR FETCH ROUTE
            const res = await fetch(`http://localhost:5000/api/user-facilities-fetch/${user.id}`);
            const data = await res.json();

            if (data.success) {
                // backend returns array of facility ids (string)
                const checked = (data.facilities || []).map(id => Number(id));
                setSelectedFacilities(checked);
                setOriginalSelectedFacilities(checked);
            }
        } catch (err) {
            console.error('Error fetching user facilities:', err);
        }
    };

    const closeFacilitiesModal = () => {
        setShowFacilitiesModal(false);
        setSelectedUser(null);
        setSelectedFacilities([]);
        setOriginalSelectedFacilities([]);
        setHasChanges(false);
        setFacilitySearch('');
    };

    const toggleFacility = (facilityId) => {
        setSelectedFacilities((prev) => {
            const updated = prev.includes(facilityId)
                ? prev.filter(id => id !== facilityId)
                : [...prev, facilityId];

            // compare updated vs original
            const a = [...updated].sort((x, y) => x - y).join(',');
            const b = [...originalSelectedFacilities].sort((x, y) => x - y).join(',');
            setHasChanges(a !== b);

            return updated;
        });
    };

    const handleCancelFacilities = () => {
        setSelectedFacilities(originalSelectedFacilities);
        setHasChanges(false);
    };

    const saveFacilities = async () => {
        if (!selectedUser) return;

        setSavingFacilities(true);

        try {
            // YOUR SAVE ROUTE
            const res = await fetch('http://localhost:5000/api/user-facilities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: selectedUser.id,
                    facilities: selectedFacilities
                })
            });

            const data = await res.json();

            if (data.success) {
                setOriginalSelectedFacilities(selectedFacilities);
                setHasChanges(false);
                closeFacilitiesModal();
            } else {
                alert(data.message || 'Failed to save facilities');
            }
        } catch (err) {
            console.error('Save facilities error:', err);
            alert('Failed to save facilities');
        } finally {
            setSavingFacilities(false);
        }
    };

    const filteredFacilities = useMemo(() => {
        const q = facilitySearch.trim().toLowerCase();
        if (!q) return facilities;

        return facilities.filter(f =>
            String(f.name || '').toLowerCase().includes(q) ||
            String(f.id || '').toLowerCase().includes(q)
        );
    }, [facilitySearch, facilities]);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[#96161C]">
                <Users className="w-6 h-6" /> User Management
            </h1>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        className="border px-3 py-2 rounded-lg"
                        required
                    />

                    <input
                        name="email"
                        placeholder="Username"
                        value={form.email}
                        onChange={handleChange}
                        className="border px-3 py-2 rounded-lg"
                        required
                    />

                    <select
                        name="affiliation"
                        value={form.affiliation}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    >
                        <option value="">Select...</option>
                        {affiliations.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.abbreviation} - {a.meaning}
                            </option>
                        ))}
                    </select>

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="border px-3 py-2 rounded-lg"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                    </select>

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="border px-3 py-2 rounded-lg"
                        required={!editingId}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="submit"
                        className="bg-[#96161C] text-white px-6 py-2 rounded-lg hover:bg-[#7a1217] transition"
                    >
                        {editingId ? 'Update User' : 'Create User'}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setForm({ name: '', affiliation: '', role: 'user', email: '', password: '' });
                            }}
                            className="bg-gray-200 px-6 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* USER TABLE */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-[#96161C]">All Users</h2>

                <table className="min-w-full table-auto">
                    <thead className="bg-[#96161C] text-white text-left">
                        <tr>
                            <th className="px-4 py-2 rounded-tl-xl">Name</th>
                            <th className="px-4 py-2">Username</th>
                            <th className="px-4 py-2">Affiliation</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2 text-right rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b">
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">
                                    {affiliations.find(a => a.id === Number(user.affiliation))
                                        ? `${affiliations.find(a => a.id === Number(user.affiliation)).abbreviation} - ${affiliations.find(a => a.id === Number(user.affiliation)).meaning}`
                                        : '—'}
                                </td>
                                <td className="px-4 py-2">{user.role}</td>

                                <td className="px-4 py-2 flex justify-end gap-3">
                                    <button
                                        onClick={() => openFacilitiesModal(user)}
                                        className="text-green-700 hover:underline font-medium"
                                    >
                                        Facilities
                                    </button>

                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <Edit size={16} /> Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:underline flex items-center gap-1"
                                    >
                                        <Trash size={16} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FACILITIES MODAL */}
            {showFacilitiesModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-[#96161C]">
                                    Manage Facilities
                                </h3>
                                <p className="text-sm text-gray-600">
                                    User: <span className="font-semibold">{selectedUser?.name}</span>
                                </p>
                            </div>

                            <button
                                onClick={closeFacilitiesModal}
                                className="text-gray-500 hover:text-black text-2xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search + count */}
                        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
                            <input
                                type="text"
                                value={facilitySearch}
                                onChange={(e) => setFacilitySearch(e.target.value)}
                                placeholder="Search facility name..."
                                className="w-full md:w-2/3 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#96161C]/40"
                            />

                            <div className="text-sm text-gray-600">
                                Selected: <span className="font-bold">{selectedFacilities.length}</span>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[340px] overflow-y-auto border rounded-xl p-3 space-y-2">
                            {filteredFacilities.length === 0 ? (
                                <p className="text-gray-500 text-sm">No facilities found.</p>
                            ) : (
                                filteredFacilities.map((f) => (
                                    <label
                                        key={f.id}
                                        className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedFacilities.includes(Number(f.id))}
                                                onChange={() => toggleFacility(Number(f.id))}
                                                className="w-4 h-4"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">{f.name}</div>
                                                <div className="text-xs text-gray-500">ID: {f.id}</div>
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        {/* Footer buttons */}
                        <div className="flex items-center justify-between mt-5">
                            <div className="text-xs text-gray-500">
                                {hasChanges ? 'Unsaved changes' : 'No changes'}
                            </div>

                            <div className="flex gap-2">
                                {hasChanges && (
                                    <>
                                        <button
                                            onClick={handleCancelFacilities}
                                            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                                            disabled={savingFacilities}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            onClick={saveFacilities}
                                            className="px-5 py-2 rounded-xl bg-[#96161C] text-white hover:bg-[#7a1217] transition disabled:opacity-60"
                                            disabled={savingFacilities}
                                        >
                                            {savingFacilities ? 'Saving...' : 'Save'}
                                        </button>
                                    </>
                                )}

                                {!hasChanges && (
                                    <button
                                        onClick={closeFacilitiesModal}
                                        className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
