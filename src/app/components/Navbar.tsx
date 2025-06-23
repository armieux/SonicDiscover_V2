'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BsCollectionPlayFill,
  BsFileEarmarkPlusFill,
  BsFilePersonFill
} from 'react-icons/bs';
import { User } from '@/app/interfaces/User';
import { MdOutlineLibraryMusic } from "react-icons/md";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { TbLibraryPlus } from "react-icons/tb";



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
      <nav className="bg-black bg-opacity-90 backdrop-blur-lg p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link
              href="/"
              className="text-2xl font-bold transition-colors duration-300 text-white hover:text-yellow-400"
          >
            Sonic Discover
          </Link>
          <ul className="flex align-middle space-x-8 hover:text-[#1DB954]">
            <li>
              <Link href="/createTrack" className={linkClasses('/createTrack')}>
                <div className="flex items-center">
                  <TbLibraryPlus size={25}/>
                  <p className="pl-1 ">Ajouter</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/musicListPage" className={linkClasses('/musicListPage')}>
                <div className="flex items-center">
                  <MdOutlineLibraryMusic size={25}/>
                  <p className="pl-1">Toutes les musiques</p>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/playlistsPage" className={linkClasses('/playlists')}>
                <div className="flex items-center">
                  <MdOutlineVideoLibrary size={25}/>
                  <p className="pl-1">Playlists</p>
                </div>
              </Link>
            </li>
          </ul>
          <Link
              href={user ? `/profilePage/${user.id}` : '/login'}
              className={linkClasses(user ? `/profile/${user.id}` : '/login')}
          >
            <div className="flex items-center space-x-2">
              <BsFilePersonFill size={25} />
              <span className="text-white">Mon profil</span>
            </div>
          </Link>
        </div>
      </nav>

  );
};

export default Navbar;
