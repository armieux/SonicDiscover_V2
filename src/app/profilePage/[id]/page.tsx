import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import PageLayout from '@/app/components/PageLayout';
import TrackItem from '@/app/components/ListItems/TrackItem';
import PlaylistItem from '@/app/components/ListItems/PlaylistItem';
import BadgeItem from '@/app/components/ListItems/BadgeItem';
import RatingItem from '@/app/components/ListItems/RatingItem';
import SafeImage from '@/app/components/SafeImage/SafeImage';
import UserMusicStats from "@/app/components/UserMusicStats/UserMusicStats";
import { FollowButton } from "@/app/components/FollowButton/FollowButton";
import ExpandableList from "@/app/components/ExpandableList/ExpandableList";

const prisma = new PrismaClient();

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return <div>Invalid User ID</div>;
  }

  // Identify current logged-in user from cookies
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

  const isOwnProfile = userId === currentUserId;

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      userbadges: isOwnProfile ? { include: { badges: true } } : false,
      trackartists: {
        include: {
          users: true, // Ensure users property is included for TrackArtist
          tracks: {
            include: {
              playlisttracks: {
                include: { playlists: true }, // Fetch playlists containing the user’s tracks
              },
            },
          },
        },
      },
      ratings: isOwnProfile ? { include: { tracks: true } } : false,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const followRecord = await prisma.follows.findUnique({
    where: {
      followinguserid_followeduserid: {
        followinguserid: currentUserId || -1,
        followeduserid: userId,
      },
    },
  });

  const isFollowing = !!followRecord;

  // Extract unique playlists
  const playlists = user.trackartists.flatMap((artist) =>
    artist.tracks.playlisttracks.map((pt) => pt.playlists)
  );

  // Before rendering, fix all non-nullable fields for all user.trackartists
  const fixedTrackArtists = user.trackartists.map((ta) => ({
    ...ta,
    tracks: {
      ...ta.tracks,
      trackpicture: ta.tracks.trackpicture || "https://placehold.co/400",
      genre: ta.tracks.genre || "Unknown Genre",
      bpm: ta.tracks.bpm ?? 0,
      mood: ta.tracks.mood || "",
      uploaddate: ta.tracks.uploaddate || new Date(0),
      audiofile: ta.tracks.audiofile || "",
      playcount: ta.tracks.playcount ?? 0,
      likecount: ta.tracks.likecount ?? 0,
      dislikecount: ta.tracks.dislikecount ?? 0,
      averagerating: ta.tracks.averagerating ?? 0,
      duration: ta.tracks.duration ?? 0,
      title: ta.tracks.title || "",
      id: ta.tracks.id ?? 0,
      playlisttracks: ta.tracks.playlisttracks?.map(pt => ({
        playlistId: pt.playlistid,
        trackId: pt.trackid,
        order: pt.order,
        playlist: {
          id: pt.playlists.id,
          name: pt.playlists.name,
          playlistPicture: pt.playlists.playlistpicture || "",
          description: pt.playlists.description || "",
          creatorId: pt.playlists.creatorid,
          playlisttracks: [],
          playlistcreator: {
            id: 0,
            username: "Unknown",
            email: "",
            password: "",
            role: "user",
            profilepicture: "",
            joindate: new Date(0),
            followerscount: 0,
            followingcount: 0,
          },
        },
      })) || [],
    },
  }));

  // Fix playlistpicture for all playlists before rendering
  const fixedPlaylists = playlists.map((pl) => ({
    ...pl,
    playlistpicture: pl.playlistpicture || undefined,
  }));

  // Define explicit types for badges and ratings
  interface BadgeWithArray {
    badgeid: number;
    badges: { badgeicon?: string; name: string }[];
    [key: string]: unknown;
  }
  interface RatingWithArray {
    id: number;
    tracks: { id: number; title: string; trackpicture?: string }[];
    liked: boolean;
    [key: string]: unknown;
  }

  // Fix userbadges for ExpandableList, use first badge from badges array (type safe)
  const fixedUserBadges = (((user.userbadges as unknown) as BadgeWithArray[]) || [])
    .filter((ub) => Array.isArray(ub.badges) && ub.badges.length > 0)
    .map((ub) => ({
      ...ub,
      badges: ub.badges[0],
    }));

  // Fix ratings for ExpandableList, use first track from tracks array (type safe)
  const fixedRatings = (((user.ratings as unknown) as RatingWithArray[]) || [])
    .filter((r) => Array.isArray(r.tracks) && r.tracks.length > 0)
    .map((r) => ({
      ...r,
      tracks: r.tracks[0],
    }));

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#1C1C2E] p-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profil principal */}
            <div className="lg:col-span-1">
              <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-8 rounded-3xl">
                <div className="text-center">
                  {/* Profile Picture */}
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <SafeImage
                      src={user.profilepicture} 
                      alt="Profile" 
                      width={128}
                      height={128}
                      className="w-full h-full rounded-full object-cover border-4 border-[#F2A365] shadow-lg"
                      fallbackComponent={
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#F2A365] to-[#D9BF77] flex items-center justify-center border-4 border-[#F2A365] shadow-lg">
                          <svg className="w-16 h-16 text-[#1C1C2E]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      }
                    />
                  </div>

                  {/* Username */}
                  <h2 className="text-4xl font-bold text-[#F1F1F1] mb-2">{user.username}</h2>
                  
                  {/* Email - Visible only if it's their own profile */}
                  {isOwnProfile && (
                    <p className="text-[#B8B8B8] mb-4">{user.email}</p>
                  )}

                  {/* Followers & Following Count */}
                  <div className="flex justify-center gap-6 mb-6">
                    <a href={`/profilePage/${user.id}/followers`} className="text-center hover:scale-105 transition-transform duration-300">
                      <div className="text-2xl font-bold text-[#F2A365]">{user.followerscount}</div>
                      <div className="text-[#B8B8B8] text-sm">Abonnés</div>
                    </a>
                    <a href={`/profilePage/${user.id}/following`} className="text-center hover:scale-105 transition-transform duration-300">
                      <div className="text-2xl font-bold text-[#D9BF77]">{user.followingcount}</div>
                      <div className="text-[#B8B8B8] text-sm">Abonnements</div>
                    </a>
                  </div>

                  {/* Follow Button and Artist Link */}
                  {!isOwnProfile && (
                    <FollowButton userId={user.id} isFollowing={isFollowing} />
                  )}
                  
                  {user.trackartists.length > 0 && (
                    <a 
                      href={`/artist/${user.id}`}
                      className="block mt-4 text-center bg-gradient-to-r from-[#F2A365] to-[#D9BF77] hover:from-[#D9BF77] hover:to-[#F2A365] text-[#1C1C2E] font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                    >
                      🎵 Page Artiste
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tracks as Artist */}
              {user.trackartists.length > 0 && (
                <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-6 rounded-2xl">
                  <h3 className="text-2xl font-bold text-[#F2A365] mb-4">🎵 Vos titres</h3>
                  <ExpandableList items={fixedTrackArtists} ItemComponent={TrackItem} isOwnProfile={isOwnProfile} />
                </div>
              )}

              {/* Playlists Containing the User's Tracks */}
              {fixedPlaylists.length > 0 && (
                <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-6 rounded-2xl">
                  <h3 className="text-2xl font-bold text-[#D9BF77] mb-4">📁 Playlists incluant vos titres</h3>
                  <ExpandableList items={fixedPlaylists} ItemComponent={PlaylistItem} isOwnProfile={isOwnProfile} />
                </div>
              )}

              {/* Badges - Only visible to the user */}
              {isOwnProfile && user.userbadges.length > 0 && (
                <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-6 rounded-2xl">
                  <h3 className="text-2xl font-bold text-[#3E5C76] mb-4">🏆 Badges</h3>
                  <ExpandableList items={fixedUserBadges} ItemComponent={BadgeItem} isOwnProfile={isOwnProfile} />
                </div>
              )}

              {/* Ratings - Only visible to the user */}
              {isOwnProfile && user.ratings.length > 0 && (
                <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-6 rounded-2xl">
                  <h3 className="text-2xl font-bold text-[#F2A365] mb-4">⭐ Titres notés</h3>
                  <ExpandableList items={fixedRatings} ItemComponent={RatingItem} isOwnProfile={isOwnProfile} />
                </div>
              )}
            </div>
          </div>
          
          {/* User Stats Section - Full Width */}
          {isOwnProfile && (
            <div className="mt-12">
              <UserMusicStats />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
