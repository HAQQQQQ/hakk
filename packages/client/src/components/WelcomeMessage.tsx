import { motion } from "framer-motion";

export default function WelcomeMessage({ user }) {
	return (
		<div
			style={{
				paddingTop: "20px",
				textAlign: "center",
				marginBottom: "2rem",
				fontFamily: `'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif`,
				color: "#2c3e50",
			}}
		>
			<motion.h1
				initial={{ x: -100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				style={{
					fontSize: "2.5rem",
					fontWeight: 700,
					marginBottom: "0.5rem",
					letterSpacing: "-0.5px",
				}}
			>
				Welcome, {user?.firstName} {user?.lastName}!
			</motion.h1>

			<motion.p
				initial={{ x: 100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
				style={{
					fontSize: "1.25rem",
					fontWeight: 400,
					color: "#34495e",
					maxWidth: "600px",
					margin: "0 auto",
					lineHeight: 1.6,
				}}
			>
				Please fill out the Survey below. It'll make your dreams come true.
			</motion.p>
		</div>
	);
}
