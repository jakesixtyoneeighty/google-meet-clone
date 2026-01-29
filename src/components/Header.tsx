import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import {
  Settings,
  HelpCircle,
  MessageSquareWarning,
  LayoutGrid,
  ChevronDown,
  Shield
} from 'lucide-react';

import Avatar from './Avatar';
import IconButton from './IconButton';
import PlainButton from './PlainButton';
import useTime from '../hooks/useTime';
import { usePermissions } from '../hooks/usePermissions';

interface HeaderProps {
  navItems?: boolean;
}

const Header = ({ navItems = true }: HeaderProps) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { canCreateMeeting } = usePermissions();
  const { currentDateTime } = useTime();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-black border-b border-nj-grey-800 shadow-premium">
      <div className="flex items-center gap-8">
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-40 group-hover:scale-105 transition-transform">
            <Image
              src="/branding/mainlogo.png"
              alt="NakedJake Live"
              fill
              className="object-contain"
              priority
            />
          </div>
        </a>
      </div>

      <div className="flex items-center gap-4">
        {navItems && (
          <>
            <div className="hidden md:block mr-4 text-sm font-medium text-nj-grey-400 select-none">
              {currentDateTime}
            </div>
            <div className="hidden sm:flex items-center gap-2 border-r border-nj-grey-800 pr-4">
              {canCreateMeeting && (
                <Link href="/admin" title="Admin Panel">
                  <IconButton title="Admin Panel" icon={<Shield size={20} />} />
                </Link>
              )}
              <IconButton title="Support" icon={<HelpCircle size={20} />} />
              <IconButton title="Report a problem" icon={<MessageSquareWarning size={20} />} />
              <IconButton title="Settings" icon={<Settings size={20} />} />
            </div>
          </>
        )}

        <div className="flex items-center gap-4 pl-2">
          {navItems && (
            <div className="hidden sm:block">
              <IconButton title="Apps" icon={<LayoutGrid size={20} />} />
            </div>
          )}
          <div
            className={clsx(
              'flex items-center gap-3',
              isLoaded ? 'animate-fade-in' : 'opacity-0'
            )}
          >
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                {!navItems && (
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-white leading-tight">{user.fullName}</div>
                    <div className="text-xs text-nj-grey-400 leading-tight">{email}</div>
                  </div>
                )}
                <div className="relative group">
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-nj-grey-800 group-hover:border-nj-red transition-colors">
                    <UserButton afterSignOutUrl="/" />
                    <div className="absolute inset-0 pointer-events-none">
                      <Avatar
                        participant={{
                          name: user?.fullName,
                          image: user.hasImage ? user.imageUrl : undefined,
                        }}
                        width={40}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="btn-premium py-2 px-6 text-sm">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
