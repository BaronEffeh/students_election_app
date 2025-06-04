import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  IconButton,
  Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminLayout from '../layout/AdminLayout';
import { supabase } from '../../supabaseClient';

export default function ViewCandidates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: null, voter_id: '', positions: '', photo: null });
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [creating, setCreating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const [{ data: posData }, { data: voterData }, { data: candidateData }] = await Promise.all([
      supabase.from('positions').select('*'),
      supabase.from('voters').select('id, fullname'),
      supabase.from('candidate_with_fullname').select('*')
    ]);

    setPositions(posData || []);
    setVoters(voterData || []);
    setCandidates(candidateData || []);
    setLoading(false);
  };

  const handleOpen = () => {
    setFormData({ id: null, voter_id: '', positions: '', photo: null });
    setSelectedVoter(null);
    setOpen(true);
  };

  const handleEdit = (candidate) => {
    const matchedVoter = voters.find(v => v.id === candidate.voter_id);
    setFormData({
      id: candidate.id,
      voter_id: candidate.voter_id,
      positions: candidate.positions,
      photo: candidate.photo_url
    });
    setSelectedVoter(matchedVoter || null);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      setSnackbar({ open: true, message: 'Failed to delete candidate', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Candidate deleted', severity: 'success' });
      fetchInitialData();
    }
  };

  const handleClose = () => {
    setFormData({ id: null, voter_id: '', positions: '', photo: null });
    setSelectedVoter(null);
    setOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `candidates/${Date.now()}-${file.name}`;
    const uploadResult = await supabase.storage.from('photos').upload(filePath, file);

    if (uploadResult.error) {
      console.error('Upload error:', uploadResult.error);
      setSnackbar({ open: true, message: 'Image upload failed', severity: 'error' });
    } else {
      const { publicUrl } = supabase.storage.from('photos').getPublicUrl(filePath).data;
      setFormData(prev => ({ ...prev, photo: publicUrl }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.voter_id || !formData.positions || !formData.photo) {
      setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
      return;
    }

    setCreating(true);
    let response;
    if (formData.id) {
      response = await supabase.from('candidates').update({
        voter_id: formData.voter_id,
        positions: formData.positions,
        photo_url: formData.photo
      }).eq('id', formData.id);
    } else {
      response = await supabase.from('candidates').insert([{
        voter_id: formData.voter_id,
        positions: formData.positions,
        photo_url: formData.photo
      }]);
    }

    setCreating(false);

    if (response.error) {
      console.error('Submit error:', response.error);
      setSnackbar({ open: true, message: 'Failed to save candidate', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Candidate saved successfully', severity: 'success' });
      handleClose();
      fetchInitialData();
    }
  };

  const filteredCandidates = candidates.filter(c =>
    c.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Typography variant="h6" fontWeight="bold">Candidates</Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#FFE452' } }}
            onClick={handleOpen}
          >
            Add Candidate
          </Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Search name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box textAlign="center" mt={5}>
            <CircularProgress />
            <Typography mt={2}>Loading candidates...</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: 2, maxHeight: 340, overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Photo</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Position</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell><Avatar src={candidate.photo_url} /></TableCell>
                    <TableCell>{candidate.fullname || '—'}</TableCell>
                    <TableCell>{candidate.positions}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(candidate)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(candidate.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{formData.id ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
          <DialogContent>
            <Autocomplete
              options={voters}
              getOptionLabel={(option) => option.fullname || ''}
              value={selectedVoter}
              onChange={(e, newValue) => {
                setSelectedVoter(newValue);
                setFormData(prev => ({ ...prev, voter_id: newValue?.id || '' }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Voter" margin="dense" />
              )}
              fullWidth
            />

            <TextField
              select
              label="Position"
              name="positions"
              fullWidth
              margin="dense"
              value={formData.positions}
              onChange={(e) => setFormData(prev => ({ ...prev, positions: e.target.value }))}
            >
              {positions.map(pos => (
                <MenuItem key={pos.id} value={pos.position}>
                  {pos.position}
                </MenuItem>
              ))}
            </TextField>

            <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
              Upload Photo
              <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </Button>

            {formData.photo && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Avatar src={formData.photo} alt="Preview" sx={{ width: 80, height: 80 }} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              fullWidth
              variant="contained"
              disabled={creating}
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                pt: 2,
                pb: 2,
                '&:hover': { backgroundColor: '#FFE452' }
              }}
              onClick={handleSubmit}
            >
              {creating ? 'Saving...' : formData.id ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
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
      </Container>
    </AdminLayout>
  );
}
