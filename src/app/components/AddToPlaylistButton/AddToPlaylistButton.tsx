"use client";

import { Playlist } from "@/app/interfaces/Playlist";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { FaPlus, FaMusic, FaSearch, FaCheck, FaTimes, FaFolder, FaHeart } from "react-icons/fa";

export const AddToPlaylistButton = ({ trackId }: { trackId: number }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch user's playlists only when dropdown is opened for the first time
  useEffect(() => {
    if (dropdownOpen && playlists.length === 0) {
      fetchPlaylists();
    }
  }, [dropdownOpen, playlists.length]);

  // Filter playlists based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPlaylists(playlists);
    } else {
      const filtered = playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPlaylists(filtered);
    }
  }, [searchTerm, playlists]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [dropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [dropdownOpen]);

  // Clear feedback message after 3 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
        setFeedbackType(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const closeDropdown = () => {
    setDropdownOpen(false);
    setSearchTerm("");
    setShowCreateForm(false);
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setFeedbackMessage(null);
    setFeedbackType(null);
  };

  const openDropdown = () => {
    setDropdownOpen(true);
  };

  // Fetch the user's playlists
  const fetchPlaylists = async () => {
    try {
      const response = await fetch(`/api/playlists/user`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setFeedbackMessage("Erreur lors du chargement des playlists");
      setFeedbackType("error");
    }
  };

  // Handle adding a track to a playlist
  const handleAddToPlaylist = async (playlistId: number) => {
    setLoading(true);
    setSelectedPlaylist(playlistId);
    try {
      const response = await fetch(`/api/playlists/${playlistId}/add`, {
        method: "POST",
        body: JSON.stringify({ trackId }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const playlistName = playlists.find(p => p.id === playlistId)?.name || 'playlist';
        setFeedbackMessage(`Ajouté à "${playlistName}" avec succès !`);
        setFeedbackType("success");
        
        // Close dropdown after showing success message
        setTimeout(() => {
          closeDropdown();
        }, 1500);
      } else {
        const errorData = await response.json();
        setFeedbackMessage(errorData.message || "Erreur lors de l'ajout");
        setFeedbackType("error");
      }
    } catch (error) {
      console.error("Error adding to playlist:", error);
      setFeedbackMessage("Erreur lors de l'ajout à la playlist");
      setFeedbackType("error");
    } finally {
      setLoading(false);
      setSelectedPlaylist(null);
    }
  };

  // Handle creating a new playlist
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreatingPlaylist(true);
    try {
      const response = await fetch("/api/playlists/create", {
        method: "POST",
        body: JSON.stringify({ 
          name: newPlaylistName.trim(), 
          description: newPlaylistDescription.trim() 
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylists(prev => [...prev, newPlaylist]);
        setFeedbackMessage(`Playlist "${newPlaylistName}" créée avec succès !`);
        setFeedbackType("success");
        setShowCreateForm(false);
        setNewPlaylistName("");
        setNewPlaylistDescription("");
        
        // Add the track to the newly created playlist
        if (newPlaylist.id) {
          await handleAddToPlaylist(newPlaylist.id);
        }
      } else {
        const errorData = await response.json();
        setFeedbackMessage(errorData.message || "Erreur lors de la création");
        setFeedbackType("error");
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      setFeedbackMessage("Erreur lors de la création de la playlist");
      setFeedbackType("error");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        ref={buttonRef}
        onClick={openDropdown}
        disabled={loading}
        className="group relative w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        title="Ajouter à une playlist"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
        ) : (
          <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-300" />
        )}
      </button>

      {/* Enhanced Dropdown with Portal - Centered */}
      {dropdownOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
            onClick={closeDropdown}
          >
            {/* Dropdown */}
            <div 
              ref={dropdownRef}
              className="bg-gray-900 shadow-2xl rounded-xl w-full max-w-md z-[9999] border border-gray-700 overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FaMusic className="text-sm" />
                  Ajouter à une playlist
                </h3>
                <button
                  onClick={closeDropdown}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>

            {/* Feedback Message */}
            {feedbackMessage && (
              <div className={`px-4 py-3 flex items-center gap-2 text-sm ${
                feedbackType === 'success' 
                  ? 'bg-green-900/50 text-green-300 border-b border-green-800' 
                  : 'bg-red-900/50 text-red-300 border-b border-red-800'
              }`}>
                {feedbackType === 'success' ? <FaCheck /> : <FaTimes />}
                {feedbackMessage}
              </div>
            )}

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher une playlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Create New Playlist Button */}
            <div className="p-4 border-b border-gray-700">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                <FaPlus className="text-sm" />
                <span className="font-medium">Créer une nouvelle playlist</span>
              </button>
            </div>

            {/* Create Playlist Form */}
            {showCreateForm && (
              <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                <form onSubmit={handleCreatePlaylist} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nom de la playlist"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Description (optionnel)"
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creatingPlaylist || !newPlaylistName.trim()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-sm"
                    >
                      {creatingPlaylist ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                          Création...
                        </>
                      ) : (
                        <>
                          <FaCheck className="text-xs" />
                          Créer et ajouter
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Playlists List */}
            <div className="flex-1 overflow-y-auto">
              {filteredPlaylists.length > 0 ? (
                <div className="py-2">
                  {filteredPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => handleAddToPlaylist(playlist.id)}
                      disabled={loading && selectedPlaylist === playlist.id}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-all duration-200 flex items-center gap-3 group ${
                        loading && selectedPlaylist === playlist.id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {/* Playlist Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <FaFolder className="text-white text-sm" />
                        </div>
                      </div>
                      
                      {/* Playlist Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium truncate group-hover:text-purple-200 transition-colors">
                            {playlist.name}
                          </h4>
                          {playlist.private && (
                            <div className="flex-shrink-0 text-xs text-gray-400">
                              🔒
                            </div>
                          )}
                        </div>
                        {playlist.description && (
                          <p className="text-gray-400 text-sm truncate mt-1">
                            {playlist.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaMusic className="text-xs" />
                            {playlist.trackCount || 0} titres
                          </span>
                          {playlist.likeCount && playlist.likeCount > 0 && (
                            <span className="flex items-center gap-1">
                              <FaHeart className="text-xs" />
                              {playlist.likeCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Loading Indicator */}
                      <div className="flex-shrink-0">
                        {loading && selectedPlaylist === playlist.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-purple-500"></div>
                        ) : (
                          <FaPlus className="text-gray-400 group-hover:text-purple-400 transition-colors text-sm" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="p-8 text-center">
                  <FaSearch className="mx-auto text-4xl text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm">
                    Aucune playlist trouvée pour "{searchTerm}"
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FaFolder className="mx-auto text-4xl text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm mb-3">
                    Aucune playlist disponible
                  </p>
                  <p className="text-gray-500 text-xs">
                    Créez votre première playlist pour commencer
                  </p>
                </div>
              )}
            </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
