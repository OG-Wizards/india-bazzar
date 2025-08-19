'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/firebase/config';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SupplierSignup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    city: '',
    email: '',
    password: '',
    phone: '',
    gstin: '',
    otp: '',
  });

  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const recaptchaRef = useRef<any>(null);

  useEffect(() => {
    // Ensure reCAPTCHA container exists
    if (!document.getElementById('recaptcha-container')) {
      const div = document.createElement('div');
      div.id = 'recaptcha-container';
      document.body.appendChild(div);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidGSTIN = (gstin: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gstin);
  };

  const sendOTP = async () => {
    setError('');
    if (!isValidGSTIN(form.gstin)) {
      setError('Invalid GSTIN');
      return;
    }

    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
        });
        await recaptchaRef.current.render(); // ensure it's attached
      }

      const result = await signInWithPhoneNumber(auth, '+91' + form.phone, recaptchaRef.current);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const verifyOTPAndSignup = async () => {
    try {
      await confirmationResult.confirm(form.otp);
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCred.user;

      await updateProfile(user, { displayName: 'supplier' });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        city: form.city,
        email: form.email,
        phone: form.phone,
        gstin: form.gstin,
        role: 'supplier',
      });

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-4">Supplier Signup</h2>
        {error && <p className="text-red-500 mb-3 ">{error}</p>}

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
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="w-full border p-2 mb-2 text-gray-800"
              required
            />
            <input
              type="text"
              name="gstin"
              placeholder="GSTIN"
              value={form.gstin}
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
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 "
            >
              Verify OTP & Signup
            </button>
          </>
        )}

        {/* This div is still necessary for reCAPTCHA */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
