// components/Header.tsx
"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Box, AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Image from "next/image";

export default function Header() {
	return (
		<AppBar
			position="static"
			sx={{
				backgroundColor: "white",
				width: "100%",
				boxShadow: 10,
			}}
		>
			<Container maxWidth="lg">
				<Toolbar
					sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
						<Image src="/assets/logo.png" alt="HAKK Logo" width={150} height={60} />
					</Box>
					{/* Right side */}
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
