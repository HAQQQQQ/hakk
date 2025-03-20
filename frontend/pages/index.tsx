'use client';

import { useEffect } from 'react';
import {
	useSession,
	useUser,
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export default function Home() {
	// Get Clerk session and user details
	const { session } = useSession();
	const { user } = useUser();

	// Create a custom Supabase client that injects the Clerk token into the request headers
	function createClerkSupabaseClient() {
		return createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_KEY!,
			{
				global: {
					fetch: async (url, options = {}) => {
						// Get the Clerk token using your custom JWT template ('supabase')
						const clerkToken = await session?.getToken({
							template: 'supabase',
						});
						const headers = new Headers(options?.headers);
						headers.set('Authorization', `Bearer ${clerkToken}`);
						return fetch(url, { ...options, headers });
					},
				},
			}
		);
	}

	const supabaseClient = createClerkSupabaseClient();

// When the user object becomes available, upsert their profile in Supabase
	useEffect(() => {
		// Ensure a valid user and user.id exist
		if (!user || !user.id) return;

		async function upsertProfile() {
			// First, check if a profile with this user_id already exists
			const { data: existingProfile, error: selectError } = await supabaseClient
				.from('profiles')
				.select('id')
				.eq('user_id', user?.id);

			if (selectError) {
				console.error('Error checking for existing profile:', selectError);
				return;
			}

			// Prepare the profile data
			const profileData = {
				email: user?.primaryEmailAddress?.emailAddress,
				full_name: `${user?.firstName} ${user?.lastName}`,
				avatar_url: user?.imageUrl,
			};

			if (existingProfile && existingProfile.length > 0) {
				// If a profile exists, update it
				const { data, error } = await supabaseClient
					.from('profiles')
					.update(profileData)
					.eq('user_id', user?.id);

				if (error) {
					console.error('Error updating profile:', error);
				} else {
					console.log('Profile updated:', data);
				}
			} else {
				// If no profile exists, create a new one
				const { data, error } = await supabaseClient
					.from('profiles')
					.insert({
						user_id: user?.id, // Set Clerk's user id
						...profileData,
					});

				if (error) {
					console.error('Error creating profile:', error);
				} else {
					console.log('Profile created:', data);
				}
			}
		}

		upsertProfile();
	}, [user, session]);



	return (
		<div>
			<header>
				{/* Show sign-in button if the user is not signed in */}
				<SignedOut>
					<SignInButton />
				</SignedOut>

				{/* Show user button (and sign-out option) if the user is signed in */}
				<SignedIn>
					<UserButton />
				</SignedIn>
			</header>

			<main>
				<h1>Welcome to your Dashboard</h1>
				<p>Your profile is automatically upserted in Supabase.</p>
			</main>
		</div>
	);
}
