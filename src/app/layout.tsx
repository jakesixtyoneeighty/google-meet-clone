import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';

import AppProvider from '../contexts/AppProvider';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'stream-chat-react/dist/css/v2/index.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'NakedJake Live',
  description:
    'Premium real-time video broadcasting and meetings. Connect, collaborate, and celebrate with NakedJake Live.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <ClerkProvider
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      >
        <html lang="en">
          <body>{children}</body>
        </html>
      </ClerkProvider>
    </AppProvider>
  );
}
