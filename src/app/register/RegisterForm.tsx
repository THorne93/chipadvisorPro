'use client';

import { useState } from 'react';
import { Input, Button, message } from 'antd';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (!email || !username || !password || !confirmPassword) {
            message.warning('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                message.error(data.error || 'Registration failed');
            } else {
                message.success('Registration successful');
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (res.ok) {
                    message.success('Logged in');
                    window.location.href = '/';
                } else {
                    const err = await res.json();
                    message.error(err.error || 'Login failed');
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            message.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 className="text-xl font-bold text-center mb-6">Register</h1>

            <div className="mb-4">
                <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <Input.Password
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <Input.Password
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <Button
                    type="primary"
                    loading={loading}
                    onClick={handleRegister}
                    className="w-full"
                >
                    Register
                </Button>
            </div>

        </>
    );
}
