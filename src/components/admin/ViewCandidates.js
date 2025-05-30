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






// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   InputAdornment,
//   Button,
//   Avatar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   MenuItem,
//   IconButton
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AdminLayout from '../layout/AdminLayout';
// import { supabase } from '../../supabaseClient';

// export default function ViewCandidates() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [open, setOpen] = useState(false);
//   const [candidates, setCandidates] = useState([]);
//   const [positions, setPositions] = useState([]);
//   const [voters, setVoters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({ id: null, voter_id: '', positions: '', photo: null });
//   const [creating, setCreating] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [voterSearch, setVoterSearch] = useState('');

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     setLoading(true);
//     const [{ data: posData }, { data: voterData }, { data: candidateData }] = await Promise.all([
//       supabase.from('positions').select('*'),
//       supabase.from('voters').select('id, fullname'),
//       supabase.from('candidate_with_fullname').select('*')
//     ]);

//     setPositions(posData || []);
//     setVoters(voterData || []);
//     setCandidates(candidateData || []);
//     setLoading(false);
//   };

//   const handleOpen = () => {
//     setFormData({ id: null, voter_id: '', positions: '', photo: null });
//     setVoterSearch('');
//     setOpen(true);
//   };

//   const handleEdit = (candidate) => {
//     setFormData({
//       id: candidate.id,
//       voter_id: candidate.voter_id,
//       positions: candidate.positions,
//       photo: candidate.photo_url
//     });
//     setOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this candidate?')) return;
//     const { error } = await supabase.from('candidates').delete().eq('id', id);
//     if (error) {
//       console.error('Delete error:', error);
//       setSnackbar({ open: true, message: 'Failed to delete candidate', severity: 'error' });
//     } else {
//       setSnackbar({ open: true, message: 'Candidate deleted', severity: 'success' });
//       fetchInitialData();
//     }
//   };

//   const handleClose = () => {
//     setFormData({ id: null, voter_id: '', positions: '', photo: null });
//     setVoterSearch('');
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const filePath = `candidates/${Date.now()}-${file.name}`;
//     const uploadResult = await supabase.storage.from('photos').upload(filePath, file);

//     if (uploadResult.error) {
//       console.error('Upload error:', uploadResult.error);
//       setSnackbar({ open: true, message: 'Image upload failed', severity: 'error' });
//     } else {
//       const { publicUrl } = supabase.storage.from('photos').getPublicUrl(filePath).data;
//       setFormData(prev => ({ ...prev, photo: publicUrl }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!formData.voter_id || !formData.positions || !formData.photo) {
//       setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
//       return;
//     }

//     setCreating(true);
//     let response;
//     if (formData.id) {
//       response = await supabase.from('candidates').update({
//         voter_id: formData.voter_id,
//         positions: formData.positions,
//         photo_url: formData.photo
//       }).eq('id', formData.id);
//     } else {
//       response = await supabase.from('candidates').insert([{
//         voter_id: formData.voter_id,
//         positions: formData.positions,
//         photo_url: formData.photo
//       }]);
//     }

//     setCreating(false);

//     if (response.error) {
//       console.error('Submit error:', response.error);
//       setSnackbar({ open: true, message: 'Failed to save candidate', severity: 'error' });
//     } else {
//       setSnackbar({ open: true, message: 'Candidate saved successfully', severity: 'success' });
//       handleClose();
//       fetchInitialData();
//     }
//   };

//   const filteredCandidates = candidates.filter(c =>
//     c.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const filteredVoters = voters.filter(v =>
//     v.fullname.toLowerCase().includes(voterSearch.toLowerCase())
//   );

//   return (
//     <AdminLayout>
//       <Container maxWidth="lg">
//         <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
//           <Typography variant="h6" fontWeight="bold">Candidates</Typography>
//           <Button
//             variant="contained"
//             sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#FFE452' } }}
//             onClick={handleOpen}
//           >
//             Add Candidate
//           </Button>
//         </Box>

//         <TextField
//           fullWidth
//           placeholder="Search name"
//           variant="outlined"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           sx={{ mb: 3 }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             ),
//           }}
//         />

//         {loading ? (
//           <Box textAlign="center" mt={5}>
//             <CircularProgress />
//             <Typography mt={2}>Loading candidates...</Typography>
//           </Box>
//         ) : (
//           <TableContainer sx={{ borderRadius: 2, maxHeight: 340, overflowY: 'auto' }}>
//             <Table stickyHeader>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
//                   <TableCell><strong>Photo</strong></TableCell>
//                   <TableCell><strong>Name</strong></TableCell>
//                   <TableCell><strong>Position</strong></TableCell>
//                   <TableCell><strong>Actions</strong></TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredCandidates.map((candidate) => (
//                   <TableRow key={candidate.id}>
//                     <TableCell><Avatar src={candidate.photo_url} /></TableCell>
//                     <TableCell>{candidate.fullname || '—'}</TableCell>
//                     <TableCell>{candidate.positions}</TableCell>
//                     <TableCell>
//                       <IconButton onClick={() => handleEdit(candidate)}><EditIcon /></IconButton>
//                       <IconButton onClick={() => handleDelete(candidate.id)}><DeleteIcon /></IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}

//         {/* Modal */}
//         <Dialog open={open} onClose={handleClose}>
//           <DialogTitle>{formData.id ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
//           <DialogContent>
//             <TextField
//               fullWidth
//               placeholder="Search voter"
//               value={voterSearch}
//               onChange={(e) => setVoterSearch(e.target.value)}
//               margin="dense"
//             />

//             <TextField
//               select
//               label="Select Voter"
//               name="voter_id"
//               fullWidth
//               margin="dense"
//               value={formData.voter_id}
//               onChange={handleChange}
//             >
//               {filteredVoters.map(voter => (
//                 <MenuItem key={voter.id} value={voter.id}>
//                   {voter.fullname}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <TextField
//               select
//               label="Position"
//               name="positions"
//               fullWidth
//               margin="dense"
//               value={formData.positions}
//               onChange={handleChange}
//             >
//               {positions.map(pos => (
//                 <MenuItem key={pos.id} value={pos.position}>
//                   {pos.position}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
//               Upload Photo
//               <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
//             </Button>

//             {formData.photo && (
//               <Box display="flex" justifyContent="center" mt={2}>
//                 <Avatar src={formData.photo} alt="Preview" sx={{ width: 80, height: 80 }} />
//               </Box>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button
//               fullWidth
//               variant="contained"
//               disabled={creating}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 pt: 2,
//                 pb: 2,
//                 '&:hover': { backgroundColor: '#FFE452' }
//               }}
//               onClick={handleSubmit}
//             >
//               {creating ? 'Saving...' : formData.id ? 'Update' : 'Submit'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={4000}
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         >
//           <Alert
//             onClose={() => setSnackbar({ ...snackbar, open: false })}
//             severity={snackbar.severity}
//             sx={{ width: '100%' }}
//           >
//             {snackbar.message}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </AdminLayout>
//   );
// }






// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   InputAdornment,
//   Button,
//   Avatar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   MenuItem,
//   IconButton
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AdminLayout from '../layout/AdminLayout';
// import { supabase } from '../../supabaseClient';

// export default function ViewCandidates() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [open, setOpen] = useState(false);
//   const [candidates, setCandidates] = useState([]);
//   const [positions, setPositions] = useState([]);
//   const [voters, setVoters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({ id: null, voter_id: '', positions: '', photo: null });
//   const [creating, setCreating] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     setLoading(true);
//     const [{ data: posData }, { data: voterData }, { data: candidateData }] = await Promise.all([
//       supabase.from('positions').select('*'),
//       supabase.from('voters').select('id, fullname'),
//       supabase.from('candidate_with_fullname').select('*') // View
//     ]);

//     setPositions(posData || []);
//     setVoters(voterData || []);
//     setCandidates(candidateData || []);
//     setLoading(false);
//   };

//   const handleOpen = () => {
//     setFormData({ id: null, voter_id: '', positions: '', photo: null });
//     setOpen(true);
//   };

//   const handleEdit = (candidate) => {
//     setFormData({
//       id: candidate.id,
//       voter_id: candidate.voter_id,
//       positions: candidate.positions,
//       photo: candidate.photo_url
//     });
//     setOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this candidate?')) return;
//     const { error } = await supabase.from('candidates').delete().eq('id', id);
//     if (error) {
//       console.error('Delete error:', error);
//       setSnackbar({ open: true, message: 'Failed to delete candidate', severity: 'error' });
//     } else {
//       setSnackbar({ open: true, message: 'Candidate deleted', severity: 'success' });
//       fetchInitialData();
//     }
//   };

//   const handleClose = () => {
//     setFormData({ id: null, voter_id: '', positions: '', photo: null });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const filePath = `candidates/${Date.now()}-${file.name}`;
//     const uploadResult = await supabase.storage.from('photos').upload(filePath, file);

//     if (uploadResult.error) {
//       console.error('Upload error:', uploadResult.error);
//       setSnackbar({ open: true, message: 'Image upload failed', severity: 'error' });
//     } else {
//       const { publicUrl } = supabase.storage.from('photos').getPublicUrl(filePath).data;
//       setFormData(prev => ({ ...prev, photo: publicUrl }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!formData.voter_id || !formData.positions || !formData.photo) {
//       setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
//       return;
//     }

//     setCreating(true);
//     let response;
//     if (formData.id) {
//       response = await supabase.from('candidates').update({
//         voter_id: formData.voter_id,
//         positions: formData.positions,
//         photo_url: formData.photo
//       }).eq('id', formData.id);
//     } else {
//       response = await supabase.from('candidates').insert([{
//         voter_id: formData.voter_id,
//         positions: formData.positions,
//         photo_url: formData.photo
//       }]);
//     }

//     setCreating(false);

//     if (response.error) {
//       console.error('Submit error:', response.error);
//       setSnackbar({ open: true, message: 'Failed to save candidate', severity: 'error' });
//     } else {
//       setSnackbar({ open: true, message: 'Candidate saved successfully', severity: 'success' });
//       handleClose();
//       fetchInitialData();
//     }
//   };

//   const filteredCandidates = candidates.filter(c =>
//     c.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <AdminLayout>
//       <Container maxWidth="lg">
//         <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
//           <Typography variant="h6" fontWeight="bold">Candidates</Typography>
//           <Button
//             variant="contained"
//             sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#FFE452' } }}
//             onClick={handleOpen}
//           >
//             Add Candidate
//           </Button>
//         </Box>

//         <TextField
//           fullWidth
//           placeholder="Search name"
//           variant="outlined"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           sx={{ mb: 3 }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             ),
//           }}
//         />

//         {loading ? (
//           <Box textAlign="center" mt={5}>
//             <CircularProgress />
//             <Typography mt={2}>Loading candidates...</Typography>
//           </Box>
//         ) : (
//           <TableContainer sx={{ borderRadius: 2, maxHeight: 340, overflowY: 'auto' }}>
//             <Table stickyHeader>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
//                   <TableCell><strong>Photo</strong></TableCell>
//                   <TableCell><strong>Name</strong></TableCell>
//                   <TableCell><strong>Position</strong></TableCell>
//                   <TableCell><strong>Actions</strong></TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredCandidates.map((candidate) => (
//                   <TableRow key={candidate.id}>
//                     <TableCell><Avatar src={candidate.photo_url} /></TableCell>
//                     <TableCell>{candidate.fullname || '—'}</TableCell>
//                     <TableCell>{candidate.positions}</TableCell>
//                     <TableCell>
//                       <IconButton onClick={() => handleEdit(candidate)}><EditIcon /></IconButton>
//                       <IconButton onClick={() => handleDelete(candidate.id)}><DeleteIcon /></IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}

//         {/* Modal */}
//         <Dialog open={open} onClose={handleClose}>
//           <DialogTitle>{formData.id ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
//           <DialogContent>
//             <TextField
//               select
//               label="Select Voter"
//               name="voter_id"
//               fullWidth
//               margin="dense"
//               value={formData.voter_id}
//               onChange={handleChange}
//             >
//               {voters.map(voter => (
//                 <MenuItem key={voter.id} value={voter.id}>
//                   {voter.fullname}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <TextField
//               select
//               label="Position"
//               name="positions"
//               fullWidth
//               margin="dense"
//               value={formData.positions}
//               onChange={handleChange}
//             >
//               {positions.map(pos => (
//                 <MenuItem key={pos.id} value={pos.position}>
//                   {pos.position}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
//               Upload Photo
//               <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
//             </Button>

//             {formData.photo && (
//               <Box display="flex" justifyContent="center" mt={2}>
//                 <Avatar src={formData.photo} alt="Preview" sx={{ width: 80, height: 80 }} />
//               </Box>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button
//               fullWidth
//               variant="contained"
//               disabled={creating}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 pt: 2,
//                 pb: 2,
//                 '&:hover': { backgroundColor: '#FFE452' }
//               }}
//               onClick={handleSubmit}
//             >
//               {creating ? 'Saving...' : formData.id ? 'Update' : 'Submit'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={4000}
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         >
//           <Alert
//             onClose={() => setSnackbar({ ...snackbar, open: false })}
//             severity={snackbar.severity}
//             sx={{ width: '100%' }}
//           >
//             {snackbar.message}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </AdminLayout>
//   );
// }





// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   InputAdornment,
//   Button,
//   Avatar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   MenuItem
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import AdminLayout from '../layout/AdminLayout';
// import { supabase } from '../../supabaseClient';

// export default function ViewCandidates() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [open, setOpen] = useState(false);
//   const [candidates, setCandidates] = useState([]);
//   const [positions, setPositions] = useState([]);
//   const [voters, setVoters] = useState([]);
//   const [formData, setFormData] = useState({ voter_id: '', position: '', photo: null });
//   const [creating, setCreating] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   // Fetch positions, voters, and candidates
//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     const [{ data: posData }, { data: voterData }, { data: candData }] = await Promise.all([
//       supabase.from('positions').select('*'),
//       supabase.from('voters').select('id, fullname'),
//       supabase
//         .from('candidates')
//         .select('id, voter_id, position, photo_url, voters(fullname)')
//     ]);

//     setPositions(posData || []);
//     setVoters(voterData || []);
//     setCandidates(candData || []);
//   };

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ voter_id: '', position: '', photo: null });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const filePath = `candidates/${Date.now()}-${file.name}`;
//     const { data, error } = await supabase.storage.from('photos').upload(filePath, file);

//     if (error) {
//       console.error('Upload error:', error);
//       setSnackbar({ open: true, message: 'Image upload failed', severity: 'error' });
//     } else {
//       const { publicUrl } = supabase.storage.from('photos').getPublicUrl(filePath).data;
//       setFormData(prev => ({ ...prev, photo: publicUrl }));
//     }
//   };

//   const handleSubmit = async () => {
//     if (!formData.voter_id || !formData.position || !formData.photo) {
//       setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
//       return;
//     }

//     setCreating(true);
//     const { error } = await supabase.from('candidates').insert([{
//       voter_id: formData.voter_id,
//       position: formData.position,
//       photo_url: formData.photo
//     }]);
//     setCreating(false);

//     if (error) {
//       console.error('Insert error:', error);
//       setSnackbar({ open: true, message: 'Failed to create candidate', severity: 'error' });
//     } else {
//       setSnackbar({ open: true, message: 'Candidate added successfully', severity: 'success' });
//       handleClose();
//       fetchInitialData();
//     }
//   };

//   const filteredCandidates = candidates.filter(c =>
//     c.voters?.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <AdminLayout>
//       <Container maxWidth="lg">
//         <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
//           <Typography variant="h6" fontWeight="bold">Candidates</Typography>
//           <Button
//             variant="contained"
//             sx={{ backgroundColor: '#FFD700', color: '#000', '&:hover': { backgroundColor: '#FFE452' } }}
//             onClick={handleOpen}
//           >
//             Add Candidate
//           </Button>
//         </Box>

//         <TextField
//           fullWidth
//           placeholder="Search name"
//           variant="outlined"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           sx={{ mb: 3 }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             ),
//           }}
//         />

//         <TableContainer sx={{ borderRadius: 2, maxHeight: 340, overflowY: 'auto' }}>
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
//                 <TableCell><strong>Photo</strong></TableCell>
//                 <TableCell><strong>Name</strong></TableCell>
//                 <TableCell><strong>Position</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredCandidates.map((candidate) => (
//                 <TableRow key={candidate.id}>
//                   <TableCell>
//                     <Avatar src={candidate.photo_url} />
//                   </TableCell>
//                   <TableCell>{candidate.voters?.fullname || '—'}</TableCell>
//                   <TableCell>{candidate.position}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* Add Candidate Modal */}
//         <Dialog open={open} onClose={handleClose}>
//           <DialogTitle>Add Candidate</DialogTitle>
//           <DialogContent>
//             <TextField
//               select
//               label="Select Voter"
//               name="voter_id"
//               fullWidth
//               margin="dense"
//               value={formData.voter_id}
//               onChange={handleChange}
//             >
//               {voters.map(voter => (
//                 <MenuItem key={voter.id} value={voter.id}>
//                   {voter.fullname}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <TextField
//               select
//               label="Position"
//               name="position"
//               fullWidth
//               margin="dense"
//               value={formData.position}
//               onChange={handleChange}
//             >
//               {positions.map(pos => (
//                 <MenuItem key={pos.id} value={pos.position}>
//                   {pos.position}
//                 </MenuItem>
//               ))}
//             </TextField>

//             <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
//               Upload Photo
//               <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
//             </Button>

//             {formData.photo && (
//               <Box display="flex" justifyContent="center" mt={2}>
//                 <Avatar src={formData.photo} alt="Preview" sx={{ width: 80, height: 80 }} />
//               </Box>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button
//               fullWidth
//               variant="contained"
//               disabled={creating}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 pt: 2,
//                 pb: 2,
//                 '&:hover': { backgroundColor: '#FFE452' }
//               }}
//               onClick={handleSubmit}
//             >
//               {creating ? 'Submitting...' : 'Submit'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={4000}
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         >
//           <Alert
//             onClose={() => setSnackbar({ ...snackbar, open: false })}
//             severity={snackbar.severity}
//             sx={{ width: '100%' }}
//           >
//             {snackbar.message}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </AdminLayout>
//   );
// }





// import React, { useState, useEffect } from 'react';
// import AdminLayout from '../layout/AdminLayout';
// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   InputAdornment,
//   Button,
//   Avatar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import { supabase } from '../../supabaseClient';

// export default function ViewCandidates() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ name: '', position: '', photo: null });
//   const [candidates, setCandidates] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   // Fetch candidates from Supabase
//   const fetchCandidates = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from('candidates')
//       .select('id, fullname, positions, picture_url')
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('Error fetching candidates:', error);
//     } else {
//       setCandidates(data);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchCandidates();
//   }, []);

//   const filteredCandidates = candidates.filter((candidate) =>
//     candidate.fullname.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ name: '', position: '', photo: null });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const fileExt = file.name.split('.').pop();
//     const fileName = `${Date.now()}.${fileExt}`;
//     const filePath = `candidates/${fileName}`;

//     const { error: uploadError } = await supabase.storage
//       .from('photos')
//       .upload(filePath, file);

//     if (uploadError) {
//       console.error('Upload error:', uploadError);
//       setSnackbar({ open: true, message: 'Photo upload failed', severity: 'error' });
//     } else {
//       const { data: publicUrlData } = supabase.storage
//         .from('photos')
//         .getPublicUrl(filePath);
//       setFormData({ ...formData, photo: publicUrlData.publicUrl });
//     }
//   };

//   const handleSubmit = async () => {
//     if (!formData.name || !formData.position || !formData.photo) {
//       setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
//       return;
//     }

//     setSubmitting(true);
//     const { data, error } = await supabase
//       .from('candidates')
//       .insert([
//         {
//           fullname: formData.name,
//           positions: formData.position, // field is plural in your table
//           picture_url: formData.photo
//         }
//       ])
//       .select();

//     setSubmitting(false);

//     if (error) {
//       console.error('Error adding candidate:', error);
//       setSnackbar({ open: true, message: 'Failed to add candidate', severity: 'error' });
//     } else {
//       setSnackbar({ open: true, message: 'Candidate added successfully', severity: 'success' });
//       setCandidates(prev => [...data, ...prev]);
//       handleClose();
//     }
//   };

//   return (
//     <AdminLayout>
//       <Container maxWidth="lg">
//         <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
//           <Typography variant="h6" fontWeight="bold">Candidates</Typography>
//           <Button
//             variant="contained"
//             onClick={handleOpen}
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               borderRadius: 2,
//               '&:hover': { backgroundColor: '#FFE452' },
//             }}
//           >
//             Add Candidate
//           </Button>
//         </Box>

//         <TextField
//           fullWidth
//           placeholder="Search name"
//           variant="outlined"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           sx={{ mb: 3 }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             ),
//           }}
//         />

//         {loading ? (
//           <Box textAlign="center" mt={5}>
//             <CircularProgress />
//             <Typography mt={2}>Loading candidates...</Typography>
//           </Box>
//         ) : (
//           <TableContainer sx={{ borderRadius: 2, maxHeight: 340, overflowY: 'auto' }}>
//             <Table stickyHeader>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
//                   <TableCell><strong>Photo</strong></TableCell>
//                   <TableCell><strong>Name</strong></TableCell>
//                   <TableCell><strong>Position</strong></TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredCandidates.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={3}>No candidates found.</TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredCandidates.map((candidate) => (
//                     <TableRow
//                       key={candidate.id}
//                       sx={{
//                         backgroundColor: candidate.id % 2 === 0 ? '#FAFAFA' : ''
//                       }}
//                     >
//                       <TableCell>
//                         <Avatar
//                           alt={candidate.fullname}
//                           src={candidate.picture_url}
//                         />
//                       </TableCell>
//                       <TableCell>{candidate.fullname}</TableCell>
//                       <TableCell>{candidate.positions}</TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}

//         {/* Modal */}
//         <Dialog open={open} onClose={handleClose}>
//           <DialogTitle>Enter Candidate Details</DialogTitle>
//           <DialogContent>
//             <TextField
//               label="Name"
//               name="name"
//               fullWidth
//               margin="dense"
//               value={formData.name}
//               onChange={handleChange}
//             />
//             <TextField
//               label="Position"
//               name="position"
//               fullWidth
//               margin="dense"
//               value={formData.position}
//               onChange={handleChange}
//             />
//             <Button
//               variant="outlined"
//               component="label"
//               fullWidth
//               sx={{ mt: 2 }}
//             >
//               Upload Photo
//               <input
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 onChange={handleImageUpload}
//               />
//             </Button>

//             {formData.photo && (
//               <Box display="flex" justifyContent="center" mt={2}>
//                 <Avatar
//                   src={formData.photo}
//                   alt="Candidate Preview"
//                   sx={{ width: 80, height: 80 }}
//                 />
//               </Box>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button
//               fullWidth
//               variant="contained"
//               disabled={submitting}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 pt: 2,
//                 pb: 2,
//                 '&:hover': { backgroundColor: '#FFE452' },
//               }}
//               onClick={handleSubmit}
//             >
//               {submitting ? 'Submitting...' : 'Submit'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={4000}
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         >
//           <Alert
//             onClose={() => setSnackbar({ ...snackbar, open: false })}
//             severity={snackbar.severity}
//             sx={{ width: '100%' }}
//           >
//             {snackbar.message}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </AdminLayout>
//   );
// }





// import React, { useState } from 'react';
// import AdminLayout from '../layout/AdminLayout';
// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   InputAdornment,
//   Button,
//   Avatar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   // Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';

// const dummyCandidates = [
//   { id: 1, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
//   { id: 2, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
//   { id: 3, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
//   { id: 4, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
//   { id: 5, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
//   { id: 6, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
// ];

// export default function ViewCandidates() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ name: '', position: '', photo: null });
//   const [candidates, setCandidates] = useState(dummyCandidates);

//   const filteredCandidates = candidates.filter((candidate) =>
//     candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ name: '', position: '', photo: null });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setFormData({ ...formData, photo: imageUrl });
//     }
//   };

//   const handleSubmit = () => {
//     const newCandidate = {
//       id: candidates.length + 1,
//       ...formData,
//     };
//     setCandidates([...candidates, newCandidate]);
//     handleClose();
//   };

//   return (
//     <AdminLayout>
//       <Container maxWidth="lg" height="100vh" overflowY="none">
//         <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
//           <Typography variant="h6" fontWeight="bold">Candidates</Typography>
//           <Button
//             variant="contained"
//             onClick={handleOpen}
//             sx={{ 
//               backgroundColor: '#FFD700', 
//               color: '#000', 
//               borderRadius: 2,
//               '&:hover': {
//                       backgroundColor: '#FFE452',
//                     },
//              }}
//           >
//             Add Candidate
//           </Button>
//         </Box>

//         <TextField
//           fullWidth
//           placeholder="Search name"
//           variant="outlined"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           sx={{ mb: 3 }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             ),
//           }}
//         />

//         {/* <TableContainer sx={{ borderRadius: 2 }}> */}
//         <TableContainer
//           sx={{
//             borderRadius: 2,
//             maxHeight: 340,
//             overflowY: 'auto',
//           }}
//         >
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
//                 <TableCell><strong>Photo</strong></TableCell>
//                 <TableCell><strong>Name</strong></TableCell>
//                 <TableCell><strong>Position</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredCandidates.map((candidate) => (
//                 <TableRow
//                   key={candidate.id}
//                   sx={{
//                     backgroundColor: candidate.id % 2 === 0 ? '#FAFAFA' : ''
//                   }}
//                 >
//                   <TableCell>
//                     <Avatar
//                       alt={candidate.name}
//                       src={candidate.photo || "https://randomuser.me/api/portraits/women/44.jpg"}
//                     />
//                   </TableCell>
//                   <TableCell>{candidate.name}</TableCell>
//                   <TableCell>{candidate.position}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* Modal */}
//         <Dialog open={open} onClose={handleClose}>
//           <DialogTitle>Enter Candidate Details</DialogTitle>
//           <DialogContent>
//             <TextField
//               label="Name"
//               name="name"
//               fullWidth
//               margin="dense"
//               value={formData.name}
//               onChange={handleChange}
//             />
//             <TextField
//               label="Position"
//               name="position"
//               fullWidth
//               margin="dense"
//               value={formData.position}
//               onChange={handleChange}
//             />
//             <Button
//               variant="outlined"
//               component="label"
//               fullWidth
//               sx={{ mt: 2 }}
//             >
//               Upload Photo
//               <input
//                 type="file"
//                 accept="image/*"
//                 hidden
//                 onChange={handleImageUpload}
//               />
//             </Button>

//             {formData.photo && (
//               <Box display="flex" justifyContent="center" mt={2}>
//                 <Avatar
//                   src={formData.photo}
//                   alt="Candidate Preview"
//                   sx={{ width: 80, height: 80 }}
//                 />
//               </Box>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button
//               fullWidth
//               variant="contained"
//               sx={{ 
//                 backgroundColor: '#FFD700', 
//                 color: '#000', 
//                 pt: 2, 
//                 pb: 2,
//                 '&:hover': {
//                       backgroundColor: '#FFE452',
//                     },
//                }}
//               onClick={handleSubmit}
//             >
//               Submit
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </AdminLayout>
//   );
// }





// // components/admin/ViewCandidates.js
// import React, { useState, useEffect } from 'react';
// import { Container, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
// import API from '../../api/axios';

// export default function ViewCandidates() {
//   const [candidates, setCandidates] = useState([]);

//   useEffect(() => {
//     const fetchCandidates = async () => {
//       try {
//         const response = await API.get('/aspirants');
//         setCandidates(response.data); 
//       } catch (error) {
//         console.error('Error fetching candidates:', error);
//       }
//     };

//     fetchCandidates();
//   }, []);

//   return (
//     <Container maxWidth="sm">
//       <Typography variant="h5" mt={4} mb={2}>All Candidates</Typography>
//       <Paper>
//         <List>
//           {candidates.length > 0 ? (
//             candidates.map((candidate, index) => (
//               <ListItem key={index}>
//                 <ListItemText
//                   primary={candidate.name}
//                   secondary={`Position: ${candidate.position}`}
//                 />
//               </ListItem>
//             ))
//           ) : (
//             <Typography align="center" p={2}>No candidates available</Typography>
//           )}
//         </List>
//       </Paper>
//     </Container>
//   );
// }





// import React from 'react';
// import { Container, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

// const dummyCandidates = [
//     { id: 1, name: 'Anthony Sport', position: 'Sport Prefect' },
//     { id: 2, name: 'Kolade', position: 'Sport Prefect' },
//     { id: 3, name: 'Blessing Metron', position: 'Hostel Prefect (Girls)' },
//     { id: 4, name: 'Blessing Nurse', position: 'Hostel Prefect (Girls)' },
//     { id: 5, name: 'Uko Daniel', position: 'Hostel Prefect (Boys)' },
//     { id: 6, name: 'Mosses', position: 'Hostel Prefect (Boys)' },
//     { id: 7, name: 'Adediran Briget', position: 'Head Girl' },
//     { id: 8, name: 'Ogechi', position: 'Head Girl' },
//     { id: 9, name: 'George Ibit', position: 'Head Boy' },
//     { id: 10, name: 'Barnabas Ngor', position: 'Head Boy' },
// ];

// export default function ViewCandidates() {
//   return (
//     <Container maxWidth="sm">
//       <Typography variant="h5" mt={4} mb={2}>All Candidates</Typography>
//       <Paper>
//         <List>
//           {dummyCandidates.map((candidate, index) => (
//             <ListItem key={index}>
//               <ListItemText primary={candidate.name} secondary={`Position: ${candidate.position}`} />
//             </ListItem>
//           ))}
//         </List>
//       </Paper>
//     </Container>
//   );
// }




// import React, { useState } from 'react';
// import {
//   Box,
//   Container,
//   Typography,
//   TextField,
//   InputAdornment,
//   Button,
//   Avatar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import { useNavigate } from 'react-router-dom';

// const dummyCandidates = [
//   { id: 1, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect' },
//   { id: 2, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect' },
//   { id: 3, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect' },
//   { id: 4, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect' },
//   { id: 5, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect' },
//   { id: 6, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect' },
// ];

// export default function ViewCandidates() {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState('');

//   const filteredCandidates = dummyCandidates.filter((candidate) =>
//     candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Container maxWidth="lg">
//       <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
//         <Typography variant="h6" fontWeight="bold">Candidates</Typography>
//         <Button
//           variant="contained"
//           onClick={() => navigate('/add-candidate')}
//           sx={{ backgroundColor: '#FFD700', color: '#000', borderRadius: 2 }}
//         >
//           Add Candidate
//         </Button>
//       </Box>

//       <TextField
//         fullWidth
//         placeholder="Search name"
//         variant="outlined"
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         sx={{ mb: 3 }}
//         InputProps={{
//           startAdornment: (
//             <InputAdornment position="start">
//               <SearchIcon />
//             </InputAdornment>
//           ),
//         }}
//       />

//       <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell><strong>Photo</strong></TableCell>
//               <TableCell><strong>Name</strong></TableCell>
//               <TableCell><strong>Position</strong></TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredCandidates.map((candidate) => (
//               <TableRow key={candidate.id}>
//                 <TableCell>
//                   <Avatar
//                     alt={candidate.name}
//                     src="https://randomuser.me/api/portraits/women/44.jpg" // Example static photo
//                   />
//                 </TableCell>
//                 <TableCell>{candidate.name}</TableCell>
//                 <TableCell>{candidate.position}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Container>
//   );
// }
