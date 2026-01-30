import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { StreamClient } from '@stream-io/node-sdk';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const SECRET = process.env.STREAM_API_SECRET!;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export async function POST(req: Request) {
  const client = new StreamClient(API_KEY, SECRET);

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const body = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;

  switch (eventType) {
    case 'user.created':
    case 'user.updated':
      const newUser = evt.data;

      // Get primary email
      const primaryEmail = newUser.email_addresses.find(
        (e) => e.id === newUser.primary_email_address_id
      )?.email_address;

      // Auto-assign host role for @sixtyoneeighty.net domain
      const isHostDomain = primaryEmail?.endsWith('@sixtyoneeighty.net');
      const metadataRole = newUser.public_metadata?.role as string | undefined;
      const userRole = metadataRole || (isHostDomain ? 'host' : 'user');

      await client.upsertUsers([
        {
          id: newUser.id,
          role: userRole,
          name: `${newUser.first_name} ${newUser.last_name}`,
          custom: {
            username: newUser.username,
            email: primaryEmail,
          },
          image: newUser.has_image ? newUser.image_url : undefined,
        },
      ]);
      break;
    default:
      break;
  }

  return new Response('Webhook processed', { status: 200 });
}
