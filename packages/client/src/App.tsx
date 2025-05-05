// src/App.tsx
import axios from "axios";
import { useState, FormEvent, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import { Alert, CircularProgress, Snackbar } from "@mui/material";

// Base API URL - adjust if needed
const API_URL = "http://localhost:3001/api";

const modelOptions = [
	"gpt-3.5-turbo",
	"gpt-3.5-turbo-16k",
	"gpt-4",
	"gpt-4-turbo",
	"gpt-4-32k",
	"gpt-4-vision-preview",
];

function App() {
	const [model, setModel] = useState<string>(modelOptions[0]);
	const [temperature, setTemperature] = useState<number>(0.7);
	const [maxRetries, setMaxRetries] = useState<number>(3);
	const [retryDelay, setRetryDelay] = useState<number>(500);
	const [systemMessage, setSystemMessage] = useState<string>(
		"You are a helpful assistant that responds by calling the provided function.",
	);

	const [loading, setLoading] = useState<boolean>(false);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	// Fetch current configuration on component mount
	useEffect(() => {
		fetchConfiguration();
	}, []);

	const fetchConfiguration = async () => {
		setLoading(true);
		try {
			const response = await axios.get(`${API_URL}/openai/config`);
			const config = response.data.data;
			console.log("--config:", config);

			// Update state with fetched configuration
			setModel(config.model);
			setTemperature(config.temperature);
			setMaxRetries(config.maxRetries);
			setRetryDelay(config.retryDelay);
			setSystemMessage(config.systemMessage || "");

			showSnackbar("Configuration loaded successfully", "success");
		} catch (error) {
			console.error("Error fetching configuration:", error);
			showSnackbar("Failed to load configuration", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Prepare configuration object
			const config = {
				model,
				temperature,
				maxRetries,
				retryDelay,
				systemMessage,
			};

			// Changed from PUT to POST to match controller
			await axios.post(`${API_URL}/openai/config`, config);
			showSnackbar("Settings saved successfully!", "success");
		} catch (error) {
			console.error("Error saving configuration:", error);
			showSnackbar("Failed to save configuration", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async () => {
		setLoading(true);
		try {
			// Send POST request to reset configuration
			const response = await axios.post(`${API_URL}/openai/config/reset`);
			const defaultConfig = response.data.data;

			// Update state with reset configuration
			setModel(defaultConfig.model);
			setTemperature(defaultConfig.temperature);
			setMaxRetries(defaultConfig.maxRetries);
			setRetryDelay(defaultConfig.retryDelay);
			setSystemMessage(defaultConfig.systemMessage || "");

			showSnackbar("Configuration reset to defaults", "success");
		} catch (error) {
			console.error("Error resetting configuration:", error);
			showSnackbar("Failed to reset configuration", "error");
		} finally {
			setLoading(false);
		}
	};

	const showSnackbar = (message: string, severity: "success" | "error") => {
		setSnackbar({
			open: true,
			message,
			severity,
		});
	};

	const handleCloseSnackbar = () => {
		setSnackbar((prev) => ({ ...prev, open: false }));
	};

	return (
		<Container maxWidth="sm">
			<Box textAlign="center" mt={4}>
				<Typography variant="h4" component="h1" gutterBottom>
					OpenAI Service Configuration
				</Typography>
			</Box>

			<Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
				<FormControl fullWidth margin="normal">
					<InputLabel id="model-label">Model</InputLabel>
					<Select
						labelId="model-label"
						value={model}
						label="Model"
						onChange={(e) => setModel(e.target.value as string)}
						disabled={loading}
					>
						{modelOptions.map((m) => (
							<MenuItem key={m} value={m}>
								{m}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<TextField
					fullWidth
					margin="normal"
					label="Temperature"
					type="number"
					inputProps={{ step: 0.1, min: 0, max: 1 }}
					value={temperature}
					onChange={(e) => setTemperature(parseFloat(e.target.value))}
					disabled={loading}
				/>

				<TextField
					fullWidth
					margin="normal"
					label="Max Retries"
					type="number"
					inputProps={{ min: 0 }}
					value={maxRetries}
					onChange={(e) => setMaxRetries(parseInt(e.target.value, 10))}
					disabled={loading}
				/>

				<TextField
					fullWidth
					margin="normal"
					label="Retry Delay (ms)"
					type="number"
					inputProps={{ min: 0 }}
					value={retryDelay}
					onChange={(e) => setRetryDelay(parseInt(e.target.value, 10))}
					disabled={loading}
				/>

				<TextField
					fullWidth
					margin="normal"
					label="Default System Message"
					multiline
					rows={4}
					value={systemMessage}
					onChange={(e) => setSystemMessage(e.target.value)}
					disabled={loading}
				/>

				<Box display="flex" justifyContent="space-between" mt={4}>
					<Button
						variant="outlined"
						color="secondary"
						onClick={handleReset}
						disabled={loading}
					>
						Reset to Defaults
					</Button>

					<Button type="submit" variant="contained" color="primary" disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Save Settings"}
					</Button>
				</Box>
			</Box>

			<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Container>
	);
}

export default App;
