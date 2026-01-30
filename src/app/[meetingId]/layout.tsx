'use client';
import { ReactNode } from 'react';
import { useParams } from 'next/navigation';

import MeetProvider from '@/contexts/MeetProvider';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const params = useParams();
  const meetingId = params.meetingId as string;
  
  return <MeetProvider meetingId={meetingId}>{children}</MeetProvider>;
}
