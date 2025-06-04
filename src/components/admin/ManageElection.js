import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import AdminLayout from '../layout/AdminLayout';
import { ElectionContext } from '../../context/ElectionContext';
import { supabase } from '../../supabaseClient';

export default function ManageElection() {
  const [electionDate, setElectionDate] = useState('');
  const [electionTime, setElectionTime] = useState('');
  const [duration, setDuration] = useState('');
  const [countdown, setCountdown] = useState('');
  const [processCountdown, setProcessCountdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const {
    electionDateTime,
    setElectionDateTime,
    processEndTime,
    setProcessEndTime
  } = useContext(ElectionContext);

  // Load config from Supabase on mount
  useEffect(() => {
    const fetchElectionConfig = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('election_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading config:', error);
      } else if (data) {
        if (data.election_start) setElectionDateTime(data.election_start);
        if (data.election_end) setProcessEndTime(data.election_end);
      }

      setLoading(false);
    };

    fetchElectionConfig();
  }, [setElectionDateTime, setProcessEndTime]);

  // Countdown to election start
  useEffect(() => {
    let timer;
    if (electionDateTime) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = new Date(electionDateTime).getTime() - now;

        if (distance <= 0) {
          clearInterval(timer);
          setCountdown('00D : 00H : 00M : 00S');
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(`${days.toString().padStart(2, '0')}D : ${hours.toString().padStart(2, '0')}H : ${minutes.toString().padStart(2, '0')}M : ${seconds.toString().padStart(2, '0')}S`);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [electionDateTime]);

  // Countdown to election end
  useEffect(() => {
    let processTimer;
    if (processEndTime) {
      processTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = new Date(processEndTime).getTime() - now;

        if (distance <= 0) {
          clearInterval(processTimer);
          setProcessCountdown('00D : 00H : 00M : 00S');
        } else {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setProcessCountdown(`${days.toString().padStart(2, '0')}D : ${hours.toString().padStart(2, '0')}H : ${minutes.toString().padStart(2, '0')}M : ${seconds.toString().padStart(2, '0')}S`);
        }
      }, 1000);
    }

    return () => clearInterval(processTimer);
  }, [processEndTime]);

  const handleSetElectionDate = async () => {
    if (!electionDate || !electionTime) {
      setSnackbar({ open: true, message: 'Please enter both date and time.', severity: 'warning' });
      return;
    }
    const fullDateTime = `${electionDate}T${electionTime}`;
    setElectionDateTime(fullDateTime);

    const { error } = await supabase.from('election_config').insert({
      election_start: fullDateTime
    });

    if (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Error setting election date.', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: `Election date set to ${fullDateTime}`, severity: 'success' });
    }
  };

  const handleStartElection = async () => {
    if (!duration || isNaN(duration)) {
      setSnackbar({ open: true, message: 'Enter a valid duration in minutes.', severity: 'warning' });
      return;
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + Number(duration) * 60000);
    const isoEndTime = endTime.toISOString();
    setProcessEndTime(isoEndTime);

    const { error } = await supabase.from('election_config').insert({
      election_end: isoEndTime
    });

    if (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Error starting election.', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: `Election started for ${duration} minutes.`, severity: 'success' });
    }
  };

  const navigate = useNavigate();

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={1}>
          Manage Elections
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={2}>
          <Typography sx={{ minWidth: 160 }}>Set Election Date</Typography>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <TextField
              type="date"
              size="small"
              value={electionDate}
              onChange={(e) => setElectionDate(e.target.value)}
            />
            <TextField
              type="time"
              size="small"
              value={electionTime}
              onChange={(e) => setElectionTime(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleSetElectionDate}
              sx={{ backgroundColor: '#F5F5F5', color: '#000', textTransform: 'none', '&:hover': { backgroundColor: '#e0e0e0' } }}
            >
              Set
            </Button>
          </Box>
        </Box>

        {electionDateTime && (
          <Typography variant="body1" fontWeight="bold" mt={1} mb={3}>
            Countdown to Election: {countdown}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Typography sx={{ minWidth: 160 }}>Election Duration (in minutes)</Typography>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <TextField
              type="number"
              size="small"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 240"
            />
            <Button
              variant="contained"
              onClick={handleStartElection}
              sx={{ backgroundColor: '#FFD700', color: '#000', textTransform: 'none', '&:hover': { backgroundColor: '#FFEB3B' } }}
            >
              Start
            </Button>
          </Box>
        </Box>

        {processEndTime && (
          <Typography variant="body1" fontWeight="bold" mt={3}>
            Election Ends In: {processCountdown}
          </Typography>
        )}

        <Divider sx={{ my: 4 }} />

        <Box textAlign="right">
          <Button
            variant="outlined"
            onClick={() => navigate('/election-report')}
            sx={{
              color: '#000',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              border: '1px solid #002345',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#F9F9F6',
              },
            }}
          >
            Generate Election Report
          </Button>
        </Box>


        {loading && (
          <Box textAlign="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
}
