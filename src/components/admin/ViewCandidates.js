import React, { useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
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
  // Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const dummyCandidates = [
  { id: 1, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
  { id: 2, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
  { id: 3, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
  { id: 4, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
  { id: 5, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
  { id: 6, name: 'Adeleke Hussein Chidinma Sapphire', position: 'Laboratory Prefect', photo: '' },
];

export default function ViewCandidates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', position: '', photo: null });
  const [candidates, setCandidates] = useState(dummyCandidates);

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setFormData({ name: '', position: '', photo: null });
    setOpen(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, photo: imageUrl });
    }
  };

  const handleSubmit = () => {
    const newCandidate = {
      id: candidates.length + 1,
      ...formData,
    };
    setCandidates([...candidates, newCandidate]);
    handleClose();
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" height="100vh" overflowY="none">
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Typography variant="h6" fontWeight="bold">Candidates</Typography>
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{ 
              backgroundColor: '#FFD700', 
              color: '#000', 
              borderRadius: 2,
              '&:hover': {
                      backgroundColor: '#FFE452',
                    },
             }}
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

        {/* <TableContainer sx={{ borderRadius: 2 }}> */}
        <TableContainer
          sx={{
            borderRadius: 2,
            maxHeight: 340,
            overflowY: 'auto',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
                <TableCell><strong>Photo</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  sx={{
                    backgroundColor: candidate.id % 2 === 0 ? '#FAFAFA' : ''
                  }}
                >
                  <TableCell>
                    <Avatar
                      alt={candidate.name}
                      src={candidate.photo || "https://randomuser.me/api/portraits/women/44.jpg"}
                    />
                  </TableCell>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* <TableContainer
          sx={{
            borderRadius: 2,
            maxHeight: 400, // adjust as needed
            overflowY: 'auto'
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
              <TableRow>
                <TableCell><strong>Photo</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}
                  sx={{
                    backgroundColor: candidate.id % 2 === 0 ? '#FAFAFA' : ''
                  }}
                >
                  <TableCell>
                    <Avatar
                      alt={candidate.name}
                      src={candidate.photo || "https://randomuser.me/api/portraits/women/44.jpg"}
                    />
                  </TableCell>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer> */}

        {/* Modal */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Enter Candidate Details</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="dense"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              label="Position"
              name="position"
              fullWidth
              margin="dense"
              value={formData.position}
              onChange={handleChange}
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </Button>

            {formData.photo && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Avatar
                  src={formData.photo}
                  alt="Candidate Preview"
                  sx={{ width: 80, height: 80 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              fullWidth
              variant="contained"
              sx={{ 
                backgroundColor: '#FFD700', 
                color: '#000', 
                pt: 2, 
                pb: 2,
                '&:hover': {
                      backgroundColor: '#FFE452',
                    },
               }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}





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
