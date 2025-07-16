import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import PageLayout from '@/app/components/PageLayout';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FaPlay, FaMusic, FaHeart, FaCalendar } from 'react-icons/fa';
import MusicCard from '@/app/components/MusicCard/MusicCard';
import { ExtendedTrack } from '@/app/musicListPage/page';
import PlayAllButton from '@/app/components/PlayAllButton/PlayAllButton';

const prisma = new PrismaClient();

const FollowButton = dynamic(() => import("@/app/components/FollowButton/FollowButton"), { ssr: true });

interface ArtistPageProps {
  params: { id: string };
}

export default async function ArtistPage(context: ArtistPageProps) {
  const awaitedParams = await context.params;
  const artistId = parseInt(awaitedParams.id, 10);

  if (isNaN(artistId)) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="text-white text-xl">ID d'artiste invalide</div>
        </div>
      </PageLayout>
    );
  }

  // Récupérer l'utilisateur connecté
  const cookieStore = await cookies();
  const rawToken = cookieStore.get('token')?.value || '';

  let currentUserId: number | null = null;
  if (rawToken) {
    try {
      const secret = process.env.JWT_SECRET || 'default_secret';
      const decoded = jwt.verify(rawToken, secret) as jwt.JwtPayload;
      currentUserId = decoded.userId;
    } catch (error) {
      console.error('Invalid token', error);
    }
  }

  // Récupérer les données de l'artiste
  const artist = await prisma.users.findUnique({
    where: { id: artistId },
    include: {
      trackartists: {
        where: { role: 'ARTIST' },
        include: {
          tracks: {
            include: {
              trackartists: {
                include: {
                  users: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!artist) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <div className="text-white text-xl">Artiste non trouvé</div>
        </div>
      </PageLayout>
    );
  }

  // Vérifier si l'utilisateur suit cet artiste
  const followRecord = await prisma.follows.findUnique({
    where: {
      followinguserid_followeduserid: {
        followinguserid: currentUserId || -1,
        followeduserid: artistId,
      },
    },
  });

  const isFollowing = !!followRecord;
  const isOwnProfile = artistId === currentUserId;

  // Transformer les données pour le format ExtendedTrack
  function parseDuration(seconds: number | null | undefined): string {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  }

  const artistTracks: ExtendedTrack[] = artist.trackartists
    .map((ta) => {
      const track = ta.tracks;
      const mainArtist = track.trackartists?.find((a) => a.role === "ARTIST");
      return {
        ...track,
        artistname: mainArtist?.users?.username || "Unknown Artist",
        artistid: mainArtist?.users?.id || 0,
        parsedduration: parseDuration(track.duration),
        trackpicture: track.trackpicture || "https://placehold.co/400",
      };
    })
    // Trier par popularité (combinaison des écoutes et des j'aime)
    .sort((a, b) => {
      const scoreA = a.playcount + (a.likecount * 2) - a.dislikecount;
      const scoreB = b.playcount + (b.likecount * 2) - b.dislikecount;
      return scoreB - scoreA;
    });

  // Calculer les statistiques
  const totalTracks = artistTracks.length;
  const totalPlays = artistTracks.reduce((sum, track) => sum + track.playcount, 0);
  const totalLikes = artistTracks.reduce((sum, track) => sum + track.likecount, 0);
  const averageRating = artistTracks.length > 0 
    ? artistTracks.reduce((sum, track) => sum + track.averagerating, 0) / artistTracks.length 
    : 0;

  return (
    <PageLayout>
      <div className="min-h-screen pt-8 bg-[#121212]">
        {/* Breadcrumb */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center space-x-2 text-sm text-white/60">
              <a href="/musicListPage" className="hover:text-white transition-colors">
                Musique
              </a>
              <span>/</span>
              <span className="text-white">Artiste</span>
            </nav>
          </div>
        </div>

        {/* Header de l'artiste */}
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-purple-800/20 to-[#121212] h-96"></div>
          
          <div className="relative z-10 px-6 pt-20 pb-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                {/* Photo de profil */}
                <div className="relative">
                  <Image
                    src={artist.profilepicture || "/default-artist.svg"}
                    alt={artist.username}
                    width={232}
                    height={232}
                    className="w-32 h-32 md:w-56 md:h-56 rounded-full object-cover border-4 border-white/10 shadow-2xl"
                    unoptimized
                  />
                </div>

                {/* Informations de l'artiste */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs font-medium text-white/80">
                      ARTISTE
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    {artist.username}
                  </h1>

                  {/* Statistiques */}
                  <div className="flex items-center gap-6 text-sm text-white/70">
                    <span className="flex items-center gap-2">
                      <FaMusic size={12} />
                      {totalTracks} titre{totalTracks > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-2">
                      <FaHeart size={12} />
                      {artist.followerscount} abonné{artist.followerscount > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-2">
                      <FaCalendar size={12} />
                      Membre depuis {new Date(artist.joinDate).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-8">
                {artistTracks.length > 0 && (
                  <PlayAllButton tracks={artistTracks} />
                )}
                
                {!isOwnProfile && (
                  <FollowButton userId={artist.id} isFollowing={isFollowing} />
                )}
                
                <a 
                  href={`/profilePage/${artist.id}`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  Voir le profil complet
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section des morceaux */}
        <div className="px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Titre de section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Morceaux populaires</h2>
              <p className="text-white/60">
                {totalPlays.toLocaleString()} écoutes au total • {totalLikes.toLocaleString()} j'aime
              </p>
            </div>

            {/* Liste des morceaux */}
            {artistTracks.length > 0 ? (
              <div className="space-y-1">
                {artistTracks.map((track, index) => (
                  <div key={track.id} className="group hover:bg-white/5 rounded-lg transition-colors duration-200 p-3">
                    <div className="flex items-center gap-4">
                      {/* Numéro de rang avec hover effect */}
                      <div className="w-8 text-center">
                        <span className="text-white/60 group-hover:text-white font-mono text-sm transition-colors duration-200">
                          {index + 1}
                        </span>
                      </div>
                      
                      {/* MusicCard */}
                      <div className="flex-1">
                        <MusicCard
                          track={track}
                          index={index}
                          playlist={artistTracks}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FaMusic className="mx-auto text-6xl text-white/20 mb-4" />
                <h3 className="text-xl font-semibold text-white/60 mb-2">
                  Aucun morceau disponible
                </h3>
                <p className="text-white/40 mb-6">
                  Cet artiste n'a pas encore publié de musique.
                </p>
                {isOwnProfile && (
                  <a 
                    href="/createTrack"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                  >
                    <FaMusic size={14} />
                    Publier votre première musique
                  </a>
                )}
              </div>
            )}

            {/* Statistiques détaillées */}
            {artistTracks.length > 0 && (
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/5 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-2">{totalTracks}</div>
                  <div className="text-sm text-white/60">Morceaux</div>
                </div>
                <div className="bg-white/5 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-2">{totalPlays.toLocaleString()}</div>
                  <div className="text-sm text-white/60">Écoutes</div>
                </div>
                <div className="bg-white/5 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-2">{totalLikes.toLocaleString()}</div>
                  <div className="text-sm text-white/60">J'aime</div>
                </div>
                <div className="bg-white/5 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-2">{averageRating.toFixed(1)}</div>
                  <div className="text-sm text-white/60">Note moyenne</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
