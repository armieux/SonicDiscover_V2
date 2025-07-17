import { PrismaClient } from "@prisma/client";
import PageLayout from "@/app/components/PageLayout";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  // Récupérer les informations de l'utilisateur directement
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profilepicture: true,
      followerscount: true,
    },
  });

  // Récupérer la liste des followers
  const followers = await prisma.follows.findMany({
    where: { followeduserid: userId },
    include: {
      users_follows_followinguseridTousers: true,
    },
  });

  // Gestion du cas où l'utilisateur n'existe pas
  if (!user) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
          <div className="w-full max-w-md bg-[#282733] p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl text-white mb-6 text-center">
              Utilisateur introuvable
            </h1>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
        <div className="w-full max-w-md bg-[#282733] p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl text-white mb-6 text-center">
            Abonnés de {user.username}
          </h1>

          <div className="text-white space-y-4">
            {followers.length > 0 ? (
              <ul className="space-y-4">
                {followers.map(({ users_follows_followinguseridTousers }) => (
                  <li
                    key={users_follows_followinguseridTousers.id}
                    className="bg-[#3a3a4a] p-3 rounded-lg shadow"
                  >
                    <Link
                      href={`/profilePage/${users_follows_followinguseridTousers.id}`}
                      className="text-blue-400 hover:underline block text-center"
                    >
                      {users_follows_followinguseridTousers.username}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-400 p-8">
                <p>Aucun follower pour le moment</p>
                <p className="text-sm mt-2">Soyez le premier à suivre {user.username} !</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
