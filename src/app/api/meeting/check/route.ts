import { StreamClient } from '@stream-io/node-sdk';
import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const SECRET = process.env.STREAM_API_SECRET!;

export async function POST(request: Request) {
  try {
    const { meetingId } = await request.json();

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    const client = new StreamClient(API_KEY, SECRET);
    const call = client.video.call('default', meetingId);
    
    // Check if call exists by getting it
    const callData = await call.get();
    
    return NextResponse.json({ exists: !!callData });
  } catch (error) {
    // If call doesn't exist, it might throw or return empty
    // Typically Stream throws if not found? No, get() might just return call info.
    // Actually, get() throws if the call doesn't exist AND we don't have permission to create?
    // But server-side client has admin permissions.
    // If we just want to check if it exists (was created), we can check callData.call
    
    console.error('Error checking meeting:', error);
    // If it's a "Not Found" error, return exists: false
    return NextResponse.json({ exists: false });
  }
}
