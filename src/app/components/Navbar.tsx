'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout, userRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow px-6 py-4 flex items-center justify-between relative">
      {/* Hamburger Menu on left */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden p-2 rounded hover:bg-gray-200"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-black md:ml-4">
        India Bazzar
      </Link>

      {/* Desktop Links */}
      <div className="flex gap-4 items-center ml-auto">
        {user ? (
          <>
            <Link href={userRole === 'vendor' ? '/vendor' : '/supplier'}>
              <span className="text-gray-700 hover:underline">Dashboard</span>
            </Link>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-black px-4 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="text-gray-900 hover:underline">
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded mt-2 p-4 z-50">
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link
                    href={userRole === 'vendor' ? '/vendor' : '/supplier'}
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded w-full"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
