import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

export function SurveyForm() {
	const questions = {
		q1: "1. What's your favorite movie?",
		q2: "2. Who is your favorite actor or actress?",
		q3: "3. What genre of movies do you prefer?",
		q4: "4. What's the last movie you watched?",
		q5: "5. Would you recommend your favorite movie to others?",
	};

	const initialAnswers = Object.keys(questions).reduce((acc, key) => {
		acc[key] = "";
		return acc;
	}, {});

	const [answers, setAnswers] = useState(initialAnswers);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setAnswers((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Submitted answers:", answers);
		// Here you can add additional logic to handle the submitted answers,
		// such as saving them to a database.
	};

	return (
		<Box
			component="form"
			onSubmit={handleSubmit}
			sx={{
				marginTop: "2rem",
				display: "flex",
				flexDirection: "column",
				gap: 2,
				width: "100%",
				maxWidth: 600,
				mx: "auto",
				p: 3,
				border: "1px solid #ccc",
				borderRadius: 2,
				boxShadow: 3,
			}}
		>
			<Typography variant="h6" component="h2" align="center" gutterBottom>
				Dating Survey
			</Typography>
			{Object.entries(questions).map(([key, question]) => (
				<TextField
					key={key}
					label={question}
					variant="outlined"
					name={key}
					value={answers[key]}
					onChange={handleChange}
					required
				/>
			))}
			<Button type="submit" variant="contained" sx={{ mt: 2 }}>
				Submit
			</Button>
		</Box>
	);
}

export default SurveyForm;
