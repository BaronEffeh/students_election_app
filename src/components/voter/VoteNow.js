import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Card, CardContent, Typography, Button, Box,
  Radio, RadioGroup, FormControl, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import IconComplete from '../../assets/check-icon.png';
import { supabase } from '../../supabaseClient';
import { AuthContext } from '../../context/AuthContext';

export default function VoteNow() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [positions, setPositions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [votes, setVotes] = useState({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const currentPosition = positions[currentPositionIndex];
  const currentCandidates = grouped[currentPosition] || [];

  // Load progress from localStorage
  useEffect(() => {
    const savedVotes = localStorage.getItem(`votes_${user?.id}`);
    if (savedVotes) setVotes(JSON.parse(savedVotes));
  }, [user?.id]);

  // Check if voter already voted
  useEffect(() => {
    const checkIfAlreadyVoted = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('voter_id', user.id);

      if (error) {
        console.error('Error checking vote status:', error);
        return;
      }

      if (data && data.length > 0) setAlreadyVoted(true);
    };

    checkIfAlreadyVoted();
  }, [user?.id]);

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('id, positions, photo_url, voters(fullname)');

      if (error) {
        console.error('Error fetching candidates:', error);
        return;
      }

      const groupedByPosition = data.reduce((acc, candidate) => {
        const key = candidate.positions;
        if (!acc[key]) acc[key] = [];
        acc[key].push(candidate);
        return acc;
      }, {});

      setGrouped(groupedByPosition);
      setPositions(Object.keys(groupedByPosition));
      setLoadingCandidates(false);
    };

    fetchCandidates();
  }, []);

  const handleVote = () => {
    if (!selectedCandidateId) {
      setSnackbar({ open: true, message: 'Please select a candidate or skip.', severity: 'warning' });
      return;
    }

    const selected = currentCandidates.find(c => c.id.toString() === selectedCandidateId);
    const newVotes = { ...votes, [currentPosition]: selected };
    setVotes(newVotes);
    localStorage.setItem(`votes_${user?.id}`, JSON.stringify(newVotes));

    setSelectedCandidateId('');
    handleNext();
  };

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1);
    } else {
      setIsReviewing(true);
    }
  };

  const handleBack = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1);
      const prevPosition = positions[currentPositionIndex - 1];
      const prevCandidate = votes[prevPosition];
      setSelectedCandidateId(prevCandidate?.id.toString() || '');
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleFinalSubmit = async () => {
    if (Object.keys(votes).length === 0) {
      setSnackbar({ open: true, message: 'You did not cast any votes.', severity: 'info' });
      return;
    }

    try {
      const payload = Object.entries(votes).map(([position, candidate]) => ({
        voter_id: user?.id,
        candidate_id: candidate.id,
        positions: position
      }));

      const { error } = await supabase.from('votes').insert(payload);

      if (error) {
        console.error('Vote submission failed:', error);
        setSnackbar({ open: true, message: 'Failed to submit votes.', severity: 'error' });
        return;
      }

      localStorage.removeItem(`votes_${user?.id}`);
      setShowThankYou(true);
    } catch (err) {
      console.error('Unexpected error submitting votes:', err);
    }
  };

  if (alreadyVoted) {
    return (
      <Container maxWidth="sm">
        <Box mt={6} textAlign="center">
          <Card sx={{ borderRadius: 4, p: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              You have already voted
            </Typography>
            <Typography variant="body1">Thank you for participating in the election.</Typography>
            <Button
              onClick={() => navigate('/')}
              sx={{ mt: 4, backgroundColor: '#FFD700', color: '#000', px: 5, borderRadius: 3 }}
              variant="contained"
            >
              Logout
            </Button>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box mt={6}>
        <Card sx={{ borderRadius: 4, p: 3, boxShadow: 3 }}>
          <CardContent>
            {!isReviewing ? (
              <>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Cast your Votes
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Position: {currentPosition}
                </Typography>

                {loadingCandidates ? (
                  <Box textAlign="center" mt={3}>
                    <CircularProgress />
                    <Typography mt={1}>Loading candidates...</Typography>
                  </Box>
                ) : (
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value)}
                    >
                      {currentCandidates.map((candidate) => (
                        <Box
                          key={candidate.id}
                          display="flex"
                          alignItems="center"
                          py={1}
                          px={2}
                          sx={{ borderRadius: 2, '&:hover': { backgroundColor: '#f9f9f9', cursor: 'pointer' } }}
                        >
                          <FormControlLabel
                            value={candidate.id.toString()}
                            control={<Radio />}
                            label={
                              <Box display="flex" alignItems="center">
                                <img
                                  src={candidate.photo_url}
                                  alt={candidate.voters?.fullname}
                                  style={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: '50%',
                                    marginRight: 12,
                                    objectFit: 'cover'
                                  }}
                                />
                                <Typography variant="body1">
                                  {candidate.voters?.fullname}
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}

                <Box display="flex" justifyContent="space-between" mt={4}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={currentPositionIndex === 0}
                    sx={{ px: 4, borderRadius: 2 }}
                  >
                    Back
                  </Button>
                  <Box display="flex" gap={2}>
                    <Button
                      onClick={handleSkip}
                      sx={{ textTransform: 'none' }}
                    >
                      Skip
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleVote}
                      sx={{
                        px: 6,
                        backgroundColor: '#FFD500',
                        color: '#000',
                        borderRadius: 2,
                        '&:hover': { backgroundColor: '#FFE452' },
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6" fontWeight="bold" mb={1}>Review Votes</Typography>
                <Box height="2px" width="100%" bgcolor="#EDEDED" mb={3} />

                <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1, mb: 2 }}>
                  {positions.map((position) => {
                    const candidate = votes[position];
                    return (
                      <Box key={position} mb={3}>
                        <Typography variant="subtitle1" fontWeight="500">{position}</Typography>
                        {candidate ? (
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <img
                              src={candidate.photo_url}
                              alt={candidate.voters?.fullname}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                            <Typography>{candidate.voters?.fullname}</Typography>
                          </Box>
                        ) : (
                          <Typography color="text.secondary" fontStyle="italic">No vote cast</Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                <Box display="flex" justifyContent="space-between" mt={4}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsReviewing(false);
                      setCurrentPositionIndex(positions.length - 1);
                    }}
                    sx={{ borderRadius: '8px', textTransform: 'none', px: 4 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleFinalSubmit}
                    disabled={Object.keys(votes).length === 0}
                    sx={{
                      backgroundColor: '#FFD700',
                      color: '#000',
                      borderRadius: '8px',
                      textTransform: 'none',
                      px: 4,
                      '&:hover': { backgroundColor: '#FFEB3B' }
                    }}
                  >
                    Submit
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Success Dialog */}
        <Dialog open={showThankYou} onClose={() => navigate('/')}>
          <DialogContent>
            <Box display="flex" justifyContent="center" mb={1}>
              <img src={IconComplete} alt="Thank You" style={{ width: 100, height: 100 }} />
            </Box>
            <DialogTitle align="center">🎉 Thank You for Voting!</DialogTitle>
            <Typography align="center" mb={2}>
              Your votes have been successfully submitted.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              onClick={() => navigate('/')}
              variant="contained"
              autoFocus
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                pl: 5,
                pr: 5,
                '&:hover': { backgroundColor: '#FFE452' },
              }}
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
