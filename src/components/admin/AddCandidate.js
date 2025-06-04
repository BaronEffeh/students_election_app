// components/admin/AddCandidate.js
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import API from '../../api/axios';

export default function AddCandidate() {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { name, position };
      await API.post('/aspirants/register', data);
      alert('Candidate successfully added!');
      setName('');
      setPosition('');
    } catch (error) {
      console.error('Error adding candidate:', error);
      alert('Failed to add candidate. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" mt={4} mb={2}>Add Candidate</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Full Name"
          margin="normal"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label="Position"
          margin="normal"
          required
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </Container>
  );
}
