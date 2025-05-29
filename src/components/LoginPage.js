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





// import React, { useState, useContext } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import Logo from '../assets/BSA_logo.png';
// import LoginImage from '../assets/bg-img2.png';
// import { AuthContext } from '../context/AuthContext';

// export default function Login() {
//   const [serialNumber, setSerialNumber] = useState('');
//   const [openModal, setOpenModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { login, user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!serialNumber.trim()) {
//       alert('Please enter a serial number.');
//       return;
//     }

//     setLoading(true);
//     const success = await login(serialNumber);
//     setLoading(false);

//     if (success) {
//       setOpenModal(true);
//     } else {
//       alert('Invalid serial number.');
//     }
//   };

//   const handleGoToDashboard = () => {
//     setOpenModal(false);
//     if (user?.role === 'admin') {
//       navigate('/dashboard');
//     } else if (user?.role === 'voter') {
//       console.log('user.id:', user?.id);
//       navigate('/dashboard');
//     } else {
//       navigate('/');
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex' }}>
//       {/* Left side image */}
//       <Box
//         sx={{
//           width: '50%',
//           display: { xs: 'none', md: 'block' },
//           backgroundImage: `url(${LoginImage})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       />

//       {/* Right side form */}
//       <Box
//         sx={{
//           width: { xs: '100%', md: '50%' },
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#fff',
//           p: 3,
//         }}
//       >
//         <Paper
//           elevation={3}
//           sx={{
//             width: '100%',
//             maxWidth: 400,
//             p: 4,
//             borderRadius: 4,
//             textAlign: 'center',
//           }}
//         >
//           <Box mb={2}>
//             <img src={Logo} alt="Logo" style={{ width: 50, marginBottom: 10 }} />
//             <Typography variant="subtitle1" fontWeight="bold">
//               Britarch Schools, Abuja
//             </Typography>
//             <Typography variant="body2" sx={{ mb: 2 }}>
//               Election Portal
//             </Typography>
//           </Box>

//           <Typography variant="h6" fontWeight="600" align="left" mb={2}>
//             Login
//           </Typography>

//           <form onSubmit={handleSubmit}>
//             <TextField
//               fullWidth
//               label="Serial Number"
//               placeholder="Enter serial number"
//               variant="outlined"
//               value={serialNumber}
//               onChange={(e) => setSerialNumber(e.target.value)}
//               sx={{ mb: 3 }}
//               disabled={loading}
//             />

//             {loading ? (
//               <Box display="flex" justifyContent="center" alignItems="center" py={1.5}>
//                 <CircularProgress size={24} sx={{ color: '#FFD700' }} />
//                 <Typography ml={2} fontSize={14}>
//                   Verifying...
//                 </Typography>
//               </Box>
//             ) : (
//               <Button
//                 fullWidth
//                 variant="contained"
//                 type="submit"
//                 sx={{
//                   backgroundColor: '#FFD700',
//                   color: '#000',
//                   fontWeight: 'bold',
//                   py: 1.5,
//                   borderRadius: 2,
//                   '&:hover': {
//                     backgroundColor: '#FFEB3B',
//                   },
//                 }}
//               >
//                 Verify ID
//               </Button>
//             )}
//           </form>
//         </Paper>
//       </Box>

//       {/* Success Modal */}
//       <Dialog
//         open={openModal}
//         onClose={handleGoToDashboard}
//         maxWidth="xs"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 4,
//             textAlign: 'center',
//             py: 4,
//             px: 3,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 'bold' }}>
//           {user?.fullname || user?.name || 'Verified'}
//         </DialogTitle>
//         <DialogContent>
//           <Typography sx={{ mb: 3 }}>You have been verified</Typography>
//         </DialogContent>
//         <DialogActions sx={{ justifyContent: 'center' }}>
//           <Button
//             onClick={handleGoToDashboard}
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               fontWeight: 'bold',
//               borderRadius: '24px',
//               px: 4,
//               py: 1.5,
//               '&:hover': {
//                 backgroundColor: '#FFEB3B',
//               },
//             }}
//           >
//             Go to Dashboard
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }






// import React, { useState, useContext } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import Logo from '../assets/BSA_logo.png';
// import LoginImage from '../assets/bg-img2.png';
// import { AuthContext } from '../context/AuthContext';

// export default function Login() {
//   const [serialNumber, setSerialNumber] = useState('');
//   const [openModal, setOpenModal] = useState(false);
//   const { login, user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!serialNumber.trim()) {
//       alert('Please enter a serial number.');
//       return;
//     }

//     const success = await login(serialNumber);
//     if (success) {
//       setOpenModal(true);
//     } else {
//       alert('Invalid serial number.');
//     }
//   };

//   const handleGoToDashboard = () => {
//     setOpenModal(false);

//     if (user?.role === 'admin') {
//       navigate('/dashboard');
//     } else if (user?.role === 'voter') {
//       console.log('user.id:', user?.id)
//       navigate('/dashboard');
//     } else {
//       navigate('/'); // fallback
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex' }}>
//       {/* Left side image */}
//       <Box
//         sx={{
//           width: '50%',
//           display: { xs: 'none', md: 'block' },
//           backgroundImage: `url(${LoginImage})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       />

//       {/* Right side form */}
//       <Box
//         sx={{
//           width: { xs: '100%', md: '50%' },
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#fff',
//           p: 3,
//         }}
//       >
//         <Paper
//           elevation={3}
//           sx={{
//             width: '100%',
//             maxWidth: 400,
//             p: 4,
//             borderRadius: 4,
//             textAlign: 'center',
//           }}
//         >
//           <Box mb={2}>
//             <img src={Logo} alt="Logo" style={{ width: 50, marginBottom: 10 }} />
//             <Typography variant="subtitle1" fontWeight="bold">
//               Britarch Schools, Abuja
//             </Typography>
//             <Typography variant="body2" sx={{ mb: 2 }}>
//               Election Portal
//             </Typography>
//           </Box>

//           <Typography variant="h6" fontWeight="600" align="left" mb={2}>
//             Login
//           </Typography>

//           <form onSubmit={handleSubmit}>
//             <TextField
//               fullWidth
//               label="Serial Number"
//               placeholder="Enter serial number"
//               variant="outlined"
//               value={serialNumber}
//               onChange={(e) => setSerialNumber(e.target.value)}
//               sx={{ mb: 3 }}
//             />

//             <Button
//               fullWidth
//               variant="contained"
//               type="submit"
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 fontWeight: 'bold',
//                 py: 1.5,
//                 borderRadius: 2,
//                 '&:hover': {
//                   backgroundColor: '#FFEB3B',
//                 },
//               }}
//             >
//               Verify ID
//             </Button>
//           </form>
//         </Paper>
//       </Box>

//       {/* Success Modal */}
//       <Dialog
//         open={openModal}
//         onClose={handleGoToDashboard}
//         maxWidth="xs"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 4,
//             textAlign: 'center',
//             py: 4,
//             px: 3,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 'bold' }}>
//           {user?.fullname || user?.name || 'Verified'}
//         </DialogTitle>
//         <DialogContent>
//           <Typography sx={{ mb: 3 }}>You have been verified</Typography>
//         </DialogContent>
//         <DialogActions sx={{ justifyContent: 'center' }}>
//           <Button
//             onClick={handleGoToDashboard}
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               fontWeight: 'bold',
//               borderRadius: '24px',
//               px: 4,
//               py: 1.5,
//               '&:hover': {
//                 backgroundColor: '#FFEB3B',
//               },
//             }}
//           >
//             Go to Dashboard
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }





// import React, { useState, useContext } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import Logo from '../assets/BSA_logo.png';
// import LoginImage from '../assets/bg-img2.png';
// import { AuthContext } from '../context/AuthContext';
// import { supabase } from '../supabaseClient';

// export default function Login() {
//   const [serialNumber, setSerialNumber] = useState('');
//   const [openModal, setOpenModal] = useState(false);
//   const [error, setError] = useState('');
//   const { setUser } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!serialNumber.trim()) {
//       setError('Please enter your serial number.');
//       return;
//     }

//     // Lookup voter by serial_number
//     const { data, error } = await supabase
//       .from('voters')
//       .select('*')
//       .eq('serial_number', serialNumber.trim())
//       .single();

//     if (error || !data) {
//       setError('Invalid serial number.');
//       return;
//     }

//     setUser(data); // Save voter info to context
//     setOpenModal(true);
//   };

//   const handleGoToDashboard = () => {
//     setOpenModal(false);
//     navigate('/dashboard');
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex' }}>
//       <Box
//         sx={{
//           width: '50%',
//           display: { xs: 'none', md: 'block' },
//           backgroundImage: `url(${LoginImage})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       />

//       <Box
//         sx={{
//           width: { xs: '100%', md: '50%' },
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#fff',
//           p: 3,
//         }}
//       >
//         <Paper
//           elevation={3}
//           sx={{
//             width: '100%',
//             maxWidth: 400,
//             p: 4,
//             borderRadius: 4,
//             textAlign: 'center',
//           }}
//         >
//           <Box mb={2}>
//             <img src={Logo} alt="Logo" style={{ width: 50, marginBottom: 10 }} />
//             <Typography variant="subtitle1" fontWeight="bold">
//               Britarch Schools, Abuja
//             </Typography>
//             <Typography variant="body2" sx={{ mb: 2 }}>
//               Election Portal
//             </Typography>
//           </Box>

//           <Typography variant="h6" fontWeight="600" align="left" mb={2}>
//             Login
//           </Typography>

//           <form onSubmit={handleSubmit}>
//             <TextField
//               fullWidth
//               label="Serial Number"
//               placeholder="Enter your serial number"
//               variant="outlined"
//               value={serialNumber}
//               onChange={(e) => setSerialNumber(e.target.value)}
//               sx={{ mb: 3 }}
//             />

//             {error && (
//               <Typography color="error" variant="body2" mb={2}>
//                 {error}
//               </Typography>
//             )}

//             <Button
//               fullWidth
//               variant="contained"
//               type="submit"
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 fontWeight: 'bold',
//                 py: 1.5,
//                 borderRadius: 2,
//                 '&:hover': {
//                   backgroundColor: '#FFEB3B',
//                 },
//               }}
//             >
//               Verify ID
//             </Button>
//           </form>
//         </Paper>
//       </Box>

//       {/* Success Modal */}
//       <Dialog
//         open={openModal}
//         onClose={handleGoToDashboard}
//         maxWidth="xs"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 4,
//             textAlign: 'center',
//             py: 4,
//             px: 3,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 'bold' }}>
//           Verified
//         </DialogTitle>
//         <DialogContent>
//           <Typography sx={{ mb: 3 }}>
//             You have been verified and logged in as a voter.
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ justifyContent: 'center' }}>
//           <Button
//             onClick={handleGoToDashboard}
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               fontWeight: 'bold',
//               borderRadius: '24px',
//               px: 4,
//               py: 1.5,
//               '&:hover': {
//                 backgroundColor: '#FFEB3B',
//               },
//             }}
//           >
//             Go to Dashboard
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }





// import React, { useState, useContext } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import Logo from '../assets/BSA_logo.png';
// import LoginImage from '../assets/bg-img2.png';
// import { AuthContext } from '../context/AuthContext';

// export default function Login() {
//   const [serialNumber, setSerialNumber] = useState('');
//   const [openModal, setOpenModal] = useState(false);
//   const { login, user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!serialNumber.trim()) {
//       alert('Please enter a serial number.');
//       return;
//     }

//     const success = await login(serialNumber);

//     if (success) {
//       setOpenModal(true);
//     } else {
//       alert('Invalid serial number.');
//     }
//   };

//   const handleGoToDashboard = () => {
//     setOpenModal(false);
//     navigate('/dashboard');
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex' }}>
//       {/* Left side image */}
//       <Box
//         sx={{
//           width: '50%',
//           display: { xs: 'none', md: 'block' },
//           backgroundImage: `url(${LoginImage})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       />

//       {/* Right side form */}
//       <Box
//         sx={{
//           width: { xs: '100%', md: '50%' },
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#fff',
//           p: 3,
//         }}
//       >
//         <Paper
//           elevation={3}
//           sx={{
//             width: '100%',
//             maxWidth: 400,
//             p: 4,
//             borderRadius: 4,
//             textAlign: 'center',
//           }}
//         >
//           <Box mb={2}>
//             <img src={Logo} alt="Logo" style={{ width: 50, marginBottom: 10 }} />
//             <Typography variant="subtitle1" fontWeight="bold">
//               Britarch Schools, Abuja
//             </Typography>
//             <Typography variant="body2" sx={{ mb: 2 }}>
//               Election Portal
//             </Typography>
//           </Box>

//           <Typography variant="h6" fontWeight="600" align="left" mb={2}>
//             Login
//           </Typography>

//           <form onSubmit={handleSubmit}>
//             <TextField
//               fullWidth
//               label="Serial Number"
//               placeholder="Enter serial number"
//               variant="outlined"
//               value={serialNumber}
//               onChange={(e) => setSerialNumber(e.target.value)}
//               sx={{ mb: 3 }}
//             />

//             <Button
//               fullWidth
//               variant="contained"
//               type="submit"
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 fontWeight: 'bold',
//                 py: 1.5,
//                 borderRadius: 2,
//                 '&:hover': {
//                   backgroundColor: '#FFEB3B',
//                 },
//               }}
//             >
//               Verify ID
//             </Button>
//           </form>
//         </Paper>
//       </Box>

//       {/* Success Modal */}
//       <Dialog
//         open={openModal}
//         onClose={handleGoToDashboard}
//         maxWidth="xs"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 4,
//             textAlign: 'center',
//             py: 4,
//             px: 3,
//           },
//         }}
//       >
//         <DialogTitle sx={{ fontWeight: 'bold' }}>
//           {user?.name || 'Verified User'}
//         </DialogTitle>
//         <DialogContent>
//           <Typography sx={{ mb: 3 }}>You have been verified</Typography>
//         </DialogContent>
//         <DialogActions sx={{ justifyContent: 'center' }}>
//           <Button
//             onClick={handleGoToDashboard}
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               fontWeight: 'bold',
//               borderRadius: '24px',
//               px: 4,
//               py: 1.5,
//               '&:hover': {
//                 backgroundColor: '#FFEB3B',
//               },
//             }}
//           >
//             Go to Dashboard
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }





// import React, { useState, useContext } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Paper
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import Logo from '../assets/BSA_logo.png';
// import LoginImage from '../assets/bg-img.png';
// import { AuthContext } from '../context/AuthContext';

// export default function Login() {
//   const [serialNumber, setSerialNumber] = useState('');
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!serialNumber.trim()) {
//       alert('Please enter a serial number.');
//       return;
//     }

//     const success = await login(serialNumber);

//     if (success) {
//       navigate('/dashboard');
//     } else {
//       alert('Invalid serial number.');
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex' }}>
//       {/* Left side image */}
//       <Box
//         sx={{
//           width: '50%',
//           display: { xs: 'none', md: 'block' },
//           backgroundImage: `url(${LoginImage})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       />

//       {/* Right side form */}
//       <Box
//         sx={{
//           width: { xs: '100%', md: '50%' },
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#fff',
//           p: 3,
//         }}
//       >
//         <Paper
//           elevation={3}
//           sx={{
//             width: '100%',
//             maxWidth: 400,
//             p: 4,
//             borderRadius: 4,
//             textAlign: 'center',
//           }}
//         >
//           <Box mb={2}>
//             <img src={Logo} alt="Logo" style={{ width: 50, marginBottom: 10 }} />
//             <Typography variant="subtitle1" fontWeight="bold">
//               Britarch Schools, Abuja
//             </Typography>
//             <Typography variant="body2" sx={{ mb: 2 }}>
//               Election Portal
//             </Typography>
//           </Box>

//           <Typography variant="h6" fontWeight="600" align="left" mb={2}>
//             Login
//           </Typography>

//           {/* Wrap form elements in a <form> */}
//           <form onSubmit={handleSubmit}>
//             <TextField
//               fullWidth
//               label="Serial Number"
//               placeholder="Enter serial number"
//               variant="outlined"
//               value={serialNumber}
//               onChange={(e) => setSerialNumber(e.target.value)}
//               sx={{ mb: 3 }}
//             />

//             <Button
//               fullWidth
//               variant="contained"
//               type="submit"
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 fontWeight: 'bold',
//                 py: 1.5,
//                 borderRadius: 2,
//                 '&:hover': {
//                   backgroundColor: '#FFEB3B',
//                 },
//               }}
//             >
//               Verify ID
//             </Button>
//           </form>
//         </Paper>
//       </Box>
//     </Box>
//   );
// }





// import React, { useState, useContext } from 'react';
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Paper
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import Logo from '../assets/BSA_logo.png';
// import LoginImage from '../assets/bg-img.png';
// import { AuthContext } from '../context/AuthContext';

// export default function Login() {
//   const [serialNumber, setSerialNumber] = useState('');
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async () => {
//     if (!serialNumber.trim()) {
//       alert('Please enter a serial number.');
//       return;
//     }

//     const success = await login(serialNumber);

//     if (success) {
//       navigate('/dashboard');
//     } else {
//       alert('Invalid serial number.');
//     }
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex' }}>
//       {/* Left side image */}
//       <Box
//         sx={{
//           width: '50%',
//           display: { xs: 'none', md: 'block' },
//           backgroundImage: `url(${LoginImage})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       />

//       {/* Right side form */}
//       <Box
//         sx={{
//           width: { xs: '100%', md: '50%' },
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#fff',
//           p: 3,
//         }}
//       >
//         <Paper
//           elevation={3}
//           sx={{
//             width: '100%',
//             maxWidth: 400,
//             p: 4,
//             borderRadius: 4,
//             textAlign: 'center',
//           }}
//         >
//           <Box mb={2}>
//             <img src={Logo} alt="Logo" style={{ width: 50, marginBottom: 10 }} />
//             <Typography variant="subtitle1" fontWeight="bold">
//               Britarch Schools, Abuja
//             </Typography>
//             <Typography variant="body2" sx={{ mb: 2 }}>
//               Election Portal
//             </Typography>
//           </Box>

//           <Typography variant="h6" fontWeight="600" align="left" mb={2}>
//             Login
//           </Typography>

//           <TextField
//             fullWidth
//             label="Serial Number"
//             placeholder="Enter serial number"
//             variant="outlined"
//             value={serialNumber}
//             onChange={(e) => setSerialNumber(e.target.value)}
//             sx={{ mb: 3 }}
//           />

//           <Button
//             fullWidth
//             variant="contained"
//             onClick={handleSubmit}
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               fontWeight: 'bold',
//               py: 1.5,
//               borderRadius: 2,
//               '&:hover': {
//                 backgroundColor: '#FFEB3B',
//               },
//             }}
//           >
//             Verify ID
//           </Button>
//         </Paper>
//       </Box>
//     </Box>
//   );
// }





// import React from 'react';
// import {
//   Box,
//   // Grid,
//   Typography,
//   TextField,
//   Button,
//   Paper
// } from '@mui/material';
// import Logo from '../assets/BSA_logo.png';
// import LoginImage from '../assets/bg-img.png';

// export default function Login() {
//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex' }}>
//       {/* Left side image */}
//       <Box
//         sx={{
//           width: '50%',
//           display: { xs: 'none', md: 'block' },
//           backgroundImage: `url(${LoginImage})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       />

//       {/* Right side form */}
//       <Box
//         sx={{
//           width: { xs: '100%', md: '50%' },
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           backgroundColor: '#fff',
//           p: 3,
//         }}
//       >
//         <Paper
//           elevation={3}
//           sx={{
//             width: '100%',
//             maxWidth: 400,
//             p: 4,
//             borderRadius: 4,
//             textAlign: 'center',
//           }}
//         >
//           <Box mb={2}>
//             <img src={Logo} alt="Logo" style={{ width: 50, marginBottom: 10 }} />
//             <Typography variant="subtitle1" fontWeight="bold">
//               Britarch Schools, Abuja
//             </Typography>
//             <Typography variant="body2" sx={{ mb: 2 }}>
//               Election Portal
//             </Typography>
//           </Box>

//           <Typography variant="h6" fontWeight="600" align="left" mb={2}>
//             Login
//           </Typography>

//           <TextField
//             fullWidth
//             label="Serial Number"
//             placeholder="Enter serial number"
//             variant="outlined"
//             sx={{ mb: 3 }}
//           />

//           <Button
//             fullWidth
//             variant="contained"
//             sx={{
//               backgroundColor: '#FFD700',
//               color: '#000',
//               fontWeight: 'bold',
//               py: 1.5,
//               borderRadius: 2,
//               '&:hover': {
//                 backgroundColor: '#FFEB3B',
//               },
//             }}
//           >
//             Verify ID
//           </Button>
//         </Paper>
//       </Box>
//     </Box>
//   );
// }





// import React, { useState, useContext } from 'react';
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import BgImg from '../assets/bg-img.png';  // ✅ Your background image
// import Logo from '../assets/BSA_logo.png';     // ✅ Your logo image

// export default function LoginPage() {
//   const [serialNumber, setSerialNumber] = useState('');
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const success = await login(serialNumber);
//     if (success) navigate('/dashboard');
//   };

//   return (
//     <Grid container sx={{ minHeight: '100vh' }}>
//       {/* Left image side */}
//       <Grid item xs={12} md={6}>
//         <Box
//           sx={{
//             height: '100vh',
//             width: '100%',
//             backgroundImage: `url(${BgImg})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat',
//           }}
//         />
//       </Grid>

//       {/* Right login side */}
//       <Grid
//         item
//         xs={12}
//         md={6}
//         display="flex"
//         alignItems="center"
//         justifyContent="center"
//         sx={{ backgroundColor: '#fdfdfd' }}
//       >
//         <Card sx={{ width: '80%', maxWidth: 400, boxShadow: 3 }}>
//           <CardContent>
//             <Box display="flex" justifyContent="center" mb={2}>
//               <img
//                 src={Logo}
//                 alt="School Logo"
//                 style={{ width: 50, height: 50, objectFit: 'contain' }}
//               />
//             </Box>
//             <Typography variant="h6" align="center" gutterBottom>
//               Britarch Schools, Abuja<br />
//               Election Portal
//             </Typography>

//             <Typography variant="subtitle1" gutterBottom>
//               Login
//             </Typography>

//             <form onSubmit={handleSubmit}>
//               <TextField
//                 fullWidth
//                 label="Serial Number"
//                 margin="normal"
//                 value={serialNumber}
//                 onChange={(e) => setSerialNumber(e.target.value)}
//                 required
//               />
//               <Button
//                 fullWidth
//                 type="submit"
//                 variant="contained"
//                 sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}
//               >
//                 Verify ID
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   );
// }




// import React, { useState, useContext } from 'react';
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   Button
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import BgImg from '../assets/bg-img.png';
// import Logo from '../assets/BSA_logo.png';

// export default function LoginPage() {
//   const [serialNumber, setSerialNumber] = useState('');
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const success = await login(serialNumber); // Mocked for now
//     if (success) navigate('/dashboard');
//   };

//   return (
//     // <Grid container sx={{ minHeight: '100vh' }}>
//     <Grid container sx={{ minHeight: '100vh' }}>
//   {/* Left image side */}
//   <Grid item xs={12} md={6}>
//     <Box
//       sx={{
//         height: '100%',
//         backgroundImage: `url(${BgImg})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         backgroundRepeat: 'no-repeat',
//       }}
//     />
//   </Grid>

//   {/* Right login side */}
//   <Grid
//     item
//     xs={12}
//     md={6}
//     display="flex"
//     alignItems="center"
//     justifyContent="center"
//     sx={{ backgroundColor: '#fdfdfd' }}
//   >
//     <Card sx={{ width: '80%', maxWidth: 400, boxShadow: 3 }}>
//       <CardContent>
//         <Box display="flex" justifyContent="center" mb={2}>
//           <img
//             src={Logo}
//             alt="School Logo"
//             style={{ width: 50, height: 50, objectFit: 'contain' }}
//           />
//         </Box>
//         <Typography variant="h6" align="center" gutterBottom>
//           Britarch Schools, Abuja<br />
//           Election Portal
//         </Typography>

//         <Typography variant="subtitle1" gutterBottom>
//           Login
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           <TextField
//             fullWidth
//             label="Serial Number"
//             margin="normal"
//             value={serialNumber}
//             onChange={(e) => setSerialNumber(e.target.value)}
//             required
//           />
//           <Button
//             fullWidth
//             type="submit"
//             variant="contained"
//             sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}
//           >
//             Verify ID
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   </Grid>
// </Grid>

//     // <Grid item xs={12} md={6} sx={{ height: '100vh' }}>
//     //   {/* Left image side */}
//     //   <Grid item xs={12} md={6}>
//     //     <Box
//     //       sx={{
//     //         height: '100%',
//     //         backgroundImage: `url(${BgImg})`, // 📸 Replace with your local image path
//     //         backgroundSize: 'cover',
//     //         backgroundPosition: 'center',
//     //         backgroundRepeat: 'no-repeat',
//     //       }}
//     //       >
//     //         <img src={BgImg} alt="test" style={{ width: 50, height: 50 }} />
//     //     </Box>
//     //   </Grid>

//     //   {/* Right login side */}
//     //   <Grid
//     //     item
//     //     xs={12}
//     //     md={6}
//     //     display="flex"
//     //     alignItems="center"
//     //     justifyContent="center"
//     //     sx={{ backgroundColor: '#fdfdfd' }}
//     //   >
//     //     <Card sx={{ width: '80%', maxWidth: 400, boxShadow: 3 }}>
//     //       <CardContent>
//     //         <Box display="flex" justifyContent="center" mb={2}>
//     //         {/* <img src={BgImg} alt="test" style={{ width: '100%' }} /> */}

//     //           <img
//     //             src={Logo} // 🛡️ Replace with your school logo path
//     //             alt="School Logo"
//     //             style={{ width: 50, height: 50, objectFit: 'contain' }}
//     //           />
//     //         </Box>
//     //         <Typography variant="h6" align="center" gutterBottom>
//     //           Britarch Schools, Abuja<br />
//     //           Election Portal
//     //         </Typography>

//     //         <Typography variant="subtitle1" gutterBottom>
//     //           Login
//     //         </Typography>

//     //         <form onSubmit={handleSubmit}>
//     //           <TextField
//     //             fullWidth
//     //             label="Serial Number"
//     //             margin="normal"
//     //             value={serialNumber}
//     //             onChange={(e) => setSerialNumber(e.target.value)}
//     //             required
//     //           />
//     //           <Button
//     //             fullWidth
//     //             type="submit"
//     //             variant="contained"
//     //             sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}
//     //           >
//     //             Verify ID
//     //           </Button>
//     //         </form>
//     //       </CardContent>
//     //     </Card>
//     //   </Grid>
//     // </Grid>
//   );
// }






// // components/LoginPage.js
// import React, { useContext, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Container, TextField, Button, Typography, Box } from '@mui/material';
// import { AuthContext } from '../context/AuthContext';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const success = await login(email, password);
//     if (success) navigate('/dashboard');
//   };

//   return (
//     <Container maxWidth="xs">
//       <Box mt={10}>
//         <Typography variant="h4" align="center">Login</Typography>
//         <form onSubmit={handleSubmit}>
//           <TextField
//             fullWidth
//             margin="normal"
//             label="Student ID or Email"
//             variant="outlined"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <TextField
//             fullWidth
//             margin="normal"
//             label="Password"
//             type="password"
//             variant="outlined"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <Button fullWidth type="submit" variant="contained" color="primary">
//             Login
//           </Button>
//         </form>
//       </Box>
//     </Container>
//   );
// }
