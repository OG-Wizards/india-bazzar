'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    city: '',
    email: '',
    password: '',
    role: 'vendor',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // Store the role in displayName
      await updateProfile(user, {
        displayName: form.role,
      });

      // Store extra user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        city: form.city,
        role: form.role,
        email: form.email,
      });

      // Redirect based on role
      router.push(form.role === 'vendor' ? '/vendor' : '/supplier');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSignup} className="bg-white shadow-md p-8 rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Signup</h1>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border mb-3 rounded-md "
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border mb-3 rounded-md "
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border mb-3 rounded-md "
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border mb-3 rounded-md "
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border mb-4 rounded-md"
        >
          <option value="vendor">Vendor</option>
          <option value="supplier">Supplier</option>
        </select>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
