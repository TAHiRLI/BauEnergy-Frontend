import React, { useState } from 'react';
import { loginService } from '../../APIs/Services/login.service'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';
import cookies from "universal-cookie";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setError(null);
        
        try {
            const body = { email, password };
            const user = await loginService.login(body);
            console.log(user)
            
            // After login, you can redirect or handle as needed
            navigate('/products'); // Example: Redirect to a dashboard page
        } catch (error) {
            setError('Invalid credentials or server error');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md w-full max-w-sm" onSubmit={handleLogin}>
                <h2 className="text-2xl font-bold mb-4">Login</h2>

                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
