import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'India Bazzar',
  description: 'Connecting street food vendors and suppliers across India',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><head>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
      
      <body className="bg-white text-gray-900">
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
        {children}
      </body>
    </html>
  );
}
