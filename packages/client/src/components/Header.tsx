// components/Header.tsx
"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Box, AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

export default function Header() {
	return (
		<AppBar
			position="static"
			sx={{
				background: "linear-gradient(to right, #000000, #808080)",
				color: "white",
				borderBottomLeftRadius: "16px",
				borderBottomRightRadius: "16px",
				borderTopLeftRadius: 0,
				borderTopRightRadius: 0,
				m: 0, // removes all margins
				width: "100%",
				boxShadow: 4,
			}}
		>
			<Container maxWidth="lg">
				<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
					<Typography
						variant="h6"
						component="div"
						sx={{
							fontWeight: "bold",
							color: "linear-gradient(to right, #00C9FF, #92FE9D)",
							background: "linear-gradient(to right, #00C9FF, #92FE9D)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
					>
						HAKK: The Project
					</Typography>
					<Box>
						<SignedOut>
							<SignInButton mode="modal">
								<Button
									variant="outlined"
									startIcon={<LoginIcon />}
									sx={{
										borderColor: "#00FFAA",
										color: "#00FFAA",
										fontWeight: 600,
										fontFamily: "Roboto, sans-serif",
										textTransform: "none",
										px: 3,
										py: 1,
										borderRadius: "10px",
										boxShadow: "0 2px 6px rgba(0, 255, 170, 0.2)",
										transition: "0.3s ease",
										"&:hover": {
											background:
												"linear-gradient(to right, #1c1c1c, #5c5c5c)",
											color: "white",
											borderColor: "#5c5c5c",
										},
									}}
								>
									Sign In
								</Button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<UserButton />
						</SignedIn>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
