import { SignedIn, SignedOut, SignInButton, UserButton, useSession, useUser } from "@clerk/nextjs";
import SurveyForm from "../components/SurveyForm";
import { useProfile } from "../hooks/useProfile";

export default function Home() {
	// Get Clerk session and user details
	const { session } = useSession();
	const { user } = useUser();

	// Use the custom hook to upsert the profile
	useProfile(user, session);

	return (
		<div>
			<main
				style={{
					minHeight: "100vh",
					backgroundImage: 'url("/static/anandsHomeland.jpg")',
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			>
				<SignedIn>
					<div style={{ textAlign: "center", marginBottom: "1rem" }}>
						<h2>
							Welcome, {user?.firstName} {user?.lastName}!
						</h2>
						<p>
							Please start by filling out this questionnaire to meet your perfect
							match.
						</p>
					</div>
					<SurveyForm />
				</SignedIn>
			</main>
		</div>
	);
}
