'use client';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, useUser } from '@clerk/nextjs';
import { customAlphabet } from 'nanoid';
import {
  ErrorFromResponse,
  GetCallResponse,
  StreamVideoClient,
  User,
} from '@stream-io/video-react-sdk';
import Image from 'next/image';
import clsx from 'clsx';
import { Video, Keyboard, Plus } from 'lucide-react';

import { API_KEY, CALL_TYPE } from '@/contexts/MeetProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { AppContext, MEETING_ID_REGEX } from '@/contexts/AppProvider';
import Header from '@/components/Header';
import TextField from '@/components/TextField';
import LearnMoreModal from '@/components/LearnMoreModal';

const generateMeetingId = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 4);
  return `${nanoid(3)}-${nanoid(4)}-${nanoid(3)}`;
};

const GUEST_USER: User = { id: 'guest', type: 'guest' };

const Home = () => {
  const { setNewMeeting } = useContext(AppContext);
  const { isLoaded, isSignedIn } = useUser();
  const { canCreateMeeting } = usePermissions();
  const [code, setCode] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);
  const [error, setError] = useState('');
  const [showLearnMore, setShowLearnMore] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (error) {
      timeout = setTimeout(() => setError(''), 3000);
    }
    return () => clearTimeout(timeout);
  }, [error]);

  const handleNewMeeting = () => {
    setNewMeeting(true);
    router.push(`/${generateMeetingId()}`);
  };

  const handleCode = async () => {
    if (!MEETING_ID_REGEX.test(code)) return;
    setCheckingCode(true);

    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: GUEST_USER,
    });
    const call = client.call(CALL_TYPE, code);

    try {
      const response: GetCallResponse = await call.get();
      if (response.call) {
        router.push(`/${code}`);
        return;
      }
    } catch (e: unknown) {
      let err = e as ErrorFromResponse<GetCallResponse>;
      if (err.status === 404) {
        setError("Couldn't find the session you're trying to join.");
      }
    }
    setCheckingCode(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className={clsx(
        'flex flex-col items-center justify-center px-6 pt-20 pb-32 max-w-7xl mx-auto',
        isLoaded ? 'animate-fade-in' : 'opacity-0'
      )}>
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="flex flex-col items-start text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter leading-tight text-gradient">
                A place to go live <br />
                without <br />
                <span className="text-nj-red">having to wear clothes.</span>
              </h1>
              <p className="text-xl text-nj-grey-400 max-w-lg leading-relaxed">
                NakedJake Live is a small, independent streaming space for the anti-clothing crowd.
                Music, tech, conversations, life, experiments — whatever’s happening right now.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
              {isSignedIn && canCreateMeeting ? (
                <button
                  onClick={handleNewMeeting}
                  className="btn-premium w-full sm:w-auto flex items-center gap-2 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  New Broadcast
                </button>
              ) : isSignedIn ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-nj-grey-900/50 border border-nj-grey-800">
                  <span className="text-nj-grey-400 text-sm">
                    Join stream using a code below
                  </span>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="btn-premium w-full sm:w-auto">Get Started</button>
                </SignInButton>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-4">
                <div className="relative flex-grow sm:w-64">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-nj-grey-500">
                    <Keyboard size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Got an invite or a link? Drop it here."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-nj-grey-900 border border-nj-grey-800 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-nj-red transition-colors text-white placeholder-nj-grey-500"
                  />
                </div>
                <button
                  onClick={handleCode}
                  disabled={!code}
                  className="px-6 py-3 font-semibold text-nj-red hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-nj-grey-800 w-full">
              <p className="text-sm text-nj-grey-500">
                <button
                  onClick={() => setShowLearnMore(true)}
                  className="text-nj-red font-semibold mr-2 hover:text-white transition-colors"
                >
                  Learn more
                </button>
                about the platform.
              </p>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute -inset-4 bg-nj-red/20 blur-3xl rounded-full opacity-50 animate-red-pulse" />
            <div className="glass-card p-2 relative shadow-2xl overflow-hidden border-nj-grey-800">
              <Image
                src="/branding/splash.png"
                alt="NakedJake"
                width={800}
                height={600}
                className="rounded-lg object-cover w-full h-full hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 right-6 glass-card p-6 bg-black/60 border-white/10 backdrop-blur-md">
                <h3 className="text-xl font-bold mb-1 text-white tracking-tight">Chill hangs, Naked people</h3>
                <p className="text-sm text-nj-grey-300">Created for Nudist Online meetups and chats.</p>
              </div>
            </div>
          </div>
        </div>

        <LearnMoreModal open={showLearnMore} onClose={() => setShowLearnMore(false)} />

        {checkingCode && (
          <div className="z-50 fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-nj-red border-t-transparent rounded-full animate-spin" />
              <p className="text-2xl font-bold tracking-tight">Joining Session...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="z-50 fixed bottom-8 left-8 flex items-center animate-slide-up">
            <div className="bg-nj-red text-white px-6 py-4 rounded-lg shadow-premium font-medium flex items-center gap-3 border border-red-500">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {error}
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-6 border-t border-nj-grey-800 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs text-nj-grey-500">
          <p>© 2026 NakedJake. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="mailto:nakedjake@sixtyoneeighty.net" className="hover:text-white transition-colors">Support/Questions?</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
