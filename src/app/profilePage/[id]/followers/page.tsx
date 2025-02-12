import { PrismaClient } from '@prisma/client';
import Layout from '@/app/components/Layout';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function FollowersPage({ params }: { params: { id: string } }) {
    const { id } = await Promise.resolve(params);
    const userId = parseInt(id, 10);
  
  const followers = await prisma.follows.findMany({
    where: { followeduserid: userId },
    include: { 
        users_follows_followeduseridTousers: true,
        users_follows_followinguseridTousers: true 
    },
  });

  return (
    <Layout>
      <div className="min-h-screen p-4">
        <h1 className="text-3xl text-white mb-4">{followers[0]?.users_follows_followeduseridTousers.username} Followers</h1>
        <ul className="text-white">
          {followers.map(({ users_follows_followinguseridTousers }) => (
            <li key={users_follows_followinguseridTousers.id}>
              <Link href={`/profilePage/${users_follows_followinguseridTousers.id}`} className="hover:underline">
                {users_follows_followinguseridTousers.username}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
