import React, { useEffect, useState } from 'react';
import { UserPlus, Trash, Edit, ShieldCheck, Users } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        name: '',
        affiliation: '',
        role: 'user',
        email: '',
        password: ''
    });
    const [editingId, setEditingId] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/fetchAll-user');
            const data = await res.json();
            setUsers(data.users.filter(u => !u.deleted));
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };


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
            affiliation: user.affiliation,
            role: user.role,
            email: user.email,
            password: '' // password won't be shown
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

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[#96161C]">
                <Users className="w-6 h-6" /> User Management
            </h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="border px-3 py-2 rounded-lg" required />
                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border px-3 py-2 rounded-lg" required />
                    <input name="affiliation" placeholder="Affiliation" value={form.affiliation} onChange={handleChange} className="border px-3 py-2 rounded-lg" />
                    <select name="role" value={form.role} onChange={handleChange} className="border px-3 py-2 rounded-lg">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border px-3 py-2 rounded-lg" required={!editingId} />
                </div>

                <div className="flex justify-end gap-3">
                    <button type="submit" className="bg-[#96161C] text-white px-6 py-2 rounded-lg hover:bg-[#7a1217] transition">
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

            {/* User Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-[#96161C]">All Users</h2>
                <table className="min-w-full table-auto">
                    <thead className="bg-[#96161C] text-white text-left">
                        <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Affiliation</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b">
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">{user.affiliation}</td>
                                <td className="px-4 py-2">{user.role}</td>
                                <td className="px-4 py-2 flex justify-end gap-3">
                                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline flex items-center gap-1">
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:underline flex items-center gap-1">
                                        <Trash size={16} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
