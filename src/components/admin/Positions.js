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

const dummyVoters = [
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
  { Position: 'Head Boy', NumberOfCandidates: '5' },
];

export default function Positions() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ Position: '', NumberOfCandidates: '', serial: '' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setFormData({ Position: '', class: '', serial: '' })
    setOpen(false);
   };
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    console.log('New Position:', formData);
    handleClose();
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Positions</Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            placeholder="Search position"
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
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: '#FFD700', 
              color: '#000',
            '&:hover': {
                      backgroundColor: '#FFE452',
                    },}}
            onClick={handleOpen}
          >
            Create Position
          </Button>
        </Box>
      <TableContainer
          sx={{
            borderRadius: 2,
            maxHeight: 380,
            overflowY: 'auto'
          }}
        >
        <Table stickyHeader>
          <TableHead sx={{ backgroundColor: '#FAFAFA' }}>
            <TableRow>
              <TableCell><strong>Position</strong></TableCell>
              <TableCell><strong>Number of Candidates</strong></TableCell>
              {/* <TableCell><strong>Serial Number</strong></TableCell> */}
            </TableRow>
          </TableHead>

          <TableBody>
            {dummyVoters.map((voter, i) => (
              <TableRow
                key={i}
                sx={{
                  backgroundColor: i % 2 === 0 ? '' : '#FAFAFA' // alternate light backgrounds
                }}
              >
                <TableCell>{voter.Position}</TableCell>
                <TableCell>{voter.NumberOfCandidates}</TableCell>
                {/* <TableCell>{voter.serial}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter Voting Position</DialogTitle>
        <DialogContent>
          <TextField
            label="Position"
            name="Position"
            fullWidth
            margin="dense"
            value={formData.Position}
            onChange={handleChange}
          />
          {/* <TextField
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
          /> */}
        <DialogActions>
          <Button
            fullWidth
            margin="dense"
            variant="contained"
            sx={{ 
              backgroundColor: '#FFD700', 
              color: '#000', 
              pt: 2, 
              pb: 2,
            '&:hover': {
                      backgroundColor: '#FFE452',
                    }, }}
            onClick={handleSubmit}
          >
            Create
          </Button>
        </DialogActions>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
