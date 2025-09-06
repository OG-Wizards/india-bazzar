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
  const [step, setStep] = useState(1); // step 1, 2, 3
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gstin: '',
    fssai: '',
    otp: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const recaptchaRef = useRef<any>(null);
  // Function to fetch city/state by pincode
const fetchCityState = async (pincode: string) => {
  if (pincode.length === 6) {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();

      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setForm(prev => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State,
        }));
      }
    } catch (err) {
      console.error("Error fetching city/state:", err);
    }
  }
};

// Modified handleChange
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setForm({ ...form, [name]: value });

  // extra check for pincode
  if (name === "pincode" && value.length === 6) {
    fetchCityState(value);
  }
};



  useEffect(() => {
    if (!document.getElementById('recaptcha-container')) {
      const div = document.createElement('div');
      div.id = 'recaptcha-container';
      document.body.appendChild(div);
    }
  }, []);

  

  // ✅ GSTIN validation
  const isValidGSTIN = (gstin: string) => {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstRegex.test(gstin);
  };

  // ✅ FSSAI validation
  const isValidFSSAI = (fssai: string) => /^[0-9]{14}$/.test(fssai);

  // Send OTP (step 2)
  const sendOTP = async () => {
    setError('');
    if (!isValidGSTIN(form.gstin)) {
      setError('Invalid GSTIN');
      return;
    }
    if (!isValidFSSAI(form.fssai)) {
      setError('Invalid FSSAI Number');
      return;
    }

    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
        await recaptchaRef.current.render();
      }

      const result = await signInWithPhoneNumber(
        auth,
        '+91' + form.phone,
        recaptchaRef.current
      );
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Final signup
  const verifyOTPAndSignup = async () => {
    try {
      await confirmationResult.confirm(form.otp);
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCred.user;

      await updateProfile(user, { displayName: 'supplier' });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        email: form.email,
        phone: form.phone,
        gstin: form.gstin,
        fssai: form.fssai,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        role: 'supplier',
      });

      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100"
    style={{backgroundImage:"C:\Users\deshm\Downloads\WhatsApp Image 2025-08-20 at 11.06.28_39486a87.jpg"}}>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-black mb-4">Supplier Signup</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}

        {/* Step 1 - Basic Info */}
        {step === 1 && (
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
              className="w-full border p-2 mb-4 text-gray-800"
              required
            />
            <button
              onClick={() => setStep(2)}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
            >
              Next
            </button>
          </>
        )}

        {/* Step 2 - KYC */}
        {step === 2 && (
          <>
            <input
              type="text"
              name="gstin"
              placeholder="GSTIN"
              value={form.gstin}
              onChange={handleChange}
              className="w-full border p-2 mb-2 text-gray-800"
              required
            />
            <input
              type="text"
              name="fssai"
              placeholder="FSSAI Number"
              value={form.fssai}
              onChange={handleChange}
              className="w-full border p-2 mb-4 text-gray-800"
              required
            />

            {!otpSent ? (
              <button
                type="button"
                onClick={sendOTP}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Send OTP
              </button>
            ) : (
              <>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={form.otp}
                  onChange={handleChange}
                  className="w-full border p-2 mb-2 text-gray-800"
                  required
                />
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Verify OTP & Next
                </button>
              </>
            )}
          </>
        )}

        {/* Step 3 - Address */}
        {step === 3 && (
          <>
            <input
              type="text"
              name="address"
              placeholder="Shop Address"
              value={form.address}
              onChange={handleChange}
              className="w-full border p-2 mb-2 text-gray-800"
              required
            />
            <input
  type="text"
  name="pincode"
  placeholder="Pincode"
  value={form.pincode}
  onChange={handleChange}
  className="w-full border p-2 mb-2 text-gray-800"
  required
/>

<input
  type="text"
  name="city"
  placeholder="City"
  value={form.city}
  readOnly
  className="w-full border p-2 mb-2 text-gray-800 bg-gray-100"
/>

<input
  type="text"
  name="state"
  placeholder="State"
  value={form.state}
  readOnly
  className="w-full border p-2 mb-2 text-gray-800 bg-gray-100"
/>

            <button
              type="button"
              onClick={verifyOTPAndSignup}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Complete Signup
            </button>
          </>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
