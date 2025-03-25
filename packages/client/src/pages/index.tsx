import { SignedIn, SignedOut, useSession, useUser } from "@clerk/nextjs";
import SurveyForm from "../components/SurveyForm";
import { useProfile } from "../hooks/useProfile";
import { motion } from "framer-motion";

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
					backgroundColor: "lightpink",
					backgroundBlendMode: "lighten",
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
				{/* Hero Section */}
				<SignedOut>
					<section className="">
						<motion.h1
							initial={{ opacity: 0.2, y: 0 }}
							animate={{ opacity: 1, y: 400 }}
							transition={{ duration: 3 }}
							className="text-4xl text-purple-700 font-bold mb-4"
						>
							Unlock the power Of finding love.
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, delay: 0.3 }}
							className="text-xl max-w-2xl text-white mb-8"
						>
							HAKKs integrated solution helps you find that person in the club way
							faster than before.
						</motion.p>
						<div
							style={{
								overflow: "hidden",
								width: "100vw",
								height: "100vh",
								position: "relative",
							}}
						>
							{/*<motion.img*/}
							{/*	src={}*/}
							{/*	alt="Sliding in"*/}
							{/*	initial={{ x: "-100%", scale: 0.2 }}*/}
							{/*	animate={{ x: 0, scale: 0.5 }}*/}
							{/*	transition={{ duration: 1.5, ease: "easeOut" }}*/}
							{/*	style={{ width: "100vw", height: "100vh", objectFit: "cover" }}*/}
							{/*/>*/}
						</div>
						<div
							style={{
								overflow: "hidden",
								width: "100vw",
								height: "100vh",
								position: "relative",
							}}
						>
							<motion.img
								src={roman.src}
								alt="Sliding in"
								initial={{ x: "200%", scale: 0.2 }}
								animate={{ x: 0, scale: 0.5 }}
								transition={{ duration: 1.5, ease: "easeOut" }}
								style={{ width: "100vw", height: "100vh", objectFit: "cover" }}
							/>
						</div>
					</section>
				</SignedOut>
			</main>
		</div>
	);
}
