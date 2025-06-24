'use client'; // <-- Indicate this is a client component

import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import MusicPlayer from './MusicPlayer/MusicPlayer';
import { MusicProvider } from '../context/MusicContext';
import { User } from '@/app/interfaces/User'; // or define locally if needed

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // 1. Manage user state on the client
  const [user, setUser] = useState<User | null>(null);

  // 2. Fetch user data in a useEffect
  useEffect(() => {
    // Example: fetch an API route that returns { id, username, ... } or null
    fetch('/api/auth/current', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data); // set user if logged in
        else setUser(null);      // or null if not logged in
      })
      .catch(err => {
        console.error('Error fetching current user:', err);
        setUser(null);
      });
  }, []);

  return (
      <><MusicProvider>
        <div>
          {/* 3. Pass user to Navbar */}
          <Navbar user={user}/>
          <main style={mainStyles}>{children}</main>

        </div>
      </MusicProvider><MusicPlayer/></>
  );
};

const mainStyles = {
  minHeight: '80vh',
  backgroundColor: '#e8e8e8',
  paddingBottom: '112px', // Espace pour le player fixe en bas
};

export default Layout;
