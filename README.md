# NakedJake Live

A premium video broadcasting and conferencing application built for the modern web. NakedJake Live provides a distinctive, high-performance experience for virtual meetings, real-time collaboration, and community engagement.

## Features

- **User Authentication**: Secure user management using Clerk for both registered users and guests.
- **Meeting Lobby**: Pre-meeting configuration for audio and video settings.
- **Dynamic Video Layouts**: Premium grid and speaker layouts with high-fidelity animations using GSAP.
- **Screen Sharing**: High-resolution screen sharing for presentations and collaboration.
- **Real-time Messaging**: Fully integrated chat functionality using Stream Chat SDK.
- **Advanced SDK Features**: 
  - **Noise Suppression**: AI-powered audio enhancement.
  - **Call Recording**: Cloud recording with easy access.
  - **Live Reactions**: Real-time engagement during broadcasts.
  - **Transcription**: Automated live transcription for accessibility.
- **Premium Design**: A unique, high-contrast aesthetic (Black, White, Red, Grey) that stands out.
- **Responsive Design**: Optimized for all devices and screen sizes.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Stream Account**: [Sign up for Stream](https://getstream.io/)
- **Clerk Account**: [Sign up for Clerk](https://clerk.dev/)

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/nakedjake-live.git
   cd nakedjake-live
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   WEBHOOK_SECRET=your_clerk_webhook_signing_secret
   ```

## Usage

1. **Run Development Server**

   ```bash
   npm run dev
   ```

2. **Access Application**

   Visit `http://localhost:3000` to start your first NakedJake Live session.

## Technologies Used

- **Next.js 15**: Modern React framework.
- **React 19**: Latest React features.
- **Tailwind CSS**: Utility-first styling.
- **GSAP**: Premium animations.
- **Stream Video & Chat SDKs**: Real-time infrastructure.
- **Clerk**: Authentication & User Management.

## License

This project is licensed under the [MIT License](LICENSE).
