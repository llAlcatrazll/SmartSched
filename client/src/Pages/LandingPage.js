import React, { useState } from 'react';
import {
    Menu,
    X,
    Home,
    Calendar,
    ClipboardList,
    Settings,
    LogOut,
    User,
} from 'lucide-react';
import Dashboard from '../Subpages/Dashboard';
import Profile from '../Subpages/Profile';
import CalendarPage from '../Subpages/Calendar';
import Booking from '../Subpages/Booking';

// Add your user info here
const user = {
    name: 'Harun Jeylan',
    role: 'ADMINISTRATOR',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg', // Replace with your avatar URL
};

export default function LandingPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        window.location.href = '/';
    };

    // Render the correct page based on activePage
    let RenderedPage;
    switch (activePage) {
        case 'dashboard':
            RenderedPage = <Dashboard />;
            break;
        case 'profile':
            RenderedPage = <Profile />;
            break;
        case 'calendar':
            RenderedPage = <CalendarPage />;
            break;
        case 'booking':
            RenderedPage = <Booking />;
            break;
        case 'settings':
            RenderedPage = (
                <div>
                    <h1 className="text-2xl font-bold mb-4">Settings</h1>
                    <p>This is the Settings page.</p>
                </div>
            );
            break;
        default:
            RenderedPage = <Dashboard />;
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
                style={{ maxHeight: '100vh' }}
            >
                {/* Profile Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-between w-full mb-4 pr-4">
                        <span className={`text-[#ffa7a7] font-bold tracking-widest text-lg ${!isSidebarOpen && 'hidden'}`}>ADMIN</span>
                        <button
                            onClick={toggleSidebar}
                            className="text-white focus:outline-none"
                        >
                            {isSidebarOpen ? <X /> : <Menu />}
                        </button>
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
                    <SidebarItem icon={<Home size={20} />} label="Dashboard" open={isSidebarOpen} onClick={() => setActivePage('dashboard')} />
                    <SidebarItem icon={<Calendar size={20} />} label="Calendar" open={isSidebarOpen} onClick={() => setActivePage('calendar')} />
                    <SidebarItem icon={<ClipboardList size={20} />} label="Bookings" open={isSidebarOpen} onClick={() => setActivePage('booking')} />
                    <SidebarItem icon={<User size={20} />} label="Profile" open={isSidebarOpen} onClick={() => setActivePage('profile')} />
                    <SidebarItem icon={<Settings size={20} />} label="Settings" open={isSidebarOpen} onClick={() => setActivePage('settings')} />
                    <SidebarItem icon={<LogOut size={20} />} label="Logout" open={isSidebarOpen} onClick={handleLogout} />
                </nav>
            </div>

            {/* Main Content to render stuff*/}
            <div
                className={`flex-1 p-6 ml-${isSidebarOpen ? '64' : '16'} transition-all duration-300`}
                style={{ marginLeft: isSidebarOpen ? '16rem' : '4rem' }}
            >
                {RenderedPage}
            </div>
        </div>
    );
}

// Reusable Sidebar Item
const SidebarItem = ({ icon, label, open, onClick }) => (
    <div
        className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition
                   hover:bg-white/20 hover:text-white active:bg-white/30"
        onClick={onClick}
        style={{ color: 'inherit' }}
    >
        {icon}
        {open && <span className="text-sm">{label}</span>}
    </div>
);
