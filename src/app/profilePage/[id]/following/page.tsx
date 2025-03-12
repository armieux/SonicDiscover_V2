import { PrismaClient } from '@prisma/client';
import Layout from '@/app/components/Layout';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function FollowersPage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);
    const userId = parseInt(id, 10);
  
  const followers = await prisma.follows.findMany({
    where: { followinguserid: userId },
    include: { 
        users_follows_followeduseridTousers: true,
        users_follows_followinguseridTousers: true 
    },
  });

  return (
    <Layout>
  <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-[#353445] p-4">
    <div className="w-full max-w-md bg-[#282733] p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl text-white mb-6 text-center">
        Users followed by {followers[0]?.users_follows_followeduseridTousers.username}
      </h1>

      <ul className="text-white space-y-4">
        {followers.map(({ users_follows_followeduseridTousers }) => (
          <li key={users_follows_followeduseridTousers.id} className="bg-[#3a3a4a] p-3 rounded-lg shadow">
            <Link 
              href={`/profilePage/${users_follows_followeduseridTousers.id}`} 
              className="text-blue-400 hover:underline block text-center"
            >
              {users_follows_followeduseridTousers.username}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
</Layout>

  );
}
