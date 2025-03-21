import { useState } from "react";
import { TextField, Button, Box, Typography, Container, Grid, Paper } from "@mui/material";

export default function UserPreferencesForm() {
  const [formData, setFormData] = useState({
    movies: ["", "", ""],
    artists: ["", "", ""],
    hobbies: ["", "", ""],
  });

  const handleChange = (category: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/user-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (response.ok) alert("Preferences saved!");
    else alert("Error saving preferences.");
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
                      onChange={(e) => handleChange(category, i, e.target.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
