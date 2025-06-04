import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/BSA_logo.png';
import LoginImage from '../assets/bg-img2.png';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [serialNumber, setSerialNumber] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serialNumber.trim()) {
      setSnackbar({ open: true, message: 'Please enter a serial number.', severity: 'warning' });
      return;
    }

    setLoading(true);
    const success = await login(serialNumber);
    setLoading(false);

    if (success) {
      setOpenModal(true);
    } else {
      setSnackbar({ open: true, message: 'Invalid serial number.', severity: 'error' });
    }
  };

  const handleGoToDashboard = () => {
    setOpenModal(false);
    if (user?.role === 'admin') {
      navigate('/dashboard');
    } else if (user?.role === 'voter') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left side image */}
      <Box
        sx={{
          width: '50%',
          display: { xs: 'none', md: 'block' },
          backgroundImage: `url(${LoginImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Right side form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
          }}
        >
          <Box mb={2}>
            <img src={Logo} alt="Logo" style={{ width: 50, marginBottom: 10 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Britarch Schools, Abuja
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Election Portal
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight="600" align="left" mb={2}>
            Login
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Serial Number"
              placeholder="Enter serial number"
              variant="outlined"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={1.5}>
                <CircularProgress size={24} sx={{ color: '#FFD700' }} />
                <Typography ml={2} fontSize={14}>
                  Verifying...
                </Typography>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  fontWeight: 'bold',
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#FFEB3B',
                  },
                }}
              >
                Verify ID
              </Button>
            )}
          </form>
        </Paper>
      </Box>

      {/* Success Modal */}
      <Dialog
        open={openModal}
        onClose={handleGoToDashboard}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            textAlign: 'center',
            py: 4,
            px: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {user?.fullname || user?.name || 'Verified'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3 }}>You have been verified</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={handleGoToDashboard}
            variant="contained"
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '24px',
              px: 4,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#FFEB3B',
              },
            }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
