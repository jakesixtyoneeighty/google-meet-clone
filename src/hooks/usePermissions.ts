import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

const HOST_DOMAIN = 'sixtyoneeighty.net';

export function usePermissions() {
    const { user, isLoaded } = useUser();

    const permissions = useMemo(() => {
        // Hydration mismatch protection: only return permissions when fully loaded on client
        if (!isLoaded || !user) {
            return { canCreateMeeting: false, role: 'user', isLoaded: false };
        }

        try {
            // Check metadata role (manual override)
            const metadataRole = (user.publicMetadata?.role as string) || null;

            // Check if user's primary email is from the host domain
            const primaryEmailObj = user.emailAddresses?.find(
                (e) => e.id === user.primaryEmailAddressId
            );

            const primaryEmail = primaryEmailObj?.emailAddress;

            // Ensure primaryEmail is a string before checking
            const isHostDomain = typeof primaryEmail === 'string' && primaryEmail.endsWith(`@${HOST_DOMAIN}`);

            // User can create meetings if they have host/admin role OR host domain email
            const isHost = metadataRole === 'host' || metadataRole === 'admin' || isHostDomain;
            const role = metadataRole || (isHostDomain ? 'host' : 'user');

            return {
                canCreateMeeting: !!isHost,
                role: role || 'user',
                isLoaded: true,
                email: primaryEmail,
            };
        } catch (error) {
            console.error('Error calculating permissions:', error);
            return { canCreateMeeting: false, role: 'user', isLoaded: true };
        }
    }, [user, isLoaded]);

    return permissions;
}
