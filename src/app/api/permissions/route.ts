import { auth, currentUser } from '@clerk/nextjs/server';

const HOST_DOMAIN = 'sixtyoneeighty.net';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { canCreateMeeting: false, role: 'guest' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return Response.json(
        { canCreateMeeting: false, role: 'guest' },
        { status: 401 }
      );
    }

    // Check if user has host role in metadata (manual override)
    const metadataRole = user.publicMetadata?.role as string | undefined;

    // Check if user's primary email is from the host domain
    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;
    const isHostDomain = primaryEmail?.endsWith(`@${HOST_DOMAIN}`);

    // User is host if they have the role in metadata OR have the host domain email
    const isHost =
      metadataRole === 'host' || metadataRole === 'admin' || isHostDomain;
    const role = metadataRole || (isHostDomain ? 'host' : 'user');

    return Response.json({
      canCreateMeeting: isHost,
      role,
      email: primaryEmail,
    });
  } catch (error) {
    console.error('Permissions check failed:', error);
    return Response.json(
      { canCreateMeeting: false, role: 'guest' },
      { status: 500 }
    );
  }
}
