// components/Header.tsx
"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Box, AppBar, Toolbar, Button, Container } from "@mui/material";
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
										borderColor: "#cccccc",
										color: "#333",
										fontWeight: 600,
										fontFamily: "Roboto, sans-serif",
										textTransform: "none",
										px: 3,
										py: 1,
										borderRadius: "10px",
										backgroundColor: "#f9f9f9",
										boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
										transition: "all 0.3s ease",
										"&:hover": {
											backgroundColor: "#e0e0e0",
											borderColor: "#aaaaaa",
											color: "#000",
											boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
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
