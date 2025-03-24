import { SignedIn, SignedOut, SignInButton, UserButton, useSession, useUser } from "@clerk/nextjs";
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
					backgroundImage: 'url("/assets/anandsHomeland.jpg")',
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
					{/* Hero Section */}
					<section className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
						<motion.h1
							initial={{ opacity: 0, y: 60 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-5xl font-bold mb-4"
						>
							Unlock the power{" "}
							<span className="text-purple-300">Of finding love.</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, delay: 0.3 }}
							className="text-xl max-w-2xl text-white mb-8"
						>
							HAKK's integrated solution helps you find that person in the club way
							faster than before.
						</motion.p>
					</section>

					{/* Feature Section */}
					<section className="min-h-screen px-6 py-20 bg-white">
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="max-w-3xl mx-auto text-center"
						>
							<h2 className="text-4xl font-bold mb-4">
								Powerful Automation of Ice Breaking
							</h2>
							<p className="text-lg text-gray-600 mb-10">
								Break ice, get crunk with strangers with your favorite tools, and
								get more done with less effort.
							</p>
							<img
								src=""
								alt="Automation"
								className="rounded-xl shadow-md mb-6 mx-auto"
							/>
							<img
								src=""
								alt="Dashboard"
								className="rounded-xl shadow-md mb-6 mx-auto"
							/>
						</motion.div>
					</section>

					{/* Benefits Section */}
					<section className="min-h-screen px-6 py-20 bg-gray-50">
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="max-w-4xl mx-auto text-center"
						>
							<h2 className="text-4xl font-bold mb-4">Built for Teams</h2>
							<p className="text-lg text-gray-600 mb-10">
								Collaborate efficiently with tools made for seamless team
								communication.
							</p>
							<img
								src=""
								alt="Team Collaboration"
								className="rounded-xl shadow-md mb-6 mx-auto"
							/>
							<img
								src=""
								alt="Office Team"
								className="rounded-xl shadow-md mb-6 mx-auto"
							/>
						</motion.div>
					</section>

					{/* CTA Section */}
					<section className="min-h-screen bg-gray-100 px-6 py-20">
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="max-w-xl mx-auto text-center bg-white p-10 rounded-xl shadow-lg"
						>
							<h3 className="text-3xl font-semibold mb-4">Get Started Today</h3>
							<p className="text-gray-600 mb-6">
								Start your 14-day free trial and see the difference for yourself.
							</p>
							<img src="" alt="Sign Up" className="rounded-xl shadow mb-6 mx-auto" />
						</motion.div>
					</section>
				</SignedOut>
			</main>
		</div>
	);
}
