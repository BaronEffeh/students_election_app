import React, { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AdminLayout from '../layout/AdminLayout';

const initialVoters = [
  { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
];

export default function ViewVoters() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', class: '', serial: '' });
  const [voters, setVoters] = useState(initialVoters);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setFormData({ name: '', class: '', serial: '' });
    setOpen(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
  const exists = voters.some(v => v.serial === formData.serial);
  if (exists) {
    alert('A voter with this serial number already exists.');
    return;
  }
  setVoters(prev => [...prev, formData]);
  handleClose();
};

  // const handleSubmit = () => {
  //   setVoters(prev => [...prev, formData]);
  //   handleClose();
  // };

  const handleCSVUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    const lines = content.split('\n').filter(line => line.trim() !== '');

    const newVoters = lines.map((line, index) => {
      const [name, cls, serial] = line.split(',').map(str => str?.trim());
      if (!name || !cls || !serial) {
        console.warn(`Invalid format at line ${index + 1}`);
        return null;
      }
      return { name, class: cls, serial };
    }).filter(Boolean);

    // Prevent duplicates using serial numbers
    const existingSerials = new Set(voters.map(v => v.serial));
    const uniqueNewVoters = newVoters.filter(v => !existingSerials.has(v.serial));

    if (uniqueNewVoters.length === 0) {
      alert('All uploaded voters already exist.');
    } else {
      setVoters(prev => [...prev, ...uniqueNewVoters]);
      alert(`${uniqueNewVoters.length} new voter(s) added successfully.`);
    }
  };
  reader.readAsText(file);
};

  // const handleCSVUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = function (e) {
  //     const content = e.target.result;
  //     const lines = content.split('\n').filter(line => line.trim() !== '');
  //     const parsed = lines.map((line, index) => {
  //       const [name, cls, serial] = line.split(',').map(str => str?.trim());
  //       if (!name || !cls || !serial) {
  //         console.warn(`Invalid CSV format at line ${index + 1}`);
  //         return null;
  //       }
  //       return { name, class: cls, serial };
  //     }).filter(Boolean); // Remove nulls

  //     setVoters(prev => [...prev, ...parsed]);
  //   };
  //   reader.readAsText(file);
  // };

  return (
    <AdminLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Voters</Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            placeholder="Search name"
            size="small"
            sx={{ width: '60%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <Box display="flex" gap={2}>
            <Button
              // variant="contained"
              variant="outlined"
              component="label"
              sx={{
                border: '1px solid #002345',
                color: '#000',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F9F9F6' }
              }}
            >
              Upload Voters
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleCSVUpload}
              />
            </Button>

            <Button
              variant="contained"
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#FFE452' }
              }}
              onClick={handleOpen}
            >
              Add Voter
            </Button>
          </Box>
        </Box>

        <TableContainer sx={{ borderRadius: 2, maxHeight: 380, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Class</strong></TableCell>
                <TableCell><strong>Serial Number</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {voters.map((voter, i) => (
                <TableRow
                  key={i}
                  sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
                >
                  <TableCell>{voter.name}</TableCell>
                  <TableCell>{voter.class}</TableCell>
                  <TableCell>{voter.serial}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Voter Details</DialogTitle>
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
            label="Class"
            name="class"
            fullWidth
            margin="dense"
            value={formData.class}
            onChange={handleChange}
          />
          <TextField
            label="Serial Number"
            name="serial"
            fullWidth
            margin="dense"
            value={formData.serial}
            onChange={handleChange}
          />
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
    </AdminLayout>
  );
}





// components/admin/ViewVoters.js
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
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
// ];

// export default function ViewVoters() {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ name: '', class: '', serial: '' });

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ name: '', class: '', serial: '' })
//     setOpen(false);
//    };
//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = () => {
//     console.log('New Voter:', formData);
//     handleClose();
//   };

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6" fontWeight="bold" mb={2}>Voters</Typography>

//         <Box display="flex" justifyContent="space-between" mb={2}>
//           <TextField
//             placeholder="Search name"
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
//             Add Voter
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
//               <TableCell><strong>Name</strong></TableCell>
//               <TableCell><strong>Class</strong></TableCell>
//               <TableCell><strong>Serial Number</strong></TableCell>
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
//                 <TableCell>{voter.name}</TableCell>
//                 <TableCell>{voter.class}</TableCell>
//                 <TableCell>{voter.serial}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//         </TableContainer>
//       </Box>

//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Enter Voter Details</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Name"
//             name="name"
//             fullWidth
//             margin="dense"
//             value={formData.name}
//             onChange={handleChange}
//           />
//           <TextField
//             label="Class"
//             name="class"
//             fullWidth
//             margin="dense"
//             value={formData.class}
//             onChange={handleChange}
//           />
//           <TextField
//             label="Serial Number"
//             name="serial"
//             fullWidth
//             margin="dense"
//             value={formData.serial}
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
//             Submit
//           </Button>
//         </DialogActions>
//         </DialogContent>
//       </Dialog>
//     </AdminLayout>
//   );
// }





// // components/admin/ViewVoters.js
// import React from 'react';
// import { Container, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

// const dummyVoters = [
//   { name: 'Student One', class: 'MC1' },
//   { name: 'Student Two', class: 'MC2' },
//   { name: 'Student Three', class: 'MC3' },
//   { name: 'Student Four', class: 'UC1' },
//   { name: 'Student Five', class: 'UC2' },
// ];

// export default function ViewVoters() {
//   return (
//     <Container maxWidth="sm">
//       <Typography variant="h5" mt={4} mb={2}>All Voters</Typography>
//       <Paper>
//         <List>
//           {dummyVoters.map((voter, index) => (
//             <ListItem key={index}>
//               <ListItemText primary={voter.name} secondary={voter.class} />
//             </ListItem>
//           ))}
//         </List>
//       </Paper>
//     </Container>
//   );
// }
