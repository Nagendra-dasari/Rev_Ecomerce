import React from "react";

import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function Home() {
  const cards = [
    {
      title: "Customer Flow",
      body: "Browse products, manage cart, place orders",
    },
    {
      title: "Admin Flow",
      body: "Create products, process orders, manage inventory",
    },
    {
      title: "Security",
      body: "JWT login, registration, password reset",
    },
  ];

  return (
    <Box sx={{ bgcolor: "grey.50", py: { xs: 4, md: 6 }, flex: 1 }}>
      <Container maxWidth="md">
        <Typography align="center" component="h1" gutterBottom variant="h3">
          Nagendra Commerce
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: "auto" }} variant="h6">
          Separate customer shopping and admin operations in one app.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {cards.map((card) => (
            <Grid key={card.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={2} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {card.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {card.body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center" }}>
          <Button component={RouterLink} size="large" to="/login" variant="contained">
            Sign In
          </Button>
          <Button component={RouterLink} size="large" to="/dashboard" variant="outlined">
            Open Dashboard
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export default Home;
