'use client';

import { useRouter } from 'next/navigation';
import Button from './components/ui/button';
import Navbar from './components/Navbar';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-gray-800">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-r from-orange-100 to-yellow-200">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to India Bazzar</h1>
          <p className="text-lg md:text-xl mb-8 max-w-xl">
            Connecting street food vendors with raw material suppliers across India
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => router.push('/vendor-signup')}
            >
              Vendor Signup
            </Button>
            <Button
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={() => router.push('/supplier-signup')}
            >
              Supplier Signup
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 md:px-20 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p>Easily find nearby raw materials or vendor demands using our intelligent search.</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Real-time Pricing</h3>
              <p>Live price updates of vegetables, grains, spices, and more.</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Separate Dashboards</h3>
              <p>Vendors and suppliers each get personalized dashboards for seamless control.</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Authentication</h3>
              <p>Secure Firebase authentication to protect your data.</p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="py-16 px-6 md:px-20 bg-white">
          <h2 className="text-3xl font-bold text-center mb-6">About Us</h2>
          <p className="text-center max-w-3xl mx-auto text-gray-700 leading-relaxed">
            India Bazzar is a solution built  to empower India’s
            street food economy. Our mission is to make procurement and sales smooth, real-time, and
            smart for every vendor and supplier on the streets of India.
          </p>
        </section>

        <footer className="py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} India Bazzar. All rights reserved.
        </footer>
      </main>
    </>
  );
}
