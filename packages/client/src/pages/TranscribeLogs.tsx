// TranscribeLogs.tsx
import React, { useState } from "react";
import {
	Box,
	Typography,
	Container,
	TextField,
	Button,
	CircularProgress,
	Paper,
	Snackbar,
	Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios, { AxiosError } from "axios";

interface ApiResponse {
	// Add your TradingSentimentAnalysis type interface here
	[key: string]: any;
}

const TranscribeLogs: React.FC = () => {
	const [logText, setLogText] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [response, setResponse] = useState<ApiResponse | null>(null);
	const [error, setError] = useState<string>("");
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
	const [submitTime, setSubmitTime] = useState<number>(0);

	// Replace with your actual server endpoint URL
	const SERVER_ENDPOINT = "http://localhost:3001/api/transcription/transcribe";

	const handleSubmit = async () => {
		if (!logText.trim()) {
			setError("Please enter some logs to transcribe");
			setSnackbarOpen(true);
			return;
		}

		setLoading(true);
		setError("");
		setResponse(null);

		const startTime = Date.now();

		try {
			const response = await axios.post<ApiResponse>(
				SERVER_ENDPOINT,
				{
					logs: logText,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					// timeout: 30000, // 30 second timeout
				},
			);

			const endTime = Date.now();

			setSubmitTime(endTime - startTime);
			setResponse(response.data);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				// Handle axios-specific errors
				if (err.response) {
					// Server responded with error status
					setError(`Server error: ${err.response.status} - ${err.response.statusText}`);
				} else if (err.request) {
					// Request was made but no response received
					setError("No response from server. Please check your connection.");
				} else {
					// Something else happened
					setError(`Request error: ${err.message}`);
				}
			} else {
				// Non-axios error
				setError(err instanceof Error ? err.message : "An unexpected error occurred");
			}
			setSnackbarOpen(true);
		} finally {
			setLoading(false);
		}
	};

	const handleClear = () => {
		setLogText("");
		setResponse(null);
		setError("");
		setSubmitTime(0);
	};

	return (
		<Container maxWidth="lg">
			<Box mt={4} textAlign="center">
				<Typography variant="h3" component="h1" gutterBottom>
					Transcribe Logs
				</Typography>

				<Paper elevation={3} sx={{ mt: 4, p: 3 }}>
					<Box mb={3}>
						<TextField
							fullWidth
							multiline
							rows={12}
							variant="outlined"
							placeholder="Paste your trading logs here..."
							value={logText}
							onChange={(e) => setLogText(e.target.value)}
							disabled={loading}
							sx={{
								mb: 2,
								"& .MuiInputBase-input": {
									fontFamily: "monospace",
									fontSize: "14px",
								},
							}}
						/>

						<Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
							<Button
								variant="contained"
								color="primary"
								onClick={handleSubmit}
								disabled={loading || !logText.trim()}
								startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
								size="large"
							>
								{loading ? "Processing..." : "Submit Logs"}
							</Button>

							<Button
								variant="outlined"
								onClick={handleClear}
								disabled={loading}
								size="large"
							>
								Clear
							</Button>
						</Box>

						{loading && (
							<Box
								sx={{
									mt: 2,
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
								}}
							>
								<CircularProgress />
								<Typography variant="caption" sx={{ mt: 1 }}>
									Processing your logs...
								</Typography>
							</Box>
						)}

						{submitTime > 0 && !loading && (
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 1, display: "block" }}
							>
								Response received in {submitTime}ms
							</Typography>
						)}
					</Box>

					{response && (
						<Box mt={4}>
							<Typography variant="h6" gutterBottom>
								Analysis Results:
							</Typography>
							<Paper
								elevation={1}
								sx={{
									p: 2,
									bgcolor: "grey.50",
									maxHeight: "400px",
									overflow: "auto",
								}}
							>
								<pre
									style={{
										margin: 0,
										whiteSpace: "pre-wrap",
										fontFamily: "monospace",
										fontSize: "14px",
									}}
								>
									{JSON.stringify(response, null, 2)}
								</pre>
							</Paper>
						</Box>
					)}
				</Paper>
			</Box>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={() => setSnackbarOpen(false)}
			>
				<Alert
					onClose={() => setSnackbarOpen(false)}
					severity="error"
					sx={{ width: "100%" }}
				>
					{error}
				</Alert>
			</Snackbar>
		</Container>
	);
};

export default TranscribeLogs;
