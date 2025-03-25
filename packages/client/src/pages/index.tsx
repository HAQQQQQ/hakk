import { SignedIn, SignedOut, useSession, useUser } from "@clerk/nextjs";
import SurveyForm from "../components/SurveyForm";
import { useProfile } from "../hooks/useProfile";
import { motion } from "framer-motion";
import WelcomeMessage from "../components/WelcomeMessage";
import { Typography } from "@mui/material";

export default function Home() {
	// Get Clerk session and user details
	const { session } = useSession();
	const { user } = useUser();

	// Use the custom hook to upsert the profile
	useProfile(user, session);

	return (
		<div>
			<main>
				<SignedIn>
					<WelcomeMessage user={user}></WelcomeMessage>
					<SurveyForm />
				</SignedIn>
				{/* Hero Section */}
				<SignedOut>
					<section className="">
						<motion.h1
							initial={{ opacity: 0.2, y: 0 }}
							animate={{ opacity: 1, y: 700 }}
							transition={{ duration: 3 }}
							className="text-4xl text-purple-700 font-bold mb-4"
						>
							<Typography
								variant="h6" // or 'body1', 'subtitle1', etc. depending on size you want
								sx={{
									textAlign: "center",
									fontSize: "30px",
									maxWidth: "100rem",
									mb: 4,
									pl: 3,
									color: "black.100",
									fontWeight: 1000,
									letterSpacing: "0.05em",
									textShadow:
										"0 0 10px rgba(200,200,200,0.6), 0 0 20px rgba(255,255,255,0.3)",
								}}
							>
								Unlock the power of finding love.
							</Typography>
						</motion.h1>
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, delay: 0.3 }}
						>
							<Typography
								variant="h6" // or 'body1', 'subtitle1', etc. depending on size you want
								sx={{
									textAlign: "center",
									fontSize: "30px",
									maxWidth: "100rem",
									mb: 4,
									pl: 3,
									color: "black.100",
									fontWeight: 1000,
									letterSpacing: "0.05em",
									textShadow:
										"0 0 10px rgba(200,200,200,0.6), 0 0 20px rgba(255,255,255,0.3)",
								}}
							>
								Your fitness journey reimagined.
							</Typography>
						</motion.div>

						<div
							style={{
								overflow: "hidden",
								width: "100vw",
								height: "100vh",
								position: "relative",
							}}
						></div>
						<div
							style={{
								overflow: "hidden",
								width: "100vw",
								height: "100vh",
								position: "relative",
							}}
						></div>
					</section>
				</SignedOut>
			</main>
		</div>
	);
}
