'use client';

import { ReactNode } from 'react';
import { FiArrowLeft, FiShield, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleBackToApp = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiShield className="text-2xl text-purple-400" />
                <span className="text-xl font-bold text-white">
                  Admin Panel
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToApp}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <FiArrowLeft className="text-sm" />
                <span>Retour à l&apos;app</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-colors"
              >
                <FiLogOut className="text-sm" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
