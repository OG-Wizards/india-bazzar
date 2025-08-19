'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import toast from 'react-hot-toast';

export default function VendorSignup() {
  const router = useRouter();
  const auth = getAuth();

  const [form, setForm] = useState({
    name: '',
    city: '',
    email: '',
    password: '',
    mobile: '',
    otp: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<any>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOTP = async () => {
    setError('');

    if (!form.mobile.match(/^\d{10}$/)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
      }

      const result = await signInWithPhoneNumber(auth, '+91' + form.mobile, recaptchaRef.current);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success('OTP sent to your mobile');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const verifyOTPAndSignup = async () => {
    if (!confirmationResult) return;

    try {
      await confirmationResult.confirm(form.otp);
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCred.user;

      await updateProfile(user, { displayName: 'vendor' });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        city: form.city,
        email: form.email,
        phone: form.mobile,
        role: 'vendor',
      });

      toast.success('Signup successful! Please log in.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-4">Vendor Signup</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}

        {!otpSent ? (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 mb-2 text-gray-800"
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="w-full border p-2 mb-2 text-gray-800"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 mb-2 text-gray-800"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-2 mb-2 text-gray-800"
              required
            />
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={handleChange}
              className="w-full border p-2 mb-4 text-gray-800"
              required
            />
            <button
              type="button"
              onClick={sendOTP}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={form.otp}
              onChange={handleChange}
              className="w-full border p-2 mb-3 text-gray-800"
              required
            />
            <button
              type="button"
              onClick={verifyOTPAndSignup}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Verify OTP & Signup
            </button>
          </>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
