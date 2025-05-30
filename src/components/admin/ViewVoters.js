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
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import AdminLayout from '../layout/AdminLayout';
import { supabase } from '../../supabaseClient';

export default function ViewVoters() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', class: '', serial_number: '' });
  const [voters, setVoters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchVoters = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('voters').select('*');
      if (error) {
        console.error('Error fetching voters:', error);
        showSnackbar('Failed to load voters.', 'error');
      } else {
        setVoters(data);
      }
      setLoading(false);
    };

    fetchVoters();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setFormData({ name: '', class: '', serial_number: '' });
    setOpen(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const exists = voters.some(v => v.serial_number === formData.serial_number);
    if (exists) {
      showSnackbar('A voter with this serial number already exists.', 'warning');
      return;
    }

    setAdding(true);
    const { data, error } = await supabase
      .from('voters')
      .insert([{
        fullname: formData.name,
        class_name: formData.class,
        serial_number: formData.serial_number
      }])
      .select();

    setAdding(false);

    if (error) {
      console.error('Error adding voter:', error);
      showSnackbar('Failed to add voter.', 'error');
    } else {
      setVoters(prev => [...prev, ...data]);
      showSnackbar('Voter added successfully.', 'success');
      handleClose();
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
      const content = e.target.result;
      const lines = content.split('\n').map(line => line.trim()).filter(line => line !== '');

      const parsedVoters = lines.map((line, index) => {
        const [name, cls, serial] = line.split(',').map(cell => cell?.trim());
        if (!name || !cls || !serial) {
          console.warn(`Invalid CSV format at line ${index + 1}`);
          return null;
        }
        return {
          fullname: name,
          class_name: cls,
          serial_number: serial
        };
      }).filter(Boolean);

      const existingSerials = new Set(voters.map(v => v.serial_number));
      const newVoters = parsedVoters.filter(v => !existingSerials.has(v.serial_number));

      if (newVoters.length === 0) {
        showSnackbar('All uploaded voters already exist.', 'warning');
        return;
      }

      setUploadingCSV(true);
      const { data, error } = await supabase.from('voters').insert(newVoters).select();
      setUploadingCSV(false);

      if (error) {
        console.error('Bulk upload failed:', error);
        showSnackbar('Bulk upload failed.', 'error');
      } else {
        setVoters(prev => [...prev, ...data]);
        showSnackbar(`${data.length} voter(s) uploaded successfully.`, 'success');
      }
    };

    reader.readAsText(file);
  };

  const filteredVoters = voters.filter(v =>
    v.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Voters</Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            placeholder="Search name"
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

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              component="label"
              disabled={uploadingCSV}
              sx={{
                border: '1px solid #002345',
                color: '#000',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F9F9F6' }
              }}
            >
              <>
                {uploadingCSV && (
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                )}
                {uploadingCSV ? 'Uploading...' : 'Upload Voters'}
              </>
              {/* {uploadingCSV ? 'Uploading...' : 'Upload Voters'} */}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CircularProgress size={24} color="inherit" />
                  </TableCell>
                </TableRow>
                // <TableRow>
                //   <TableCell colSpan={3} align="center">
                //     Loading voters...
                //   </TableCell>
                // </TableRow>
              ) : filteredVoters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No voters found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVoters.map((voter, i) => (
                  <TableRow
                    key={voter.serial_number}
                    sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
                  >
                    <TableCell>{voter.fullname}</TableCell>
                    <TableCell>{voter.class_name}</TableCell>
                    <TableCell>{voter.serial_number}</TableCell>
                  </TableRow>
                ))
              )}
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
            name="serial_number"
            fullWidth
            margin="dense"
            value={formData.serial_number}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            variant="contained"
            disabled={adding}
            sx={{ backgroundColor: '#FFD700', color: '#000', pt: 2, pb: 2 }}
            onClick={handleSubmit}
            startIcon={adding && <CircularProgress size={20} color="inherit" />}
          >
            {adding ? 'Adding...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Component */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </AdminLayout>
  );
}




// export default function ViewVoters() {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ name: '', class: '', serial_number: '' });
//   const [voters, setVoters] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);             // For initial data load
//   const [adding, setAdding] = useState(false);              // For single voter add
//   const [uploadingCSV, setUploadingCSV] = useState(false);  // For bulk upload

//   // Fetch from Supabase
//   const fetchVoters = async () => {
//     setLoading(true);
//     const { data, error } = await supabase.from('voters').select('*');
//     if (error) {
//       console.error('Error fetching voters:', error);
//     } else {
//       setVoters(data);
//     }
//     setLoading(false);
//   };
//   // const fetchVoters = async () => {
//   //   const { data, error } = await supabase.from('voters').select('*');
//   //   if (error) {
//   //     console.error('Error fetching voters:', error);
//   //   } else {
//   //     setVoters(data);
//   //   }
//   // };

//   useEffect(() => {
//     fetchVoters();
//   }, []);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ name: '', class: '', serial_number: '' });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async () => {
//     const exists = voters.some(v => v.serial_number === formData.serial_number);
//     if (exists) {
//       alert('A voter with this serial number already exists.');
//       return;
//     }

//     setAdding(true);
//     const { data, error } = await supabase
//       .from('voters')
//       .insert([
//         {
//           fullname: formData.name,
//           class_name: formData.class,
//           serial_number: formData.serial_number
//         }
//       ])
//       .select();

//     if (error) {
//       console.error('Error adding voter:', error);
//       alert('Failed to add voter.');
//     } else {
//       setVoters(prev => [...prev, ...data]); // data is now always an array
//       handleClose();
//     }
//   };

//   const handleCSVUpload = (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = async function (e) {
//     const content = e.target.result;
//     const lines = content
//       .split('\n')
//       .map(line => line.trim())
//       .filter(line => line !== '');

//     const parsedVoters = lines.map((line, index) => {
//       const [name, cls, serial] = line.split(',').map(cell => cell?.trim());
//       if (!name || !cls || !serial) {
//         console.warn(`Invalid CSV format at line ${index + 1}`);
//         return null;
//       }
//       return {
//         fullname: name,
//         class_name: cls,
//         serial_number: serial
//       };
//     }).filter(Boolean);

//     // Filter duplicates already in DB
//     const existingSerials = new Set(voters.map(v => v.serial_number));
//     const newVoters = parsedVoters.filter(v => !existingSerials.has(v.serial_number));

//     if (newVoters.length === 0) {
//       alert('All uploaded voters already exist.');
//       return;
//     }

//     setUploadingCSV(true);
//       const { data, error } = await supabase.from('voters').insert(newVoters).select();
//       setUploadingCSV(false);

//     try {
//       const { data, error } = await supabase
//         .from('voters')
//         .insert(newVoters)
//         .select(); // fetch inserted rows

//       if (error) {
//         console.error('Error inserting bulk voters:', error);
//         alert('Bulk upload failed.');
//       } else {
//         setVoters(prev => [...prev, ...data]);
//         alert(`${data.length} voter(s) uploaded successfully.`);
//       }
//     } catch (err) {
//       console.error('Unexpected error during CSV upload:', err);
//       alert('An unexpected error occurred.');
//     }
//   };

//   reader.readAsText(file);
// };

//   const filteredVoters = voters.filter(v =>
//     v.fullname.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6" fontWeight="bold" mb={2}>Voters</Typography>

//         <Box display="flex" justifyContent="space-between" mb={2}>
//           <TextField
//             placeholder="Search name"
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

//           <Box display="flex" gap={2}>
//             <Button
//               variant="outlined"
//               component="label"
//               disabled={uploadingCSV}
//               sx={{
//                 border: '1px solid #002345',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#F9F9F6' }
//               }}
//             >
//               {uploadingCSV ? 'Uploading...' : 'Upload Voters'}
//               <input
//                 type="file"
//                 accept=".csv"
//                 hidden
//                 onChange={handleCSVUpload}
//               />
//             </Button>

//             <Button
//               variant="contained"
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#FFE452' }
//               }}
//               onClick={handleOpen}
//             >
//               Add Voter
//             </Button>
//           </Box>
//         </Box>

//         <TableContainer sx={{ borderRadius: 2, maxHeight: 380, overflowY: 'auto' }}>
//           <Table stickyHeader>
//             <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
//               <TableRow>
//                 <TableCell><strong>Name</strong></TableCell>
//                 <TableCell><strong>Class</strong></TableCell>
//                 <TableCell><strong>Serial Number</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={3} align="center">
//                     <CircularProgress size={24} />
//                     <Typography variant="body2" mt={1}>Loading voters...</Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : filteredVoters.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={3} align="center">
//                     No voters found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredVoters.map((voter, i) => (
//                   <TableRow
//                     key={voter.serial_number}
//                     sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
//                   >
//                     <TableCell>{voter.fullname}</TableCell>
//                     <TableCell>{voter.class_name}</TableCell>
//                     <TableCell>{voter.serial_number}</TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         {/* <TableContainer sx={{ borderRadius: 2, maxHeight: 380, overflowY: 'auto' }}>
//           <Table stickyHeader>
//             <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
//               <TableRow>
//                 <TableCell><strong>Name</strong></TableCell>
//                 <TableCell><strong>Class</strong></TableCell>
//                 <TableCell><strong>Serial Number</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredVoters.map((voter, i) => (
//                 <TableRow
//                   key={voter.serial_number}
//                   sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
//                 >
//                   <TableCell>{voter.fullname}</TableCell>
//                   <TableCell>{voter.class_name}</TableCell>
//                   <TableCell>{voter.serial_number}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer> */}
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
//             name="serial_number"
//             fullWidth
//             margin="dense"
//             value={formData.serial_number}
//             onChange={handleChange}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button
//             fullWidth
//             variant="contained"
//             disabled={adding}
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               pt: 2,
//               pb: 2,
//               '&:hover': { backgroundColor: '#FFE452' },
//             }}
//             onClick={handleSubmit}
//           >
//             {adding ? 'Adding...' : 'Submit'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </AdminLayout>
//   );
// }





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
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

// export default function ViewVoters() {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ name: '', class: '', serial: '' });
//   const [voters, setVoters] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   const API_BASE = 'http://127.0.0.1:5000'; // Update with your actual backend URL

//   // Fetch voters from API
//   const fetchVoters = async () => {
//     try {
//       const res = await axios.get(API_BASE);
//       setVoters(res.data);
//     } catch (err) {
//       console.error('Error fetching voters:', err);
//     }
//   };

//   useEffect(() => {
//     fetchVoters();
//   }, []);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ name: '', class: '', serial: '' });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async () => {
//     const exists = voters.some(v => v.serial === formData.serial);
//     if (exists) {
//       alert('A voter with this serial number already exists.');
//       return;
//     }

//     try {
//       const res = await axios.post('/voters', formData);
//       setVoters(prev => [...prev, res.data]);
//       handleClose();
//     } catch (err) {
//       console.error('Error adding voter:', err);
//       alert('Failed to add voter.');
//     }
//   };

//   const handleCSVUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = async function (e) {
//       const content = e.target.result;
//       const lines = content.split('\n').filter(line => line.trim() !== '');

//       const newVoters = lines.map((line, index) => {
//         const [name, cls, serial] = line.split(',').map(str => str?.trim());
//         if (!name || !cls || !serial) {
//           console.warn(`Invalid format at line ${index + 1}`);
//           return null;
//         }
//         return { name, class: cls, serial };
//       }).filter(Boolean);

//       // Prevent duplicates using serial numbers
//       const existingSerials = new Set(voters.map(v => v.serial));
//       const uniqueNewVoters = newVoters.filter(v => !existingSerials.has(v.serial));

//       if (uniqueNewVoters.length === 0) {
//         alert('All uploaded voters already exist.');
//       } else {
//         try {
//           await axios.post(`${API_BASE}/bulk`, { voters: uniqueNewVoters }); // Make sure your backend supports this route
//           setVoters(prev => [...prev, ...uniqueNewVoters]);
//           alert(`${uniqueNewVoters.length} new voter(s) added successfully.`);
//         } catch (error) {
//           console.error('Bulk upload failed:', error);
//           alert('Bulk upload failed.');
//         }
//       }
//     };

//     reader.readAsText(file);
//   };

//   const filteredVoters = voters.filter(v =>
//     v.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6" fontWeight="bold" mb={2}>Voters</Typography>

//         <Box display="flex" justifyContent="space-between" mb={2}>
//           <TextField
//             placeholder="Search name"
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

//           <Box display="flex" gap={2}>
//             <Button
//               variant="outlined"
//               component="label"
//               sx={{
//                 border: '1px solid #002345',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#F9F9F6' }
//               }}
//             >
//               Upload Voters
//               <input
//                 type="file"
//                 accept=".csv"
//                 hidden
//                 onChange={handleCSVUpload}
//               />
//             </Button>

//             <Button
//               variant="contained"
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#FFE452' }
//               }}
//               onClick={handleOpen}
//             >
//               Add Voter
//             </Button>
//           </Box>
//         </Box>

//         <TableContainer sx={{ borderRadius: 2, maxHeight: 380, overflowY: 'auto' }}>
//           <Table stickyHeader>
//             <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
//               <TableRow>
//                 <TableCell><strong>Name</strong></TableCell>
//                 <TableCell><strong>Class</strong></TableCell>
//                 <TableCell><strong>Serial Number</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredVoters.map((voter, i) => (
//                 <TableRow
//                   key={i}
//                   sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
//                 >
//                   <TableCell>{voter.name}</TableCell>
//                   <TableCell>{voter.class}</TableCell>
//                   <TableCell>{voter.serial}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
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
//         </DialogContent>
//         <DialogActions>
//           <Button
//             fullWidth
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               pt: 2,
//               pb: 2,
//               '&:hover': { backgroundColor: '#FFE452' },
//             }}
//             onClick={handleSubmit}
//           >
//             Submit
//           </Button>
//         </DialogActions>
//       </Dialog>
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

// const initialVoters = [
//   { name: 'Adeleke Hussein Chidinma Sapphire', class: 'Upper class 1', serial: 'S/22/0045' },
// ];

// export default function ViewVoters() {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = useState({ name: '', class: '', serial: '' });
//   const [voters, setVoters] = useState(initialVoters);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => {
//     setFormData({ name: '', class: '', serial: '' });
//     setOpen(false);
//   };

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = () => {
//   const exists = voters.some(v => v.serial === formData.serial);
//   if (exists) {
//     alert('A voter with this serial number already exists.');
//     return;
//   }
//   setVoters(prev => [...prev, formData]);
//   handleClose();
// };

//   // const handleSubmit = () => {
//   //   setVoters(prev => [...prev, formData]);
//   //   handleClose();
//   // };

//   const handleCSVUpload = (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const reader = new FileReader();
//   reader.onload = function (e) {
//     const content = e.target.result;
//     const lines = content.split('\n').filter(line => line.trim() !== '');

//     const newVoters = lines.map((line, index) => {
//       const [name, cls, serial] = line.split(',').map(str => str?.trim());
//       if (!name || !cls || !serial) {
//         console.warn(`Invalid format at line ${index + 1}`);
//         return null;
//       }
//       return { name, class: cls, serial };
//     }).filter(Boolean);

//     // Prevent duplicates using serial numbers
//     const existingSerials = new Set(voters.map(v => v.serial));
//     const uniqueNewVoters = newVoters.filter(v => !existingSerials.has(v.serial));

//     if (uniqueNewVoters.length === 0) {
//       alert('All uploaded voters already exist.');
//     } else {
//       setVoters(prev => [...prev, ...uniqueNewVoters]);
//       alert(`${uniqueNewVoters.length} new voter(s) added successfully.`);
//     }
//   };
//   reader.readAsText(file);
// };

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

//           <Box display="flex" gap={2}>
//             <Button
//               // variant="contained"
//               variant="outlined"
//               component="label"
//               sx={{
//                 border: '1px solid #002345',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#F9F9F6' }
//               }}
//             >
//               Upload Voters
//               <input
//                 type="file"
//                 accept=".csv"
//                 hidden
//                 onChange={handleCSVUpload}
//               />
//             </Button>

//             <Button
//               variant="contained"
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#FFE452' }
//               }}
//               onClick={handleOpen}
//             >
//               Add Voter
//             </Button>
//           </Box>
//         </Box>

//         <TableContainer sx={{ borderRadius: 2, maxHeight: 380, overflowY: 'auto' }}>
//           <Table stickyHeader>
//             <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
//               <TableRow>
//                 <TableCell><strong>Name</strong></TableCell>
//                 <TableCell><strong>Class</strong></TableCell>
//                 <TableCell><strong>Serial Number</strong></TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {voters.map((voter, i) => (
//                 <TableRow
//                   key={i}
//                   sx={{ backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' }}
//                 >
//                   <TableCell>{voter.name}</TableCell>
//                   <TableCell>{voter.class}</TableCell>
//                   <TableCell>{voter.serial}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
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
//         </DialogContent>
//         <DialogActions>
//           <Button
//             fullWidth
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               pt: 2,
//               pb: 2,
//               '&:hover': {
//                 backgroundColor: '#FFE452',
//               },
//             }}
//             onClick={handleSubmit}
//           >
//             Submit
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </AdminLayout>
//   );
// }





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
