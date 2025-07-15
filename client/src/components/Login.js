import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import CJC_LOGO from '../assets/logos/cjc_logo.png';
//Link, NavLink,
function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (data.success) {
                navigate('/landing');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error');
        }
    };
    return (
        <>
            <div className="bg absolute top-0 left-0 bg-gradient-to-b bg-white  bottom-0 leading-5 h-full w-full overflow-hidden"></div>
            {/* <div className="bg absolute top-0 left-0 bg-gradient-to-b from-gray-900 via-gray-900 to-purple-800 bottom-0 leading-5 h-full w-full overflow-hidden"></div> */}

            <div className="relative min-h-screen sm:flex sm:flex-row justify-center bg-transparent rounded-3xl shadow-xl  z-10">
                {/* Left Text Panel */}
                <div className='flex h-5/6 my-auto'>
                    <div className="flex-col flex self-center lg:px-14 sm:max-w-4xl xl:max-w-md shadow-lg h-full">
                        <div className="self-start hidden lg:flex flex-col text-gray-300 text-center ">
                            <img src={CJC_LOGO} alt='CJC Logo' className='w-full h-full' />
                            <h1 className="my-3 font-semibold text-4xl text-gray-400">SmartSched</h1>
                            <p className="pr-3 text-sm opacity-75 text-justify text-gray-400">
                                A smart Cor Jesu College booking room, facilities & vehicle bookings that enabled smooth and faster bookings for all students, employees
                            </p>
                            <p>
                                .
                            </p>
                            <p>
                                .
                            </p>
                            <p>
                                .
                            </p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="flex justify-center self-center z-10">
                        <div className="p-12 mx-auto rounded-3xl w-96" style={{ backgroundColor: '#96161C' }}>
                            <div className="mb-7">
                                <h3 className="font-semibold text-2xl text-white">Sign In</h3>
                                <p className="text-white text-sm">
                                    Don’t have an account?{' '} Sign Up
                                    {/* <a className="text-purple-700 hover:text-purple-700">
                                    Sign Up
                                </a> */}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <input
                                    type="text"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full text-sm px-4 py-3 bg-gray-200 focus:bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                                />

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full text-sm px-4 py-3 bg-gray-200 focus:bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                                    />
                                    <div
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg
                                                className="h-5 text-purple-700"
                                                fill="currentColor"
                                                viewBox="0 0 640 512"
                                            >
                                                <path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45z" />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-5 text-gray-500"
                                                fill="currentColor"
                                                viewBox="0 0 576 512"
                                            >
                                                <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                <div className="text-sm ml-auto text-right text-white hover:text-purple-600">
                                    Forgot your password?
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex justify-center text-white p-3 rounded-lg tracking-wide font-semibold cursor-pointer transition ease-in duration-500"
                                    onClick={() => handleLogin()}
                                    style={{ backgroundColor: '#E74A3B' }}
                                >
                                    Sign in
                                </button>

                                {error && (
                                    <div className="text-red-500 text-sm text-center">{error}</div>
                                )}

                                <div className="flex items-center justify-center space-x-2 my-5">
                                    <span className="h-px w-16 bg-gray-100"></span>
                                    <span className="text-gray-300 font-normal">or</span>
                                    <span className="h-px w-16 bg-gray-100"></span>
                                </div>

                                <div className="flex justify-center gap-5">
                                    <button className="w-full flex items-center justify-center border border-gray-300 hover:border-gray-900 hover:bg-gray-900 text-sm text-white p-3 rounded-lg tracking-wide font-medium transition ease-in duration-500">
                                        Google
                                    </button>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
