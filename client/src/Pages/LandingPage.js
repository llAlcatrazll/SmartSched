import React, { useState, useEffect } from 'react';
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
import CalendarPage from '../Subpages/Facility/FacilityCalendar';
import Booking from '../Subpages/Facility/FacilityBooking';
import VehicleBooking from '../Subpages/Vehicle/VehicleBooking';
import VehicleCalendar from '../Subpages/Vehicle/VehicleCalendar';
import UserManagement from '../Subpages/UserManagement';
import ManageEquipment from '../Subpages/ManageEquipment';

const user = {
    name: 'Andre Narval',
    role: 'ADMINISTRATOR',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
};

export default function LandingPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFacilityOpen, setIsFacilityOpen] = useState(true);
    const [isVehicleOpen, setIsVehicleOpen] = useState(true);
    const [showFacilityBreakdown, setShowFacilityBreakdown] = useState(false);
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

    const handleLogout = () => {
        window.location.href = '/';
    };

    const handleSetActivePage = (page) => {
        setActivePage(page);
        localStorage.setItem('activePage', page);
    };

    let RenderedPage;
    switch (activePage) {
        case 'dashboard':
            RenderedPage = <Dashboard />;
            break;
        case 'profile':
            RenderedPage = <Profile />;
            break;
        case 'user-management':
            RenderedPage = <UserManagement />;
            break;
        case 'calendar':
            RenderedPage = <CalendarPage />;
            break;
        case 'booking':
            RenderedPage = <Booking />;
            break;
        case 'vehicle-calendar':
            RenderedPage = <VehicleCalendar />;
            break;
        case 'vehicle-booking':
            RenderedPage = <VehicleBooking />;
            break;
        case 'manage-equipment':
            RenderedPage = <ManageEquipment />;
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
                    {showFacilityBreakdown && (<SidebarItem icon={<Home size={20} />} label="Dashboard" open={isSidebarOpen} onClick={() => handleSetActivePage('dashboard')} />)}
                    <SidebarItem icon={<User size={20} />} label="Profile" open={isSidebarOpen} onClick={() => handleSetActivePage('profile')} />
                    <SidebarItem icon={<User size={20} />} label="User Management" open={isSidebarOpen} onClick={() => handleSetActivePage('user-management')} />
                    {/* {showFacilityBreakdown && (<SidebarItem icon={<Settings size={20} />} label="Settings" open={isSidebarOpen} onClick={() => handleSetActivePage('settings')} />)} */}

                    {isSidebarOpen && (
                        <>
                            <button
                                onClick={() => setIsFacilityOpen(!isFacilityOpen)}
                                className="px-2 pt-4 text-xs font-bold text-[#ffa7a7] uppercase tracking-wider text-left w-full"
                            >
                                Facility Bookings {isFacilityOpen ? '▾' : '▸'}
                            </button>
                            {isFacilityOpen && (
                                <>
                                    <SidebarItem icon={<Calendar size={20} />} label="Facility Calendar" open={isSidebarOpen} onClick={() => handleSetActivePage('calendar')} />
                                    <SidebarItem icon={<ClipboardList size={20} />} label="Facility Bookings" open={isSidebarOpen} onClick={() => handleSetActivePage('booking')} />
                                    <SidebarItem icon={<Calendar size={20} />} label="Manage Equipment" open={isSidebarOpen} onClick={() => handleSetActivePage('manage-equipment')} />
                                    {/* {showFacilityBreakdown && (
                                        <SidebarItem
                                            icon={<ClipboardList size={20} />}
                                            label="Facility Breakdown"
                                            open={isSidebarOpen}
                                            onClick={() => handleSetActivePage('facility-breakdown')}
                                        />
                                    )} */}
                                </>
                            )}
                        </>
                    )}

                    {isSidebarOpen && (
                        <>
                            <button
                                onClick={() => setIsVehicleOpen(!isVehicleOpen)}
                                className="px-2 pt-4 text-xs font-bold text-[#ffa7a7] uppercase tracking-wider text-left w-full"
                            >
                                Vehicle Bookings {isVehicleOpen ? '▾' : '▸'}
                            </button>
                            {isVehicleOpen && (
                                <>
                                    <SidebarItem icon={<Calendar size={20} />} label="Vehicle Calendar" open={isSidebarOpen} onClick={() => handleSetActivePage('vehicle-calendar')} />
                                    <SidebarItem icon={<ClipboardList size={20} />} label="Vehicle Bookings" open={isSidebarOpen} onClick={() => handleSetActivePage('vehicle-booking')} />
                                    {/* {showFacilityBreakdown && (
                                        <SidebarItem icon={<ClipboardList size={20} />} label="Vehicle Breakdown" open={isSidebarOpen} onClick={() => handleSetActivePage('vehicle-breakdown')} />
                                    )} */}

                                </>
                            )}
                        </>
                    )}

                    <SidebarItem icon={<LogOut size={20} />} label="Logout" open={isSidebarOpen} onClick={handleLogout} />
                </nav>
            </div>

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
