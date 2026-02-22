"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasPermission } from "@/lib/permissionUtils";

interface ProtectedPageProps {
	requiredPermissions: string | string[];
	requireAll?: boolean; // If true, user needs ALL permissions. Default: true
	children: React.ReactNode;
	fallback?: React.ReactNode; // What to show if user lacks permissions
}

/**
 * Client-side component to protect pages based on user permissions
 * Redirects to dashboard home if user lacks required permissions
 *
 * Usage:
 * <ProtectedPage requiredPermissions="users.read">
 *   <YourPageContent />
 * </ProtectedPage>
 */
export function ProtectedPage({
	requiredPermissions,
	requireAll = true,
	children,
	fallback,
}: ProtectedPageProps) {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		// Wait for session to load
		if (status === "loading") {
			return;
		}

		// Redirect to login if not authenticated
		if (status === "unauthenticated") {
			router.push("/auth/login");
			return;
		}

		// Check permissions
		const userHasPermission = hasPermission(
			session?.user?.permissions,
			requiredPermissions,
			requireAll,
		);

		if (!userHasPermission) {
			// Redirect to dashboard home if no permission
			router.push("/home");
		}
	}, [session, status, requiredPermissions, requireAll, router]);

	// Show loading state while session is being fetched
	if (status === "loading") {
		return (
			<div className='flex items-center justify-center h-screen'>
				Loading...
			</div>
		);
	}

	// If unauthenticated, don't render content
	if (status === "unauthenticated") {
		return null;
	}

	// Check permissions
	const userHasPermission = hasPermission(
		session?.user?.permissions,
		requiredPermissions,
		requireAll,
	);

	// If user lacks permissions, show fallback or nothing
	if (!userHasPermission) {
		return (
			fallback || (
				<div className='flex items-center justify-center h-screen'>
					<div className='text-center'>
						<h1 className='text-2xl font-bold mb-4'>Access Denied</h1>
						<p className='text-gray-600'>
							You don't have permission to access this page.
						</p>
					</div>
				</div>
			)
		);
	}

	return <>{children}</>;
}
