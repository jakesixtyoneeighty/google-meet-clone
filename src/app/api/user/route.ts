import { auth } from '@clerk/nextjs/server';
import { StreamClient } from '@stream-io/node-sdk';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const SECRET = process.env.STREAM_API_SECRET!;

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const user = body?.user;

  if (!user) {
    return new Response('Missing user data', { status: 400 });
  }

  if (user.id !== userId) {
    return new Response('Forbidden', { status: 403 });
  }

  const client = new StreamClient(API_KEY, SECRET);

  const response = await client.updateUsersPartial({
    users: [
      {
        id: user.id,
        set: {
          name: user.name,
          role: 'user',
        },
      },
    ],
  });

  return Response.json(response);
}
