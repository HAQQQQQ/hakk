'use client';

import { useEffect, useState } from "react";
import { Box, TextField, Button, Typography } from '@mui/material';
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
			<header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem' }}>
				{/* Show sign-in button if the user is not signed in */}
				<SignedOut>
					<SignInButton />
				</SignedOut>

				{/* Show user button (and sign-out option) if the user is signed in */}
				<SignedIn>
					<UserButton />
				</SignedIn>
			</header>

			<body>
				<SignedIn>
					<div style={{ textAlign: 'center', marginBottom: '1rem' }}>
						<h2>
							Welcome, {user?.firstName} {user?.lastName}!
						</h2>
						<p>
							Please start by filling out this questionnaire to meet your perfect match.
						</p>
					</div>
					<SurveyForm />
				</SignedIn>
			</body>
		</div>
	);
}

function SurveyForm() {
	const [answers, setAnswers] = useState({
		q1: '',
		q2: '',
		q3: '',
		q4: '',
		q5: '',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setAnswers((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log('Submitted answers:', answers);
		// Here you can add additional logic to handle the submitted answers,
		// such as saving them to Supabase.
	};

	return (
		<Box
			component="form"
			onSubmit={handleSubmit}
			sx={{
				marginTop: '2rem',
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				width: '100%',
				maxWidth: 600,
				mx: 'auto',
				p: 3,
				border: '1px solid #ccc',
				borderRadius: 2,
				boxShadow: 3,
			}}
		>
			<Typography variant="h6" component="h2" align="center" gutterBottom>
				Dating Survey
			</Typography>
			<TextField
				label="1. What's your favorite movie?"
				variant="outlined"
				name="q1"
				value={answers.q1}
				onChange={handleChange}
				required
			/>
			<TextField
				label="2. Who is your favorite actor or actress?"
				variant="outlined"
				name="q2"
				value={answers.q2}
				onChange={handleChange}
				required
			/>
			<TextField
				label="3. What genre of movies do you prefer?"
				variant="outlined"
				name="q3"
				value={answers.q3}
				onChange={handleChange}
				required
			/>
			<TextField
				label="4. What's the last movie you watched?"
				variant="outlined"
				name="q4"
				value={answers.q4}
				onChange={handleChange}
				required
			/>
			<TextField
				label="5. Would you recommend your favorite movie to others?"
				variant="outlined"
				name="q5"
				value={answers.q5}
				onChange={handleChange}
				required
			/>
			<Button type="submit" variant="contained" sx={{ mt: 2 }}>
				Submit
			</Button>
		</Box>
	);
}
