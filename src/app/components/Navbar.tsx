'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BsFilePersonFill
} from 'react-icons/bs';
import { User } from '@/app/interfaces/User';
import { MdOutlineLibraryMusic } from "react-icons/md";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { TbLibraryPlus } from "react-icons/tb";
import { FiCompass } from "react-icons/fi";
import { RiHeartPulseFill } from "react-icons/ri";

interface NavbarProps {
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    pathname === path
      ? 'nav-link active flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#F2A365] to-[#D9BF77] text-[#1C1C2E] font-semibold shadow-lg transform scale-105'
      : 'nav-link flex items-center gap-2 px-4 py-3 rounded-xl text-[#F1F1F1] hover:text-[#F2A365] hover:bg-[#3E5C76] hover:bg-opacity-20 transition-all duration-300';

  return (
    <nav className="nav-modern fixed top-0 left-0 right-0 z-50 bg-[#1C1C2E] bg-opacity-95 backdrop-blur-xl border-b border-[#3E5C76] border-opacity-30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-bold bg-gradient-to-r from-[#F2A365] to-[#D9BF77] bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            Sonic Discover
          </Link>

          {/* Navigation principale */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/discover" className={linkClasses('/discover')}>
              <FiCompass size={20}/>
              <span>Découverte</span>
            </Link>
            
            <Link href="/playlistsPage" className={linkClasses('/playlistsPage')}>
              <MdOutlineVideoLibrary size={20}/>
              <span>Playlists</span>
            </Link>

            <Link href="/mood-playlists" className={linkClasses('/mood-playlists')}>
              <RiHeartPulseFill size={20}/>
              <span>Mon Ambiance</span>
            </Link>

            <Link href="/musicListPage" className={linkClasses('/musicListPage')}>
              <MdOutlineLibraryMusic size={20}/>
              <span>Musiques</span>
            </Link>

            <Link href="/createTrack" className={linkClasses('/createTrack')}>
              <TbLibraryPlus size={20}/>
              <span>Ajouter</span>
            </Link>
          </div>

          {/* Profil utilisateur */}
          <Link
            href={user ? `/profilePage/${user.id}` : '/login'}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#2A2A40] hover:bg-[#3E5C76] border border-[#3E5C76] border-opacity-30 hover:border-[#F2A365] hover:border-opacity-50 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F2A365] to-[#D9BF77] flex items-center justify-center">
              <BsFilePersonFill size={16} className="text-[#1C1C2E]" />
            </div>
            <span className="text-[#F1F1F1] font-medium hidden sm:block">
              {user ? user.username || 'Mon profil' : 'Connexion'}
            </span>
          </Link>
        </div>

        {/* Navigation mobile */}
        <div className="md:hidden mt-4 flex justify-center space-x-1">
          <Link href="/createTrack" className={`${linkClasses('/createTrack')} px-3 py-2 text-sm`}>
            <TbLibraryPlus size={18}/>
          </Link>
          
          <Link href="/musicListPage" className={`${linkClasses('/musicListPage')} px-3 py-2 text-sm`}>
            <MdOutlineLibraryMusic size={18}/>
          </Link>
          
          <Link href="/discover" className={`${linkClasses('/discover')} px-3 py-2 text-sm`}>
            <FiCompass size={18}/>
          </Link>
          
          <Link href="/playlistsPage" className={`${linkClasses('/playlistsPage')} px-3 py-2 text-sm`}>
            <MdOutlineVideoLibrary size={18}/>
          </Link>

          <Link href="/mood-playlists" className={`${linkClasses('/mood-playlists')} px-3 py-2 text-sm`}>
            <RiHeartPulseFill size={18}/>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
