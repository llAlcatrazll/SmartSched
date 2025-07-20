import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import CJC_LOGO from '../assets/logos/cjc_logo.png';

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
                const userId = data.user.id;
                localStorage.setItem('currentUserId', userId); // store ID globally for later

                navigate('/landing');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error');
        }
    };

    return (
        <div className="relative min-h-screen flex justify-center bg-white">
            <div className='flex h-5/6 my-auto'>
                <div className="flex-col flex self-center lg:px-14 sm:max-w-4xl xl:max-w-md h-full">
                    <div className="self-start hidden lg:flex flex-col text-gray-300 text-center">
                        <img src={CJC_LOGO} alt='CJC Logo' className='w-full h-full' />
                        <h1 className="my-3 font-semibold text-4xl text-gray-400">SmartSched</h1>
                        <p className="pr-3 text-sm opacity-75 text-gray-400">
                            A smart Cor Jesu College booking app for room, facility & vehicle reservations.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center self-center z-10">
                    <div className="p-12 mx-auto rounded-3xl w-96" style={{ backgroundColor: '#96161C' }}>
                        <div className="mb-7">
                            <h3 className="font-semibold text-2xl text-white">Sign In</h3>
                            <p className="text-white text-sm">Don’t have an account? Sign Up</p>
                        </div>

                        <div className="space-y-6">
                            <input
                                type="text"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full text-sm px-4 py-3 bg-gray-200 focus:bg-gray-100 border border-gray-200 rounded-lg"
                            />

                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full text-sm px-4 py-3 bg-gray-200 focus:bg-gray-100 border border-gray-200 rounded-lg"
                                />
                                <div
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '🙈'}
                                </div>
                            </div>

                            <div className="text-sm text-right text-white">Forgot your password?</div>

                            <button
                                type="button"
                                className="w-full flex justify-center text-white p-3 rounded-lg font-semibold"
                                onClick={handleLogin}
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
                                <button className="w-full flex items-center justify-center border border-gray-300 hover:bg-gray-900 text-sm text-white p-3 rounded-lg font-medium">
                                    Google
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
