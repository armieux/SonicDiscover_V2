'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from './components/AdminLayout';
import UserManagement from './components/UserManagement';
import TrackManagement from './components/TrackManagement';
import CommentManagement from './components/CommentManagement';
import StatsDashboard from './components/StatsDashboard';
import { FiUsers, FiMusic, FiMessageSquare, FiBarChart2 } from 'react-icons/fi';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const user = await response.json();
        if (user.role !== 'admin') {
          router.push('/');
          return;
        }
        setCurrentUser(user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Vérification des permissions...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: FiBarChart2 },
    { id: 'users', label: 'Utilisateurs', icon: FiUsers },
    { id: 'tracks', label: 'Musiques', icon: FiMusic },
    { id: 'comments', label: 'Commentaires', icon: FiMessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'tracks':
        return <TrackManagement />;
      case 'comments':
        return <CommentManagement />;
      default:
        return <StatsDashboard />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-2">
            Panel d&apos;Administration
          </h1>
          <p className="text-gray-300">
            Gérez les utilisateurs, musiques et commentaires de SonicDiscover
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <div className="flex space-x-1 p-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="text-lg" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
}
