import { useState } from "react";
import { TextField, Button, Box, Typography, Container, Grid, Paper } from "@mui/material";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function SurveyForm() {
	const { user } = useUser();

	/*
	Build an interactive 3x3 preference selector:

	- Auto-select 3 artists, 3 music genres, and 3 hobbies using ChatGPT
	- Display them visually using circular image cards (sourced dynamically)
	- Prompt the user to select the most relevant option from each row
	  - Add a 3-second timer per selection
	- Based on each user choice, fetch and display related images for the next round
	- Once the 3x3 grid is finalized through selections, enable a final "Submit" action
	*/

	/*
	Build an interactive 3x3 preference selector:

	- Auto-select 3 artists, 3 music genres, and 3 hobbies using ChatGPT
	- Display them visually using circular image cards (sourced dynamically)
	- Prompt the user to select the most relevant option from each row
	  - Add a 3-second timer per selection
	- Based on each user choice, fetch and display related images for the next round
	- Once the 3x3 grid is finalized through selections, enable a final "Submit" action
	*/

	const [formData, setFormData] = useState({
		movies: ["Inception", "Spirited Away", "The Matrix"],
		artists: ["Taylor Swift", "Kendrick Lamar", "Adele"],
		hobbies: ["Hiking", "Painting", "Chess"],
	});

	const handleChange = (category: string, index: number, value: string) => {
		setFormData((prev) => ({
			...prev,
			[category]: prev[category].map((item, i) => (i === index ? value : item)),
		}));
	};

	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	const savePreferences = async () => {
		const payload = {
			userId: user?.id,
			preference: formData,
		};

		const response = await fetch(`${apiUrl}/api/preferences`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || "Failed to save preferences.");
		}

		return response.json();
	};

	const { mutate, isPending } = useMutation({
		mutationFn: savePreferences,
		onSuccess: (data) => {
			toast.success("Preferences saved!");
			console.log(data);
		},
		onError: (error: any) => {
			toast.error("Error:", error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		mutate();
	};

	return (
		<Container maxWidth="sm">
			<motion.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				<Paper
					elevation={6}
					sx={{
						padding: 4,
						borderRadius: "32px",
						mt: 5,
						background: "rgba(255, 255, 255, 0.15)",
						backdropFilter: "blur(16px)",
						border: "1px solid rgba(255, 255, 255, 0.2)",
						boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
						transition: "transform 0.3s ease-in-out",
						"&:hover": {
							transform: "scale(1.01)",
						},
					}}
				>
					<Typography
						variant="h3"
						gutterBottom
						align="center"
						sx={{
							fontWeight: 800,
							letterSpacing: "3px",
							textTransform: "uppercase",
							color: "#ffffff",
							fontSize: {
								xs: "2rem",
								sm: "2.75rem",
								md: "3.5rem",
							},
							textShadow: `
									  0 0 10px #4f83cc,
									  0 0 20px #4f83cc,
									  0 0 40px #4f83cc,
									  0 0 80px #4f83cc
									`,
							animation: "grandPulse 3s ease-in-out infinite",
							"@keyframes grandPulse": {
								"0%": {
									textShadow: `
									  0 0 10px #4f83cc,
									  0 0 20px #4f83cc,
									  0 0 40px #4f83cc,
									  0 0 80px #4f83cc
									`,
									transform: "scale(1)",
								},
								"50%": {
									textShadow: `
									  0 0 20px #82b1ff,
									  0 0 40px #82b1ff,
									  0 0 80px #82b1ff,
									  0 0 120px #82b1ff
									`,
									transform: "scale(1.02)",
								},
								"100%": {
									textShadow: `
									  0 0 10px #4f83cc,
									  0 0 20px #4f83cc,
									  0 0 40px #4f83cc,
									  0 0 80px #4f83cc
									`,
									transform: "scale(1)",
								},
							},
						}}
					>
						Your Top 3 Favorites
					</Typography>

					<Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
						{["movies", "artists", "hobbies"].map((category) => (
							<Box key={category} sx={{ mb: 5 }}>
								<Typography
									variant="h5"
									sx={{
										mb: 2,
										fontWeight: 700,
										textAlign: "center",
										textTransform: "uppercase",
										letterSpacing: "2px",
										color: "#ffffff",
										textShadow: `
												  0 0 5px #4f83cc,
												  0 0 10px #4f83cc,
												  0 0 20px #4f83cc,
												  0 0 40px #4f83cc
												`,
										animation: "pulseGlow 2.5s ease-in-out infinite",
										fontSize: {
											xs: "1.5rem",
											sm: "1.75rem",
											md: "2rem",
										},
										"@keyframes pulseGlow": {
											"0%": {
												textShadow: `
												  0 0 5px #4f83cc,
												  0 0 10px #4f83cc,
												  0 0 20px #4f83cc,
												  0 0 40px #4f83cc
        `,
											},
											"50%": {
												textShadow: `
												  0 0 10px #82b1ff,
												  0 0 20px #82b1ff,
												  0 0 30px #82b1ff,
												  0 0 50px #82b1ff
												`,
											},
											"100%": {
												textShadow: `
												  0 0 5px #4f83cc,
												  0 0 10px #4f83cc,
												  0 0 20px #4f83cc,
												  0 0 40px #4f83cc
        `,
											},
										},
									}}
								>
									{`${category.charAt(0).toUpperCase() + category.slice(1)}`}
								</Typography>

								<Grid container spacing={2}>
									{[0, 1, 2].map((i) => (
										<Grid item xs={12} sm={4} key={i}>
											<TextField
												fullWidth
												variant="outlined"
												value={
													formData[category as keyof typeof formData][i]
												}
												onChange={(e) =>
													handleChange(category, i, e.target.value)
												}
												sx={{
													"& .MuiOutlinedInput-root": {
														borderRadius: "50px",
														backgroundColor: "rgba(255, 255, 255, 0.3)",
														backdropFilter: "blur(10px)",
														paddingLeft: "18px",
														transition: "all 0.3s ease-in-out",
														boxShadow:
															"0 0 15px 3px rgba(100, 200, 255, 0.25)",
														"& fieldset": {
															borderColor: "#d1e0ff",
														},
														"&:hover fieldset": {
															borderColor: "#a3c4f3",
														},
														"&.Mui-focused fieldset": {
															borderColor: "#4f83cc",
															boxShadow: "0 0 5px #4f83cc",
														},
														"&:focus-within": {
															transform: "scale(1.03)",
														},
													},
													"& .MuiInputLabel-root": {
														color: "#4f83cc",
														fontWeight: 500,
													},
													"& label.Mui-focused": {
														color: "#4f83cc",
													},
												}}
											/>
										</Grid>
									))}
								</Grid>
							</Box>
						))}

						<Button
							type="submit"
							variant="contained"
							color="primary"
							fullWidth
							disabled={isPending}
							sx={{
								mt: 3,
								py: 1.5,
								fontWeight: "bold",
								fontSize: "1rem",
								borderRadius: "30px",
								background: "linear-gradient(to right, #4f83cc, #3f51b5)",
								boxShadow: "0 4px 20px rgba(63, 81, 181, 0.3)",
								"&:hover": {
									background: "linear-gradient(to right, #3f51b5, #4f83cc)",
									transform: "scale(1.01)",
								},
							}}
						>
							{isPending ? "Submitting..." : "Submit"}
						</Button>
					</Box>
				</Paper>
			</motion.div>
		</Container>
	);
}
