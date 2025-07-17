'use client';

import { useState, useEffect } from 'react';
import { FiTrash2, FiCheck, FiUser, FiSearch } from 'react-icons/fi';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  joindate: string;
  followerscount: number;
  followingcount: number;
  profilepicture?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleToggleVerification = async (userId: number, isVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: !isVerified }),
      });

      if (response.ok) {
        // Refresh users list
        fetchUsers();
      } else {
        alert('Erreur lors de la modification du statut de vérification');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        alert('Erreur lors de la modification du rôle');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du rôle:', error);
      alert('Erreur lors de la modification du rôle');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Chargement des utilisateurs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header et filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Recherche */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filtre par rôle */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="user">Utilisateur</option>
            <option value="artist">Artiste</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Total Utilisateurs</h3>
          <p className="text-3xl font-bold text-purple-400">{users.length}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Artistes</h3>
          <p className="text-3xl font-bold text-blue-400">
            {users.filter(u => u.role === 'artist').length}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-2">Administrateurs</h3>
          <p className="text-3xl font-bold text-green-400">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-4 text-white font-medium">Utilisateur</th>
              <th className="text-left py-3 px-4 text-white font-medium">Email</th>
              <th className="text-left py-3 px-4 text-white font-medium">Rôle</th>
              <th className="text-left py-3 px-4 text-white font-medium">Date d&apos;inscription</th>
              <th className="text-left py-3 px-4 text-white font-medium">Followers</th>
              <th className="text-left py-3 px-4 text-white font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <FiUser className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-300">{user.email}</td>
                <td className="py-4 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="artist">Artiste</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-4 px-4 text-gray-300">
                  {new Date(user.joindate).toLocaleDateString('fr-FR')}
                </td>
                <td className="py-4 px-4 text-gray-300">{user.followerscount}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleVerification(user.id, false)}
                      className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                      title="Ajouter badge vérifié"
                    >
                      <FiCheck />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                      title="Supprimer utilisateur"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>
    </div>
  );
}
