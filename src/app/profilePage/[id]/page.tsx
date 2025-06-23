import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import PageLayout from '@/app/components/PageLayout';
import dynamic from 'next/dynamic';
import TrackItem from '@/app/components/ListItems/TrackItem';
import PlaylistItem from '@/app/components/ListItems/PlaylistItem';
import BadgeItem from '@/app/components/ListItems/BadgeItem';
import RatingItem from '@/app/components/ListItems/RatingItem';

const prisma = new PrismaClient();

const FollowButton = dynamic(() => import("@/app/components/FollowButton/FollowButton").then((mod) => mod.FollowButton), { ssr: true });
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
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
        <div className="w-full max-w-md bg-[#282733] p-8 rounded-lg shadow-lg">
          <h2 className="text-4xl text-white mb-6">Profil de {user.username}</h2>

          {/* Followers & Following Count */}
          <div className="mt-4 text-white flex flex-row justify-around">
            <a href={`/profilePage/${user.id}/followers`} className="text-blue-400 hover:underline">
              <strong>Abonnés:</strong> {user.followerscount}
            </a>
            <a href={`/profilePage/${user.id}/following`} className="text-blue-400 hover:underline">
              <strong>Abonnements:</strong> {user.followingcount}
            </a>
            {/* Follow Button */}
            {!isOwnProfile && (
              <FollowButton userId={user.id} isFollowing={isFollowing} />
            )}
          </div>

          {/* Profile Picture */}
          <img src={user.profilepicture || "/default-avatar.jpg"} alt="Profile" className="w-24 h-24 rounded-full mb-4"/>

          {/* Username */}
          <p className="text-white"><strong>Nom :</strong> {user.username}</p>

          {/* Email - Visible only if it's their own profile */}
          {isOwnProfile && <p className="text-white"><strong>Email:</strong> {user.email}</p>}

          {/* Tracks as Artist */}
          {user.trackartists.length > 0 && (
            <div className="bg-[#3a3a4a] p-4 rounded-lg mb-4">
              <h3 className="text-2xl text-white mb-2">Vos titres</h3>
              <ExpandableList items={user.trackartists} ItemComponent={TrackItem} isOwnProfile={isOwnProfile} />
            </div>
          )}

          {/* Playlists Containing the User's Tracks */}
          {playlists.length > 0 && (
            <div className="bg-[#3a3a4a] p-4 rounded-lg mb-4">
              <h3 className="text-2xl text-white mb-2">Playlists incluant vos titres</h3>
              <ExpandableList items={playlists} ItemComponent={PlaylistItem} isOwnProfile={isOwnProfile} />
            </div>
          )}

          {/* Badges - Only visible to the user */}
          {isOwnProfile && user.userbadges.length > 0 && (
            <div className="bg-[#3a3a4a] p-4 rounded-lg mb-4">
              <h3 className="text-2xl text-white mb-2">Badges</h3>
              <ExpandableList items={user.userbadges} ItemComponent={BadgeItem} isOwnProfile={isOwnProfile} />
            </div>
          )}

          {/* Ratings - Only visible to the user */}
          {isOwnProfile && user.ratings.length > 0 && (
            <div className="bg-[#3a3a4a] p-4 rounded-lg mb-4">
              <h3 className="text-2xl text-white mb-2">Titres notés</h3>
              <ExpandableList items={user.ratings} ItemComponent={RatingItem} isOwnProfile={isOwnProfile} />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
