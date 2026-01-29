import { clerkClient } from '@clerk/nextjs/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const HOST_DOMAIN = 'sixtyoneeighty.net';

// Check if current user is an admin (has admin role or is from host domain)
async function isAdmin() {
    const user = await currentUser();
    if (!user) return false;

    const metadataRole = user.publicMetadata?.role as string | undefined;
    const primaryEmail = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;
    const isHostDomain = primaryEmail?.endsWith(`@${HOST_DOMAIN}`);

    return metadataRole === 'admin' || isHostDomain;
}

// GET: List all users with their roles
export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({ limit: 100 });

    const users = usersResponse.data.map((user) => {
        const primaryEmail = user.emailAddresses.find(
            (e) => e.id === user.primaryEmailAddressId
        )?.emailAddress;
        const isHostDomain = primaryEmail?.endsWith(`@${HOST_DOMAIN}`);
        const metadataRole = (user.publicMetadata?.role as string) || null;

        return {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
            email: primaryEmail,
            imageUrl: user.imageUrl,
            role: metadataRole || (isHostDomain ? 'host (domain)' : 'user'),
            isHostDomain,
            createdAt: user.createdAt,
        };
    });

    return NextResponse.json({ users });
}

// POST: Update a user's role
export async function POST(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
        return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    if (!['host', 'user', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const client = await clerkClient();

    await client.users.updateUser(userId, {
        publicMetadata: { role },
    });

    return NextResponse.json({ success: true, userId, role });
}
