import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const SECRET = process.env.STREAM_API_SECRET!;
const MOJO_USER_ID = process.env.MOJO_USER_ID || 'mojo-assistant';

export async function POST() {
    try {
        const client = new StreamClient(API_KEY, SECRET);

        // Create/update Mojo user in Stream
        await client.upsertUsers([
            {
                id: MOJO_USER_ID,
                role: 'admin',
                name: 'Mojo',
                custom: {
                    type: 'ai-assistant',
                    description: 'AI assistant for video room chats',
                },
                // Optional: Add an avatar URL for Mojo
                // image: 'https://your-domain.com/mojo-avatar.png',
            },
        ]);

        return NextResponse.json({
            success: true,
            message: `Mojo user created/updated with ID: ${MOJO_USER_ID}`,
        });
    } catch (error) {
        console.error('Error setting up Mojo:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to set up Mojo' },
            { status: 500 }
        );
    }
}

// GET endpoint. for easy browser testing
export async function GET() {
    return POST();
}
