'use client';
import { useEffect, useMemo, useRef, useState, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  CallingState,
  hasScreenShare,
  isPinned,
  RecordCallButton,
  StreamTheme,
  useCall,
  useCallStateHooks,
  useConnectedUser,
  ReactionsButton,
} from '@stream-io/video-react-sdk';
import { Channel } from 'stream-chat';
import { useChatContext } from 'stream-chat-react';
import {
  PhoneOff,
  MessageSquare,
  Users,
  Info,
  ScreenShare,
  MoreVertical,
  Smile,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Type
} from 'lucide-react';
import { Bot } from 'lucide-react';

import CallControlButton from '@/components/CallControlButton';
import CallInfoButton from '@/components/CallInfoButton';
import ChatSidebar from '@/components/ChatSidebar';
import GridLayout from '@/components/GridLayout';
import MeetingPopup from '@/components/MeetingPopup';
import RecordingsPopup from '@/components/RecordingsPopup';
import SpeakerLayout from '@/components/SpeakerLayout';
import ToggleAudioButton from '@/components/ToggleAudioButton';
import ToggleVideoButton from '@/components/ToggleVideoButton';
import useTime from '@/hooks/useTime';

const Meeting = () => {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const call = useCall();
  const user = useConnectedUser();
  const { currentTime } = useTime();
  const { client: chatClient } = useChatContext();
  const { useCallCallingState, useParticipants, useScreenShareState } =
    useCallStateHooks();
  const participants = useParticipants();
  const { screenShare, optimisticIsMute: isSharingMute } = useScreenShareState();
  const callingState = useCallCallingState();

  const [chatChannel, setChatChannel] = useState<Channel>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'mojo'>('chat');
  const [isRecordingListOpen, setIsRecordingListOpen] = useState(false);
  const [participantInSpotlight] = participants;
  const [prevParticipantsCount, setPrevParticipantsCount] = useState(0);

  const isCreator = call?.state.createdBy?.id === user?.id;
  const isUnkownOrIdle =
    callingState === CallingState.UNKNOWN || callingState === CallingState.IDLE;

  useEffect(() => {
    const startup = async () => {
      if (isUnkownOrIdle) {
        router.push(`/${meetingId}`);
      } else if (chatClient) {
        const channel = chatClient.channel('messaging', meetingId);
        setChatChannel(channel);
      }
    };
    startup();
  }, [router, meetingId, isUnkownOrIdle, chatClient]);

  useEffect(() => {
    if (participants.length > prevParticipantsCount) {
      audioRef.current?.play();
      setPrevParticipantsCount(participants.length);
    }
  }, [participants.length, prevParticipantsCount]);

  const isSpeakerLayout = useMemo(() => {
    if (participantInSpotlight) {
      return (
        hasScreenShare(participantInSpotlight) ||
        isPinned(participantInSpotlight)
      );
    }
    return false;
  }, [participantInSpotlight]);

  const leaveCall = async () => {
    await call?.leave();
    router.push(`/${meetingId}/meeting-end`);
  };

  const toggleScreenShare = async () => {
    try {
      await screenShare.toggle();
    } catch (error) {
      console.error(error);
    }
  };

  if (isUnkownOrIdle) return null;

  return (
    <StreamTheme className="root-theme">
      <div className="relative w-screen h-screen bg-black overflow-hidden font-sans">
        <div className="h-[calc(100vh-88px)] w-full">
          {isSpeakerLayout ? <SpeakerLayout /> : <GridLayout />}
        </div>

        {/* Bottom Control Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-nj-grey-950/90 backdrop-blur-xl border-t border-nj-grey-800 px-6 flex items-center justify-between z-10 shadow-premium">

          {/* Left: Meeting Info */}
          <div className="hidden lg:flex items-center gap-4 w-1/4">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-none tracking-tight">{currentTime}</span>
              <span className="text-xs font-medium text-nj-grey-500 mt-1 uppercase tracking-widest">{meetingId}</span>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-3 justify-center flex-1">
            <ToggleAudioButton />
            <ToggleVideoButton />

            <div className="h-8 w-px bg-nj-grey-800 mx-1 hidden sm:block" />

            <CallControlButton
              icon={<Type size={20} />}
              title={'Captions'}
              className="hidden sm:flex"
            />

            <div className="relative group">
              <CallControlButton
                icon={<Smile size={20} />}
                title={'Reactions'}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <div className="glass-card p-2 shadow-red-glow scale-90 origin-bottom">
                  <ReactionsButton />
                </div>
              </div>
            </div>

            <CallControlButton
              onClick={toggleScreenShare}
              icon={<ScreenShare size={20} />}
              title={'Present'}
              active={!isSharingMute}
            />

            <div className="h-10 w-10 flex items-center justify-center [&_button]:!bg-nj-grey-800 [&_button]:!rounded-full hover:[&_button]:!bg-nj-grey-700">
              <RecordCallButton />
            </div>

            <div className="relative hidden sm:block">
              <CallControlButton
                onClick={() => setIsRecordingListOpen(!isRecordingListOpen)}
                icon={<MoreVertical size={20} />}
                title={'More'}
              />
              <RecordingsPopup
                isOpen={isRecordingListOpen}
                onClose={() => setIsRecordingListOpen(false)}
              />
            </div>

            <button
              onClick={leaveCall}
              className="ml-4 h-12 px-6 rounded-full bg-nj-red hover:bg-red-700 text-white flex items-center gap-2 transition-all shadow-red-glow active:scale-95"
              title="Leave Broadcast"
            >
              <PhoneOff size={20} />
              <span className="hidden md:inline font-bold uppercase text-xs tracking-widest">End Session</span>
            </button>
          </div>

          {/* Right: Side Panels */}
          <div className="hidden lg:flex items-center justify-end gap-2 w-1/4">
            <CallInfoButton icon={<Info size={20} />} title="Details" />
            <CallInfoButton icon={<Users size={20} />} title="People" />
            <CallInfoButton
              onClick={() => { setSidebarTab('chat'); setIsSidebarOpen(!isSidebarOpen); }}
              icon={<MessageSquare size={20} />}
              title="Chat"
              active={isSidebarOpen && sidebarTab === 'chat'}
            />
            <CallInfoButton
              onClick={() => { setSidebarTab('mojo'); setIsSidebarOpen(!isSidebarOpen); }}
              icon={<Bot size={20} />}
              title="Mojo"
              active={isSidebarOpen && sidebarTab === 'mojo'}
            />
          </div>
        </div>

        {isCreator && <MeetingPopup />}

        {/* Chat Sidebar */}
        {chatChannel && (
          <ChatSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            channel={chatChannel}
            defaultTab={sidebarTab}
          />
        )}

        <audio
          ref={audioRef}
          src="https://www.gstatic.com/meet/sounds/join_call_6a6a67d6bcc7a4e373ed40fdeff3930a.ogg"
        />
      </div>
    </StreamTheme>
  );
};

export default Meeting;
