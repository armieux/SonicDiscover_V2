'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BsCollectionPlayFill,
  BsFileEarmarkPlusFill,
  BsFilePersonFill
} from 'react-icons/bs';
import { User } from '@/app/interfaces/User'; // or define locally if needed

interface NavbarProps {
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    pathname === path
      ? 'text-yellow-400 font-medium transition duration-300 hover:text-yellow-500'
      : 'text-white font-medium hover:text-yellow-400 transition duration-300';

  return (
    <nav className="bg-gray-900 p-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <Link href="/" className="hover:text-yellow-400 transition duration-300">
            Sonic Discover
          </Link>
        </div>
        <ul className="flex space-x-6">
          <li>
            <Link href="/createTrack" className={linkClasses('/createTrack')}>
              <div className="flex items-center">
                <BsFileEarmarkPlusFill /> <p className="pl-1">Upload</p>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/musicListPage" className={linkClasses('/musicListPage')}>
              <div className="flex items-center">
                <BsFileEarmarkPlusFill /> <p className="pl-1">Musics list</p>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/playlistsPage" className={linkClasses('/playlists')}>
              <div className="flex items-center">
                <BsCollectionPlayFill  /> <p className="pl-1">Playlists</p>
              </div>
            </Link>
          </li>
          <li>
            <Link
              href={user ? `/profilePage/${user.id}` : '/login'}
              className={linkClasses(user ? `/profile/${user.id}` : '/login')}
            >
              <div className="flex items-center">
                <BsFilePersonFill /> <p className="pl-1">Profile</p>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
