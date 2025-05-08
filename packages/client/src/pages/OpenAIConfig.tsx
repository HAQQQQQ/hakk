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

export const modelOptions: string[] = [
	/**
	 * ❌ Does NOT support structured outputs
	 * - Standard GPT-3.5 Turbo model
	 * - Good for general chat/completions
	 * - Cheaper than GPT-4 models
	 * - 4K context window
	 * - Use with function calling instead of structured outputs
	 */
	"gpt-3.5-turbo",

	/**
	 * ❌ Does NOT support structured outputs
	 * - GPT-3.5 with larger context window (16K tokens)
	 * - Better for longer conversations or documents
	 * - More expensive than standard 3.5
	 * - Use with function calling instead
	 */
	"gpt-3.5-turbo-16k",

	/**
	 * ❌ Does NOT support structured outputs
	 * - Original GPT-4 model
	 * - 8K context window
	 * - Very capable but expensive
	 * - Slower than newer models
	 * - Consider using GPT-4 Turbo instead
	 */
	"gpt-4",

	/**
	 * ✅ SUPPORTS structured outputs
	 * - Latest GPT-4 Turbo with structured output support
	 * - 128K context window
	 * - Good for complex reasoning tasks
	 * - More expensive than GPT-4o
	 * - Knowledge cutoff: April 2024
	 * - Recommended for complex trading analysis
	 */
	"gpt-4-turbo",

	/**
	 * ✅ SUPPORTS structured outputs (RECOMMENDED)
	 * - OpenAI's latest "omni" model
	 * - Best performance-to-cost ratio
	 * - 128K context window
	 * - Faster than GPT-4 Turbo
	 * - Knowledge cutoff: October 2023
	 * - Ideal for production APIs with structured output needs
	 * - BEST CHOICE for trading sentiment analysis
	 */
	"gpt-4o",

	/**
	 * ✅ SUPPORTS structured outputs
	 * - Smaller, cheaper version of GPT-4o
	 * - Good for simpler tasks
	 * - 128K context window
	 * - Much cheaper than full models
	 * - May be less accurate for complex psychology analysis
	 * - Good for development/testing environments
	 */
	"gpt-4o-mini",

	/**
	 * ❌ Does NOT support structured outputs
	 * - GPT-4 with 32K context window
	 * - More expensive than newer models
	 * - Consider using GPT-4 Turbo instead
	 * - Being phased out by OpenAI
	 */
	"gpt-4-32k",

	/**
	 * ❌ Does NOT support structured outputs
	 * - Specialized for vision/image analysis
	 * - Not suitable for pure text trading analysis
	 * - Cannot process structured output formats
	 * - Use only if you need image analysis capabilities
	 */
	"gpt-4-vision-preview",
];

function OpenAIConfig() {
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

export default OpenAIConfig;
