import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { nanoid } from 'nanoid';
import {
  Call,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  User,
} from '@stream-io/video-react-sdk';
import { User as ChatUser, StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';

import LoadingOverlay from '../components/LoadingOverlay';

type MeetProviderProps = {
  meetingId: string;
  children: React.ReactNode;
};

export const CALL_TYPE = 'default';
export const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY as string;
export const GUEST_ID = `guest_${nanoid(15)}`;

export const tokenProvider = async (userId: string = '') => {
  const response = await fetch('/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: userId || GUEST_ID }),
  });
  const data = await response.json();
  return data.token;
};

const MeetProvider = ({ meetingId, children }: MeetProviderProps) => {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [chatClient, setChatClient] = useState<StreamChat>();
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();

  useEffect(() => {
    if (!isLoaded) return;

    let isCancelled = false;
    setLoading(true);

    const customProvider = async () => tokenProvider(clerkUser?.id);

    let user: User | ChatUser;
    if (isSignedIn && clerkUser) {
      user = {
        id: clerkUser.id,
        name: clerkUser.fullName!,
        image: clerkUser.hasImage ? clerkUser.imageUrl : undefined,
        custom: {
          username: clerkUser?.username,
        },
      };
    } else {
      user = {
        id: GUEST_ID,
        type: 'guest',
        name: 'Guest',
      };
    }

    const _chatClient = StreamChat.getInstance(API_KEY);
    const _videoClient = StreamVideoClient.getOrCreateInstance({
      apiKey: API_KEY,
      user,
      tokenProvider: customProvider,
    });
    const call = _videoClient.call(CALL_TYPE, meetingId);

    const setUpChat = async () => {
      try {
        if (_chatClient.userID && _chatClient.userID !== user.id) {
          await _chatClient.disconnectUser();
        }
        if (!_chatClient.userID) {
          await _chatClient.connectUser(user, customProvider);
        }
        if (isCancelled) return;
        setChatClient(_chatClient);
        setVideoClient(_videoClient);
        setCall(call);
        setLoading(false);
      } catch (error) {
        console.error('Failed to set up Stream clients:', error);
      }
    };

    setUpChat();

    return () => {
      isCancelled = true;
      call.leave().catch(console.error);
      _videoClient.disconnectUser();
      _chatClient.disconnectUser();
    };
  }, [
    clerkUser?.id,
    clerkUser?.fullName,
    clerkUser?.hasImage,
    clerkUser?.imageUrl,
    clerkUser?.username,
    isLoaded,
    isSignedIn,
    meetingId,
  ]);

  if (loading) return <LoadingOverlay />;

  return (
    <Chat client={chatClient!}>
      <StreamVideo client={videoClient!}>
        <StreamCall call={call}>{children}</StreamCall>
      </StreamVideo>
    </Chat>
  );
};

export default MeetProvider;
