// LandingPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Menu, X, Home, Calendar, ClipboardList, LogOut, User
} from 'lucide-react';

import Dashboard from '../Subpages/Dashboard';
import Profile from '../Subpages/Profile';
import CalendarPage from '../Subpages/Facility/FacilityCalendar';
import Booking from '../Subpages/Facility/FacilityBooking';
import VehicleBooking from '../Subpages/Vehicle/VehicleBooking';
import VehicleCalendar from '../Subpages/Vehicle/VehicleCalendar';
import UserManagement from '../Subpages/UserManagement';
import ManageEquipment from '../Subpages/ManageEquipment';

const user = {
    name: 'Andre Narval',
    role: 'ADMINISTRATOR',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
};

async function sendCohereChatMessage(message, bookings = [], currentDateTime) {
    try {
        const response = await axios.post('http://localhost:5000/api/chatbot', {
            message,
            bookings,
            currentDateTime, // include timestamp in request body
        });
        return response.data.reply;
    } catch (error) {
        console.error('Cohere Chat Error:', error);
        return 'Sorry, something went wrong while chatting with AI.';
    }
}


export default function LandingPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFacilityOpen, setIsFacilityOpen] = useState(true);
    const [isVehicleOpen, setIsVehicleOpen] = useState(true);
    const [showFacilityBreakdown, setShowFacilityBreakdown] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [showChatbot, setShowChatbot] = useState(false);
    const toggleChatBot = () => setShowChatbot(!showChatbot);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { from: 'bot', text: 'Hi! How can I help you today?' }
    ]);
    const [bookings, setBookings] = useState([]);

    const formattedBookings = bookings.map((b) => ({
        name: b.event_name,
        facility: b.event_facility,
        date: b.event_date.split('T')[0], // "2025-08-04"
        startTime: b.starting_time,
        endTime: b.ending_time,
        requestedBy: b.requested_by,
    }));

    const handleSendChat = async () => {
        if (!chatInput.trim()) return;

        const newMessages = [...chatMessages, { from: 'user', text: chatInput }];
        setChatMessages(newMessages);
        setChatInput('');
        setIsBotTyping(true);

        const currentDateTime = new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        }); // e.g., "Thursday, August 7, 2025 at 10:15 PM"


        try {
            const response = await sendCohereChatMessage(chatInput, formattedBookings, currentDateTime);
            setChatMessages([...newMessages, { from: 'ai', text: response }]);
        } catch (err) {
            setChatMessages([...newMessages, { from: 'ai', text: 'Something went wrong. Try again.' }]);
        } finally {
            setIsBotTyping(false);
        }
    };


    useEffect(() => {
        fetch('http://localhost:5000/api/fetch-bookings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log('Bookings fetched:', data.bookings);
                    setBookings(data.bookings);
                }
            });
    }, []);

    useEffect(() => {
        const storedRole = localStorage.getItem('currentUserRole');
        if (storedRole === 'admin') {
            setShowFacilityBreakdown(true);
        }
    }, []);

    const [activePage, setActivePage] = useState(() => {
        return localStorage.getItem('activePage') || 'dashboard';
    });

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const handleLogout = () => window.location.href = '/';
    const handleSetActivePage = (page) => {
        setActivePage(page);
        localStorage.setItem('activePage', page);
    };

    let RenderedPage;
    switch (activePage) {
        case 'dashboard': RenderedPage = <Dashboard />; break;
        case 'profile': RenderedPage = <Profile />; break;
        case 'user-management': RenderedPage = <UserManagement />; break;
        case 'calendar': RenderedPage = <CalendarPage />; break;
        case 'booking': RenderedPage = <Booking />; break;
        case 'vehicle-calendar': RenderedPage = <VehicleCalendar />; break;
        case 'vehicle-booking': RenderedPage = <VehicleBooking />; break;
        case 'manage-equipment': RenderedPage = <ManageEquipment />; break;
        default: RenderedPage = <Dashboard />;
    }
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`
                    ${isSidebarOpen ? 'w-64' : 'w-16'}
                    transition-all duration-300 min-h-screen flex flex-col py-6 pl-4 bg-[#96161C]
                    overflow-y-auto fixed top-0 left-0 h-screen z-20
                `}
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-between w-full mb-4 pr-4">
                        <span className={`text-[#ffa7a7] font-bold tracking-widest text-lg ${!isSidebarOpen && 'hidden'}`}>ADMIN</span>
                        <button onClick={toggleSidebar} className="text-white">{isSidebarOpen ? <X /> : <Menu />}</button>
                    </div>
                    <img
                        src={user.avatar}
                        alt="Profile"
                        className={`rounded-full border-4 border-[#96161C] shadow-lg mb-2 ${isSidebarOpen ? 'w-20 h-20' : 'w-10 h-10'}`}
                    />
                    {isSidebarOpen && (
                        <>
                            <div className="text-lg font-bold text-white">{user.name}</div>
                            <div className="text-sm font-bold text-[#ffa7a7] tracking-widest">{user.role}</div>
                        </>
                    )}
                </div>

                <nav className="flex flex-col gap-4 text-white">
                    {showFacilityBreakdown && (<SidebarItem icon={<Home size={20} />} label="Dashboard" open={isSidebarOpen} onClick={() => handleSetActivePage('dashboard')} />)}
                    <SidebarItem icon={<User size={20} />} label="Profile" open={isSidebarOpen} onClick={() => handleSetActivePage('profile')} />
                    <SidebarItem icon={<User size={20} />} label="User Management" open={isSidebarOpen} onClick={() => handleSetActivePage('user-management')} />

                    {isSidebarOpen && (
                        <>
                            <button onClick={() => setIsFacilityOpen(!isFacilityOpen)} className="px-2 pt-4 text-xs font-bold text-[#ffa7a7] uppercase tracking-wider text-left w-full">
                                Facility Bookings {isFacilityOpen ? '▾' : '▸'}
                            </button>
                            {isFacilityOpen && (
                                <>
                                    <SidebarItem icon={<Calendar size={20} />} label="Facility Calendar" open={isSidebarOpen} onClick={() => handleSetActivePage('calendar')} />
                                    <SidebarItem icon={<ClipboardList size={20} />} label="Facility Bookings" open={isSidebarOpen} onClick={() => handleSetActivePage('booking')} />
                                    <SidebarItem icon={<Calendar size={20} />} label="Manage Equipment" open={isSidebarOpen} onClick={() => handleSetActivePage('manage-equipment')} />
                                </>
                            )}
                        </>
                    )}

                    {isSidebarOpen && (
                        <>
                            <button onClick={() => setIsVehicleOpen(!isVehicleOpen)} className="px-2 pt-4 text-xs font-bold text-[#ffa7a7] uppercase tracking-wider text-left w-full">
                                Vehicle Bookings {isVehicleOpen ? '▾' : '▸'}
                            </button>
                            {isVehicleOpen && (
                                <>
                                    <SidebarItem icon={<Calendar size={20} />} label="Vehicle Calendar" open={isSidebarOpen} onClick={() => handleSetActivePage('vehicle-calendar')} />
                                    <SidebarItem icon={<ClipboardList size={20} />} label="Vehicle Bookings" open={isSidebarOpen} onClick={() => handleSetActivePage('vehicle-booking')} />
                                </>
                            )}
                        </>
                    )}

                    <SidebarItem icon={<LogOut size={20} />} label="Logout" open={isSidebarOpen} onClick={handleLogout} />
                </nav>
            </div>

            <div className={`flex-1 p-6 ml-${isSidebarOpen ? '64' : '16'} transition-all duration-300`} style={{ marginLeft: isSidebarOpen ? '16rem' : '4rem' }}>
                {RenderedPage}
            </div>

            {/* Floating Chatbot Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={toggleChatBot}
                    className="bg-[#96161C] hover:bg-red-800 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2"
                >
                    🤖 <span className="hidden sm:inline">AI Assistant</span>
                </button>
            </div>

            {/* Chatbot Interface */}
            {showChatbot && (
                <div className="fixed bottom-20 right-6 w-[520px] h-[550px] bg-white border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-[#96161C] text-white">
                        <h2 className="font-semibold text-lg">Booking Assistant</h2>
                        <button
                            onClick={() => setShowChatbot(false)}
                            className="text-white hover:text-gray-300"
                        >
                            ✖
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {chatMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-lg text-sm max-w-[70%] break-words
                            ${msg.from === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isBotTyping && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2 text-sm bg-gray-200 text-gray-600 rounded-lg animate-pulse">
                                    Typing<span className="animate-bounce">...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="flex items-center p-3 border-t gap-2 bg-white">
                        <input
                            type="text"
                            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#96161C]"
                            placeholder="Type your message..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendChat();
                            }}
                        />
                        <button
                            onClick={handleSendChat}
                            className="bg-[#96161C] hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

// Reusable Sidebar Item
const SidebarItem = ({ icon, label, open, onClick }) => (
    <div
        className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition hover:bg-white/20 hover:text-white active:bg-white/30"
        onClick={onClick}
        style={{ color: 'inherit' }}
    >
        {icon}
        {open && <span className="text-sm">{label}</span>}
    </div>
);
