import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import Script from 'next/script';
import BackButton from '../app/components/BackButton'; // ✅ Import stays here

export const metadata: Metadata = {
  title: 'India Bazzar',
  description: 'Connecting street food vendors and suppliers across India',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-white text-gray-900">
        {/* Razorpay script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        {/* Toaster for Sonner notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />

        {/* ✅ Global Back Button */}
        <BackButton />

        {/* Existing Page Content */}
        {children}
      </body>
    </html>
  );
}
