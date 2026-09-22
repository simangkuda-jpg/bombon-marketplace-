import { Link } from 'react-router-dom';
import { Bell, MessageCircle, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur">
      <Link to="/" className="text-lg font-bold text-brand-600">Bombon</Link>

      <div className="hidden flex-1 md:block" />

      <nav className="flex items-center gap-1">
        <Link to="/jual" className="hidden items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 md:flex">
          <Plus size={16} /> Jual Barang
        </Link>
        {user ? (
          <>
            <Link to="/notifikasi" className="rounded-full p-2 text-gray-600 hover:bg-gray-100" aria-label="Notifikasi">
              <Bell size={20} />
            </Link>
            <Link to="/chat" className="rounded-full p-2 text-gray-600 hover:bg-gray-100" aria-label="Chat">
              <MessageCircle size={20} />
            </Link>
            <Link to="/profil" className="ml-1 flex items-center gap-2 rounded-full p-1 hover:bg-gray-100">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="h-8 w-8 rounded-full object-cover" alt={profile.name} />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <UserIcon size={16} className="text-gray-500" />
                </div>
              )}
            </Link>
          </>
        ) : (
          <Link to="/login" className="rounded-full border border-brand-500 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50">
            Masuk
          </Link>
        )}
      </nav>
    </header>
  );
}
