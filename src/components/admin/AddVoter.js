// components/admin/AddVoter.js
import React from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

export default function AddVoter() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate API call
    alert('Voter added');
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" mt={4} mb={2}>Add Voter</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField fullWidth label="Name" margin="normal" required />
        <TextField fullWidth label="Class" margin="normal" required />
        <TextField fullWidth label="Student ID (Portal serial number)" margin="normal" required />
        <Button variant="contained" type="submit">Register</Button>
      </Box>
    </Container>
  );
}
