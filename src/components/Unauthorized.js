// components/Unauthorized.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" mt={10}>
      <Typography variant="h4" fontWeight="bold" color="error" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" mb={3}>
        You do not have permission to view this page.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ backgroundColor: '#FFD700', color: '#000' }}
      >
        Back to Login
      </Button>
    </Box>
  );
}
