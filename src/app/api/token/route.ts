import { auth } from '@clerk/nextjs/server';
import { StreamClient } from '@stream-io/node-sdk';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const SECRET = process.env.STREAM_API_SECRET!;

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const client = new StreamClient(API_KEY, SECRET);
  const token = client.generateUserToken({ user_id: userId });

  return Response.json({ userId, token });
}
