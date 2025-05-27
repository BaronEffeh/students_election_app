import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AdminLayout from '../layout/AdminLayout';
import { supabase } from '../../supabaseClient';

export default function Positions() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ position: '' });
  const [positions, setPositions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch positions and count candidates per position
  const fetchPositions = async () => {
  setLoading(true);

  // Fetch all positions
  const { data: positionData, error: posError } = await supabase
    .from('positions')
    .select('*');

  if (posError) {
    console.error('Error fetching positions:', posError);
    setLoading(false);
    return;
  }

  // Fetch all candidates (use 'positions' as the field name)
  const { data: candidates, error: candError } = await supabase
    .from('candidates')
    .select('positions');

  if (candError) {
    console.error('Error fetching candidates:', candError);
    setLoading(false);
    return;
  }

  // Count candidates per position
  const countMap = {};
  candidates.forEach(c => {
    const key = c.positions; // 👈 match the field name in Supabase
    if (key) {
      countMap[key] = (countMap[key] || 0) + 1;
    }
  });

  // Merge counts into positions
  const enrichedPositions = positionData.map(pos => ({
    ...pos,
    number_of_candidates: countMap[pos.position] || 0
  }));

  setPositions(enrichedPositions);
  setLoading(false);
};

  // const fetchPositions = async () => {
  //   setLoading(true);

  //   const { data: positionData, error: posError } = await supabase
  //     .from('positions')
  //     .select('*');

  //   if (posError) {
  //     console.error('Error fetching positions:', posError);
  //     setLoading(false);
  //     return;
  //   }

  //   const { data: candidates, error: candError } = await supabase
  //     .from('candidates')
  //     .select('position');

  //   if (candError) {
  //     console.error('Error fetching candidates:', candError);
  //     setLoading(false);
  //     return;
  //   }

  //   // Count candidates per position
  //   const countMap = {};
  //   candidates.forEach((c) => {
  //     if (c.position) {
  //       countMap[c.position] = (countMap[c.position] || 0) + 1;
  //     }
  //   });

  //   const enriched = positionData.map((pos) => ({
  //     ...pos,
  //     number_of_candidates: countMap[pos.position] || 0
  //   }));

  //   setPositions(enriched);
  //   setLoading(false);
  // };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setFormData({ position: '' });
    setOpen(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.position.trim()) {
      setSnackbar({ open: true, message: 'Position is required', severity: 'warning' });
      return;
    }

    setCreating(true);
    const { error } = await supabase
      .from('positions')
      .insert([{ position: formData.position.trim() }]);

    setCreating(false);

    if (error) {
      console.error('Error creating position:', error);
      setSnackbar({ open: true, message: 'Failed to create position', severity: 'error' });
    } else {
      setSnackbar({ open: true, message: 'Position created successfully', severity: 'success' });
      handleClose();
      await fetchPositions(); // refresh after insert
    }
  };

  const filteredPositions = positions.filter((p) =>
    p.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Positions
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            placeholder="Search position"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: '60%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              '&:hover': { backgroundColor: '#FFE452' }
            }}
            onClick={handleOpen}
          >
            Create Position
          </Button>
        </Box>

        {loading ? (
          <Box textAlign="center" mt={5}>
            <CircularProgress size={32} />
            <Typography mt={2}>Loading positions...</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: 2, maxHeight: 380, overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
                <TableRow>
                  <TableCell><strong>Position</strong></TableCell>
                  <TableCell><strong>Number of Candidates</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPositions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2}>No positions found.</TableCell>
                  </TableRow>
                ) : (
                  filteredPositions.map((pos, i) => (
                    <TableRow
                      key={pos.id || `${pos.position}-${i}`}
                      sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
                    >
                      <TableCell>{pos.position}</TableCell>
                      <TableCell>{pos.number_of_candidates}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Dialog for Create Position */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Voting Position</DialogTitle>
        <DialogContent>
          <TextField
            label="Position"
            name="position"
            fullWidth
            margin="dense"
            value={formData.position}
            onChange={handleChange}
          />
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
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
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
    </AdminLayout>
  );
}





// import React, { useState, useEffect } from 'react';
// import {
//   Typography,
//   Box,
//   Button,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   InputAdornment,
//   CircularProgress,
//   Snackbar,
//   Alert
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import AdminLayout from '../layout/AdminLayout';
// import { supabase } from '../../supabaseClient';

// export default function Positions() {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ position: '' });
//   const [positions, setPositions] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   // Fetch positions and count candidates per position
//   const fetchPositions = async () => {
//     setLoading(true);

//     // Fetch all positions
//     const { data: positionData, error: posError } = await supabase
//       .from('positions')
//       .select('*');

//     if (posError) {
//       console.error('Error fetching positions:', posError);
//       setLoading(false);
//       return;
//     }

//     // Fetch all candidates
//     const { data: candidates, error: candError } = await supabase
//       .from('candidates')
//       .select('position');

//     if (candError) {
//       console.error('Error fetching candidates:', candError);
//       setLoading(false);
//       return;
//     }

//     // Count candidates per position
//     const countMap = {};
//     candidates.forEach(c => {
//       const key = c.position;
//       countMap[key] = (countMap[key] || 0) + 1;
//     });

//     // Merge counts into positions
//     const enrichedPositions = positionData.map(pos => ({
//       ...pos,
//       number_of_candidates: countMap[pos.position] || 0
//     }));

//     setPositions(enrichedPositions);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchPositions();
//   }, []);

//   const handleOpen = () => setOpen(true);

//   const handleClose = () => {
//     setFormData({ position: '' });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async () => {
//     if (!formData.position.trim()) {
//       setSnackbar({ open: true, message: 'Position is required', severity: 'warning' });
//       return;
//     }

//     setCreating(true);
//     const { error } = await supabase
//       .from('positions')
//       .insert([{ position: formData.position.trim() }]);

//     setCreating(false);

//     if (error) {
//       console.error('Error creating position:', error);
//       setSnackbar({ open: true, message: 'Failed to create position', severity: 'error' });
//     } else {
//       setSnackbar({ open: true, message: 'Position created successfully', severity: 'success' });
//       handleClose();
//       fetchPositions();
//     }
//   };

//   const filteredPositions = positions.filter(p =>
//     p.position.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6" fontWeight="bold" mb={2}>Positions</Typography>

//         <Box display="flex" justifyContent="space-between" mb={2}>
//           <TextField
//             placeholder="Search position"
//             size="small"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             sx={{ width: '60%' }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               )
//             }}
//           />
//           <Button
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               '&:hover': { backgroundColor: '#FFE452' }
//             }}
//             onClick={handleOpen}
//           >
//             Create Position
//           </Button>
//         </Box>

//         {loading ? (
//           <Box textAlign="center" mt={5}>
//             <CircularProgress size={32} />
//             <Typography mt={2}>Loading positions...</Typography>
//           </Box>
//         ) : (
//           <TableContainer sx={{ borderRadius: 2, maxHeight: 380, overflowY: 'auto' }}>
//             <Table stickyHeader>
//               <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
//                 <TableRow>
//                   <TableCell><strong>Position</strong></TableCell>
//                   <TableCell><strong>Number of Candidates</strong></TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredPositions.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={2}>No positions found.</TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredPositions.map((pos, i) => (
//                     <TableRow
//                       key={pos.id || pos.position}
//                       sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
//                     >
//                       <TableCell>{pos.position}</TableCell>
//                       <TableCell>{pos.number_of_candidates}</TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}
//       </Box>

//       {/* Dialog for Create Position */}
//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Enter Voting Position</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Position"
//             name="position"
//             fullWidth
//             margin="dense"
//             value={formData.position}
//             onChange={handleChange}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button
//             fullWidth
//             variant="contained"
//             disabled={creating}
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               pt: 2,
//               pb: 2,
//               '&:hover': { backgroundColor: '#FFE452' }
//             }}
//             onClick={handleSubmit}
//           >
//             {creating ? 'Creating...' : 'Create'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar Notification */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={5000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </AdminLayout>
//   );
// }






// import React, { useState, useEffect } from 'react';
// import {
//   Typography,
//   Box,
//   Button,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   InputAdornment,
//   CircularProgress,
//   Snackbar,
//   Alert
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import AdminLayout from '../layout/AdminLayout';
// import { supabase } from '../../supabaseClient';

// export default function Positions() {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ position: '', number_of_candidates: '' });
//   const [positions, setPositions] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

//   const fetchPositions = async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from('positions').select('*');
//     if (error) {
//       console.error('Error fetching positions:', error);
//     } else {
//       setPositions(data);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchPositions();
//   }, []);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ position: '', number_of_candidates: '' });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async () => {
//     if (!formData.position || !formData.number_of_candidates) {
//       setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
//       return;
//     }

//     setCreating(true);
//     const { data, error } = await supabase
//       .from('positions')
//       .insert([{
//         position: formData.position,
//         number_of_candidates: parseInt(formData.number_of_candidates)
//       }])
//       .select();

//     setCreating(false);

//     if (error) {
//       console.error('Error creating position:', error);
//       setSnackbar({ open: true, message: 'Failed to create position', severity: 'error' });
//     } else {
//       setPositions(prev => [...prev, ...data]);
//       setSnackbar({ open: true, message: 'Position created successfully', severity: 'success' });
//       handleClose();
//     }
//   };

//   const filteredPositions = positions.filter(p =>
//     p.position.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6" fontWeight="bold" mb={2}>Positions</Typography>

//         <Box display="flex" justifyContent="space-between" mb={2}>
//           <TextField
//             placeholder="Search position"
//             size="small"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             sx={{ width: '60%' }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               )
//             }}
//           />
//           <Button
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               '&:hover': { backgroundColor: '#FFE452' }
//             }}
//             onClick={handleOpen}
//           >
//             Create Position
//           </Button>
//         </Box>

//         {loading ? (
//           <Box textAlign="center" mt={5}>
//             <CircularProgress size={32} />
//             <Typography mt={2}>Loading positions...</Typography>
//           </Box>
//         ) : (
//           <TableContainer sx={{ borderRadius: 2, maxHeight: 380, overflowY: 'auto' }}>
//             <Table stickyHeader>
//               <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
//                 <TableRow>
//                   <TableCell><strong>Position</strong></TableCell>
//                   <TableCell><strong>Number of Candidates</strong></TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {filteredPositions.map((pos, i) => (
//                   <TableRow
//                     key={pos.id}
//                     sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
//                   >
//                     <TableCell>{pos.position}</TableCell>
//                     <TableCell>{pos.number_of_candidates}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}
//       </Box>

//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Enter Voting Position</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Position"
//             name="position"
//             fullWidth
//             margin="dense"
//             value={formData.position}
//             onChange={handleChange}
//           />
//           <TextField
//             label="Number of Candidates"
//             name="number_of_candidates"
//             type="number"
//             fullWidth
//             margin="dense"
//             value={formData.number_of_candidates}
//             onChange={handleChange}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button
//             fullWidth
//             variant="contained"
//             disabled={creating}
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               pt: 2,
//               pb: 2,
//               '&:hover': { backgroundColor: '#FFE452' }
//             }}
//             onClick={handleSubmit}
//           >
//             {creating ? 'Creating...' : 'Create'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar for feedback */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </AdminLayout>
//   );
// }





// import React, { useState } from 'react';
// import {
//   Typography,
//   Box,
//   Button,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   InputAdornment
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import AdminLayout from '../layout/AdminLayout';

// const dummyVoters = [
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
//   { Position: 'Head Boy', NumberOfCandidates: '5' },
// ];

// export default function Positions() {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ Position: '', NumberOfCandidates: '', serial: '' });

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ Position: '', class: '', serial: '' })
//     setOpen(false);
//    };
//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = () => {
//     console.log('New Position:', formData);
//     handleClose();
//   };

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6" fontWeight="bold" mb={2}>Positions</Typography>

//         <Box display="flex" justifyContent="space-between" mb={2}>
//           <TextField
//             placeholder="Search position"
//             size="small"
//             sx={{ width: '60%' }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               )
//             }}
//           />
//           <Button
//             variant="contained"
//             sx={{ 
//               backgroundColor: '#FFD700', 
//               color: '#000',
//             '&:hover': {
//                       backgroundColor: '#FFE452',
//                     },}}
//             onClick={handleOpen}
//           >
//             Create Position
//           </Button>
//         </Box>
//       <TableContainer
//           sx={{
//             borderRadius: 2,
//             maxHeight: 380,
//             overflowY: 'auto'
//           }}
//         >
//         <Table stickyHeader>
//           <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
//             <TableRow>
//               <TableCell><strong>Position</strong></TableCell>
//               <TableCell><strong>Number of Candidates</strong></TableCell>
//               {/* <TableCell><strong>Serial Number</strong></TableCell> */}
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {dummyVoters.map((voter, i) => (
//               <TableRow
//                 key={i}
//                 sx={{
//                   backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' // alternate light backgrounds
//                 }}
//               >
//                 <TableCell>{voter.Position}</TableCell>
//                 <TableCell>{voter.NumberOfCandidates}</TableCell>
//                 {/* <TableCell>{voter.serial}</TableCell> */}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//         </TableContainer>
//       </Box>

//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Enter Voting Position</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Position"
//             name="Position"
//             fullWidth
//             margin="dense"
//             value={formData.Position}
//             onChange={handleChange}
//           />
//         <DialogActions>
//           <Button
//             fullWidth
//             margin="dense"
//             variant="contained"
//             sx={{ 
//               backgroundColor: '#FFD700', 
//               color: '#000', 
//               pt: 2, 
//               pb: 2,
//             '&:hover': {
//                       backgroundColor: '#FFE452',
//                     }, }}
//             onClick={handleSubmit}
//           >
//             Create
//           </Button>
//         </DialogActions>
//         </DialogContent>
//       </Dialog>
//     </AdminLayout>
//   );
// }
