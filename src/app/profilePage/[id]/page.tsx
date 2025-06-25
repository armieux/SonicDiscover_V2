import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import PageLayout from '@/app/components/PageLayout';
import dynamic from 'next/dynamic';
import TrackItem from '@/app/components/ListItems/TrackItem';
import PlaylistItem from '@/app/components/ListItems/PlaylistItem';
import BadgeItem from '@/app/components/ListItems/BadgeItem';
import RatingItem from '@/app/components/ListItems/RatingItem';
import Image from 'next/image';
import UserMusicStats from "@/app/components/UserMusicStats/UserMusicStats";

const prisma = new PrismaClient();

const FollowButton = dynamic(() => import("@/app/components/FollowButton/FollowButton"), { ssr: true });
const ExpandableList = dynamic(() => import("@/app/components/ExpandableList/ExpandableList"), { ssr: true });

interface ProfilePageProps {
  params: { id: string };
}

export default async function ProfilePage(context: ProfilePageProps) {
  const awaitedParams = await context.params;
  const userId = parseInt(awaitedParams.id, 10);

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
                    <Image 
                      src={user.profilepicture || "/default-avatar.jpg"} 
                      alt="Profile" 
                      width={128}
                      height={128}
                      className="w-full h-full rounded-full object-cover border-4 border-[#F2A365] shadow-lg"
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

                  {/* Follow Button */}
                  {!isOwnProfile && (
                    <FollowButton userId={user.id} isFollowing={isFollowing} />
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
                  <ExpandableList items={user.trackartists} ItemComponent={TrackItem} isOwnProfile={isOwnProfile} />
                </div>
              )}

              {/* Playlists Containing the User's Tracks */}
              {playlists.length > 0 && (
                <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-6 rounded-2xl">
                  <h3 className="text-2xl font-bold text-[#D9BF77] mb-4">📁 Playlists incluant vos titres</h3>
                  <ExpandableList items={playlists} ItemComponent={PlaylistItem} isOwnProfile={isOwnProfile} />
                </div>
              )}

              {/* Badges - Only visible to the user */}
              {isOwnProfile && user.userbadges.length > 0 && (
                <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-6 rounded-2xl">
                  <h3 className="text-2xl font-bold text-[#3E5C76] mb-4">🏆 Badges</h3>
                  <ExpandableList items={user.userbadges} ItemComponent={BadgeItem} isOwnProfile={isOwnProfile} />
                </div>
              )}

              {/* Ratings - Only visible to the user */}
              {isOwnProfile && user.ratings.length > 0 && (
                <div className="bg-[#2A2A40] bg-opacity-70 backdrop-blur-lg border border-[#3E5C76] border-opacity-30 p-6 rounded-2xl">
                  <h3 className="text-2xl font-bold text-[#F2A365] mb-4">⭐ Titres notés</h3>
                  <ExpandableList items={user.ratings} ItemComponent={RatingItem} isOwnProfile={isOwnProfile} />
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
