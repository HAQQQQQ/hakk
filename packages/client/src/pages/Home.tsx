// Home.tsx
import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Home: React.FC = () => {
	return (
		<Container>
			<Box mt={4} textAlign="center">
				<Typography variant="h3" component="h1" gutterBottom>
					Hakk Admin/Testing Client
				</Typography>
			</Box>
		</Container>
	);
};

export default Home;
