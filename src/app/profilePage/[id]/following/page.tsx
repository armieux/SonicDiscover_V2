import { PrismaClient } from '@prisma/client';
import Layout from '@/app/components/Layout';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function FollowingPage({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params);
  const userId = parseInt(id, 10);

  // Récupérer les informations de l'utilisateur directement
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profilepicture: true,
      followingcount: true,
    },
  });

  // Récupérer la liste des utilisateurs suivis
  const following = await prisma.follows.findMany({
    where: { followinguserid: userId },
    include: { 
      users_follows_followeduseridTousers: true,
    },
  });

  console.log("User info:", user);
  console.log("Following for user ID:", userId);
  console.log(following);

  // Gestion du cas où l'utilisateur n'existe pas
  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
          <div className="w-full max-w-md bg-[#282733] p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl text-white mb-6 text-center">
              Utilisateur introuvable
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
        <div className="w-full max-w-md bg-[#282733] p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl text-white mb-6 text-center">
            Utilisateurs suivis par {user.username}
          </h1>

          <div className="text-white space-y-4">
            {following.length > 0 ? (
              <ul className="space-y-4">
                {following.map(({ users_follows_followeduseridTousers }) => (
                  <li 
                    key={users_follows_followeduseridTousers.id} 
                    className="bg-[#3a3a4a] p-3 rounded-lg shadow"
                  >
                    <Link 
                      href={`/profilePage/${users_follows_followeduseridTousers.id}`} 
                      className="text-blue-400 hover:underline block text-center"
                    >
                      {users_follows_followeduseridTousers.username}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-400 p-8">
                <p>Aucun utilisateur suivi pour le moment</p>
                <p className="text-sm mt-2">{user.username} ne suit personne actuellement</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
