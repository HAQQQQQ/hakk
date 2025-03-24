import { useState } from "react";
import { TextField, Button, Box, Typography, Container, Grid, Paper } from "@mui/material";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

export default function SurveyForm() {
	const { user } = useUser();

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
		onSuccess: () => {
			toast.success("Preferences saved!");
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
			<Paper elevation={3} sx={{ padding: 4, borderRadius: 2, mt: 5 }}>
				<Typography variant="h4" gutterBottom align="center">
					Your Top 3 Favorites
				</Typography>
				<Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
					{["movies", "artists", "hobbies"].map((category) => (
						<Box key={category} sx={{ mb: 3 }}>
							<Typography variant="h6" sx={{ mb: 1 }}>
								{`Top 3 ${category.charAt(0).toUpperCase() + category.slice(1)}`}
							</Typography>
							<Grid container spacing={2}>
								{[0, 1, 2].map((i) => (
									<Grid item xs={12} sm={4} key={i}>
										<TextField
											fullWidth
											label={`${category.slice(0, -1)} ${i + 1}`}
											variant="outlined"
											value={formData[category as keyof typeof formData][i]}
											onChange={(e) =>
												handleChange(category, i, e.target.value)
											}
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
					>
						{isPending ? "Submitting..." : "Submit"}
					</Button>
				</Box>
			</Paper>
		</Container>
	);
}
