'use client';

import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { User } from '@/app/interfaces/User';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/current', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
        else setUser(null);
      })
      .catch(err => {
        console.error('Error fetching current user:', err);
        setUser(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#1C1C2E]">
      <Navbar user={user} />
      
      {/* Contenu principal avec espacement pour la navbar fixe */}
      <main className="pt-20 min-h-screen pb-28 bg-[#1C1C2E]">
        <div className="relative">
          {/* Effet de gradient subtil en arrière-plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C2E] via-[#242438] to-[#2A2A40] opacity-50"></div>
          
          {/* Contenu avec z-index pour être au-dessus du gradient */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
