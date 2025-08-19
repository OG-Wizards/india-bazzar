'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth } from '@/firebase/config';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return toast.error('Email and password are required');
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const role = userCred.user.displayName;

      if (role === 'vendor') {
        toast.success('Logged in as Vendor');
        router.push('/vendor');
      } else if (role === 'supplier') {
        toast.success('Logged in as Supplier');
        router.push('/supplier');
      } else {
        toast.error('User role not found. Please contact support.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-black text-center">Login</h2>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border rounded px-4 py-2 text-gray-800"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border rounded px-4 py-2 text-gray-800"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
