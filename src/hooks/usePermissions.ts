import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

const HOST_DOMAIN = 'sixtyoneeighty.net';

export function usePermissions() {
    const { user, isLoaded } = useUser();

    const permissions = useMemo(() => {
        if (!isLoaded || !user) {
            return { canCreateMeeting: false, role: 'user', isLoaded: false };
        }

        // Check metadata role (manual override)
        const metadataRole = (user.publicMetadata?.role as string) || null;

        // Check if user's primary email is from the host domain
        const primaryEmail = user.emailAddresses.find(
            (e) => e.id === user.primaryEmailAddressId
        )?.emailAddress;
        const isHostDomain = primaryEmail?.endsWith(`@${HOST_DOMAIN}`);

        // User can create meetings if they have host/admin role OR host domain email
        const isHost = metadataRole === 'host' || metadataRole === 'admin' || isHostDomain;
        const role = metadataRole || (isHostDomain ? 'host' : 'user');

        return {
            canCreateMeeting: isHost,
            role,
            isLoaded: true,
            email: primaryEmail,
        };
    }, [user, isLoaded]);

    return permissions;
}
