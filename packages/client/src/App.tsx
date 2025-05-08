import React from "react";
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from "react-router-dom";
import { ThemeProvider, CssBaseline, createTheme, Box, Link } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Home from "./pages/Home";
import TranscribeLogs from "./pages/TranscribeLogs";
import OpenAIConfig from "./pages/OpenAIConfig";

const theme = createTheme({
	palette: {
		primary: {
			main: "#1976d2",
		},
		secondary: {
			main: "#dc004e",
		},
		background: {
			default: "#f5f5f5", // Light gray background color
		},
	},
	typography: {
		fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
		h1: {
			fontSize: "3.2em",
			lineHeight: 1.1,
		},
		h2: {
			fontSize: "2.2em",
		},
		body1: {
			lineHeight: 1.5,
			fontWeight: 400,
		},
		button: {
			textTransform: "none",
		},
	},
});

const App: React.FC = () => {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Router>
				<AppBar position="static">
					<Toolbar>
						<Typography variant="h6" sx={{ flexGrow: 1 }}>
							<Link component={RouterLink} to="/" color="inherit" underline="none">
								Hakk Admin/Testing Client
							</Link>
						</Typography>
						<Button component={RouterLink} to="/" color="inherit">
							Home
						</Button>
						<Button component={RouterLink} to="/transcribeLogs" color="inherit">
							Transcribe Logs
						</Button>
						<Button component={RouterLink} to="/openAiConfig" color="inherit">
							OpenAI Config
						</Button>
					</Toolbar>
				</AppBar>
				<Box
					className="pages"
					sx={{
						maxWidth: "1900px",
						margin: "0 auto",
						padding: "2rem",
						textAlign: "center",
					}}
				>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/transcribeLogs" element={<TranscribeLogs />} />
						<Route path="/openAiConfig" element={<OpenAIConfig />} />
					</Routes>
				</Box>
			</Router>
		</ThemeProvider>
	);
};

export default App;
