import React from "react";
import { motion } from "framer-motion";
import Typography from "@mui/material/Typography";

// Create a motion-enhanced Typography component
const MotionTypography = motion(Typography);

// Define common styles for Typography components
const commonTypographyStyle = {
	textAlign: "center",
	fontSize: "30px",
	maxWidth: "100rem",
	mb: 4,
	pl: 3,
	color: "#000", // Using a hex code for a standard black color
	fontWeight: 1000,
	letterSpacing: "0.05em",
	textShadow: "0 0 10px rgba(200,200,200,0.6), 0 0 20px rgba(255,255,255,0.3)",
};

const LandingPage = () => {
	return (
		<section className="landing-page">
			{/* Main Heading */}
			<MotionTypography
				variant="h1"
				sx={commonTypographyStyle}
				initial={{ opacity: 0.2, y: 0 }}
				animate={{ opacity: 1, y: 500 }}
				transition={{ duration: 3 }}
			>
				Unlock the power of finding love.
			</MotionTypography>

			{/* Banner Images Container */}
			<motion.div
				className="banner-container"
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				style={{
					display: "flex",
					justifyContent: "center",
					overflow: "hidden",
					marginBottom: "1rem",
					position: "relative", // Required for absolute positioning of the overlay
				}}
			>
				<motion.img
					src="/assets/bluesky.png"
					alt="Banner Left"
					initial={{ x: "-100%", scale: 0.8 }}
					animate={{ x: 0, scale: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					style={{ width: "50%", objectFit: "cover" }}
				/>
				<motion.img
					src="/assets/purplesky.png"
					alt="Banner Right"
					initial={{ x: "100%", scale: 0.8 }}
					animate={{ x: 0, scale: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					style={{ width: "50%", objectFit: "cover" }}
				/>

				{/* Blur Overlay at the Intersection */}
				<div
					style={{
						position: "absolute",
						top: 0,
						bottom: 0, // Ensures the overlay is contained within the parent's height
						left: "50%",
						transform: "translateX(-50%)",
						width: "50px", // adjust width as needed
						backdropFilter: "blur(10px)",
						WebkitBackdropFilter: "blur(10px)",
						pointerEvents: "none", // ensures the overlay doesn't block interactions
					}}
				></div>
			</motion.div>

			{/* Secondary Message */}
			<MotionTypography
				variant="h2"
				sx={commonTypographyStyle}
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1, delay: 0.3 }}
			>
				Your fitness journey reimagined.
			</MotionTypography>
		</section>
	);
};

export default LandingPage;
