import React, { useState, useEffect, useContext } from 'react';
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





// import React, { useState, useEffect, useContext } from 'react';
// import {
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Divider
// } from '@mui/material';
// import AdminLayout from '../layout/AdminLayout';
// import { ElectionContext } from '../../context/ElectionContext';

// export default function ManageElection() {
//   const [electionDate, setElectionDate] = useState('');
//   const [electionTime, setElectionTime] = useState('');
//   const [duration, setDuration] = useState(''); // in minutes
//   const [countdown, setCountdown] = useState('');
//   const [processCountdown, setProcessCountdown] = useState('');

//   const {
//     electionDateTime,
//     setElectionDateTime,
//     processEndTime,
//     setProcessEndTime
//   } = useContext(ElectionContext);

//   // Countdown to election start
//   useEffect(() => {
//     let timer;
//     if (electionDateTime) {
//       timer = setInterval(() => {
//         const now = new Date().getTime();
//         const distance = new Date(electionDateTime).getTime() - now;

//         if (distance <= 0) {
//           clearInterval(timer);
//           setCountdown('00D : 00H : 00M : 00S');
//         } else {
//           const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//           const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//           const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//           const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//           setCountdown(
//             `${String(days).padStart(2, '0')}D : ${String(hours).padStart(2, '0')}H : ${String(minutes).padStart(2, '0')}M : ${String(seconds).padStart(2, '0')}S`
//           );
//         }
//       }, 1000);
//     }

//     return () => clearInterval(timer);
//   }, [electionDateTime]);

//   // Countdown for election process duration
//   useEffect(() => {
//     let processTimer;
//     if (processEndTime) {
//       processTimer = setInterval(() => {
//         const now = new Date().getTime();
//         const distance = new Date(processEndTime).getTime() - now;

//         if (distance <= 0) {
//           clearInterval(processTimer);
//           setProcessCountdown('00D : 00H : 00M : 00S');
//         } else {
//           const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//           const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//           const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//           const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//           setProcessCountdown(
//             `${String(days).padStart(2, '0')}D : ${String(hours).padStart(2, '0')}H : ${String(minutes).padStart(2, '0')}M : ${String(seconds).padStart(2, '0')}S`
//           );
//         }
//       }, 1000);
//     }

//     return () => clearInterval(processTimer);
//   }, [processEndTime]);

//   const handleSetElectionDate = () => {
//     if (!electionDate || !electionTime) {
//       alert('Please enter both date and time.');
//       return;
//     }
//     const fullDateTime = `${electionDate}T${electionTime}`;
//     setElectionDateTime(fullDateTime);
//     alert(`Election date set to ${fullDateTime}`);
//   };

//   const handleStartElection = () => {
//     if (!duration || isNaN(duration)) {
//       alert('Please enter a valid duration in minutes.');
//       return;
//     }
//     const now = new Date();
//     const endTime = new Date(now.getTime() + Number(duration) * 60000);
//     setProcessEndTime(endTime.toISOString());
//     alert(`Election process started for ${duration} minutes.`);
//   };

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h6" fontWeight="bold" mb={1}>
//           Manage Elections
//         </Typography>
//         <Divider sx={{ mb: 3 }} />

//         {/* Set Election Date */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//           mb={2}
//         >
//           <Typography sx={{ minWidth: 160 }}>Set Election Date</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="date"
//               size="small"
//               value={electionDate}
//               onChange={(e) => setElectionDate(e.target.value)}
//             />
//             <TextField
//               type="time"
//               size="small"
//               value={electionTime}
//               onChange={(e) => setElectionTime(e.target.value)}
//             />
//             <Button
//               variant="contained"
//               onClick={handleSetElectionDate}
//               sx={{
//                 backgroundColor: '#F5F5F5',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#e0e0e0' }
//               }}
//             >
//               Set
//             </Button>
//           </Box>
//         </Box>

//         {electionDateTime && (
//           <Typography variant="body1" fontWeight="bold" mt={1} mb={3}>
//             Countdown to Election: {countdown}
//           </Typography>
//         )}

//         <Divider sx={{ my: 3 }} />

//         {/* Election Duration */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//         >
//           <Typography sx={{ minWidth: 160 }}>Election Duration (in minutes)</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="number"
//               size="small"
//               value={duration}
//               onChange={(e) => setDuration(e.target.value)}
//               placeholder="e.g. 240"
//             />
//             <Button
//               variant="contained"
//               onClick={handleStartElection}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#FFEB3B' }
//               }}
//             >
//               Start
//             </Button>
//           </Box>
//         </Box>

//         {processEndTime && (
//           <Typography variant="body1" fontWeight="bold" mt={3}>
//             Election Ends In: {processCountdown}
//           </Typography>
//         )}
//       </Box>
//     </AdminLayout>
//   );
// }






// import React, { useState, useEffect, useContext } from 'react';
// import {
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Divider
// } from '@mui/material';
// import AdminLayout from '../layout/AdminLayout';
// import { ElectionContext } from '../../context/ElectionContext';

// export default function ManageElection() {
//   const [electionDate, setElectionDate] = useState('');
//   const [electionTime, setElectionTime] = useState('');
//   const [duration, setDuration] = useState(''); // in minutes
//   const [electionStarted, setElectionStarted] = useState(false);
//   const [countdown, setCountdown] = useState('');
//   const [processCountdown, setProcessCountdown] = useState('');
//   const [processEndTime, setProcessEndTime] = useState(null);
//   const [processDuration, setProcessDuration] = useState('');

//   const { electionDateTime, setElectionDateTime } = useContext(ElectionContext);

//   // Countdown to election start
//   useEffect(() => {
//     let timer;
//     if (electionDateTime) {
//       timer = setInterval(() => {
//         const now = new Date().getTime();
//         const distance = new Date(electionDateTime).getTime() - now;

//         if (distance <= 0) {
//           clearInterval(timer);
//           setCountdown('00D : 00H : 00M : 00S');
//         } else {
//           const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//           const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//           const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//           const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//           setCountdown(
//             `${String(days).padStart(2, '0')}D : ${String(hours).padStart(2, '0')}H : ${String(minutes).padStart(2, '0')}M : ${String(seconds).padStart(2, '0')}S`
//           );
//         }
//       }, 1000);
//     }

//     return () => clearInterval(timer);
//   }, [electionDateTime]);

//   // Countdown for election process
//   useEffect(() => {
//     let processTimer;
//     if (electionStarted && processEndTime) {
//       processTimer = setInterval(() => {
//         const now = new Date().getTime();
//         const distance = new Date(processEndTime).getTime() - now;

//         if (distance <= 0) {
//           clearInterval(processTimer);
//           setProcessCountdown('00D : 00H : 00M : 00S');
//         } else {
//           const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//           const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//           const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//           const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//           setProcessCountdown(
//             `${String(days).padStart(2, '0')}D : ${String(hours).padStart(2, '0')}H : ${String(minutes).padStart(2, '0')}M : ${String(seconds).padStart(2, '0')}S`
//           );
//         }
//       }, 1000);
//     }

//     return () => clearInterval(processTimer);
//   }, [electionStarted, processEndTime]);

//   const handleSetElectionDate = () => {
//     if (!electionDate || !electionTime) {
//       alert('Please enter both date and time.');
//       return;
//     }
//     const fullDateTime = `${electionDate}T${electionTime}`;
//     setElectionDateTime(fullDateTime);
//     alert(`Election date set to ${fullDateTime}`);
//   };

//   const handleStartElection = () => {
//   if (!processDuration || isNaN(processDuration)) {
//     alert('Please enter the duration in minutes.');
//     return;
//   }

//   const now = new Date();
//   const endTime = new Date(now.getTime() + Number(processDuration) * 60000);
//   setProcessEndTime(endTime.toISOString());
//   alert(`Election process started for ${processDuration} minutes.`);
//   setElectionStarted(true);
// };
//   //   const now = new Date();
//   //   const end = new Date(now.getTime() + parseInt(duration) * 60 * 1000); // add minutes
//   //   setProcessEndTime(end);
//   //   setElectionStarted(true);
//   //   alert(`Election process started for ${duration} minutes`);
//   // };

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h6" fontWeight="bold" mb={1}>
//           Manage Elections
//         </Typography>
//         <Divider sx={{ mb: 3 }} />

//         {/* Set Election Date */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//           mb={2}
//         >
//           <Typography sx={{ minWidth: 160 }}>Set Election Date</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="date"
//               size="small"
//               value={electionDate}
//               onChange={(e) => setElectionDate(e.target.value)}
//             />
//             <TextField
//               type="time"
//               size="small"
//               value={electionTime}
//               onChange={(e) => setElectionTime(e.target.value)}
//             />
//             <Button
//               variant="contained"
//               onClick={handleSetElectionDate}
//               sx={{
//                 backgroundColor: '#F5F5F5',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#e0e0e0' }
//               }}
//             >
//               Set
//             </Button>
//           </Box>
//         </Box>

//         {electionDateTime && (
//           <Typography variant="body1" fontWeight="bold" mt={1} mb={3}>
//             Countdown to Election: {countdown}
//           </Typography>
//         )}

//         <Divider sx={{ my: 3 }} />

//         {/* Election Process Time */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//         >
//           <Typography sx={{ minWidth: 160 }}>Election Duration (in minutes)</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="number"
//               size="small"
//               value={duration}
//               onChange={(e) => setDuration(e.target.value)}
//               placeholder="e.g. 240"
//             />
//             <Button
//               variant="contained"
//               disabled={electionStarted}
//               onClick={handleStartElection}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': { backgroundColor: '#FFEB3B' }
//               }}
//             >
//               Start
//             </Button>
//           </Box>
//         </Box>

//         {electionStarted && processEndTime && (
//           <Typography variant="body1" fontWeight="bold" mt={3}>
//             Election Ends In: {processCountdown}
//           </Typography>
//         )}
//       </Box>
//     </AdminLayout>
//   );
// }





// import React, { useState, useEffect, useContext } from 'react';
// import {
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Divider
// } from '@mui/material';
// import AdminLayout from '../layout/AdminLayout';
// import { ElectionContext } from '../../context/ElectionContext';

// export default function ManageElection() {
//   const [electionDate, setElectionDate] = useState('');
//   const [electionTime, setElectionTime] = useState('');
//   const [processTime, setProcessTime] = useState('');
//   const [electionStarted, setElectionStarted] = useState(false);
//   const [countdown, setCountdown] = useState('');

//   const { electionDateTime, setElectionDateTime } = useContext(ElectionContext);

//   // Countdown timer effect
//   useEffect(() => {
//     let timer;
//     if (electionDateTime) {
//       timer = setInterval(() => {
//         const now = new Date().getTime();
//         const distance = new Date(electionDateTime).getTime() - now;

//         if (distance <= 0) {
//           clearInterval(timer);
//           setCountdown('00D : 00H : 00M : 00S');
//         } else {
//           const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//           const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//           const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//           const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//           setCountdown(
//             `${String(days).padStart(2, '0')}D : ${String(hours).padStart(2, '0')}H : ${String(minutes).padStart(2, '0')}M : ${String(seconds).padStart(2, '0')}S`
//           );
//         }
//       }, 1000);
//     }

//     return () => clearInterval(timer);
//   }, [electionDateTime]);

//   const handleSetElectionDate = () => {
//     if (!electionDate || !electionTime) {
//       alert('Please enter both date and time.');
//       return;
//     }
//     const fullDateTime = `${electionDate}T${electionTime}`;
//     setElectionDateTime(fullDateTime);
//     alert(`Election date set to ${fullDateTime}`);
//   };

//   const handleStartElection = () => {
//     if (!processTime) {
//       alert('Please enter the election start time.');
//       return;
//     }
//     setElectionStarted(true);
//     alert('Election process started!');
//   };

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h6" fontWeight="bold" mb={1}>
//           Manage Elections
//         </Typography>
//         <Divider sx={{ mb: 3 }} />

//         {/* Set Election Date Row */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//           mb={2}
//         >
//           <Typography sx={{ minWidth: 160 }}>Set Election Date</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="date"
//               size="small"
//               value={electionDate}
//               onChange={(e) => setElectionDate(e.target.value)}
//             />
//             <TextField
//               type="time"
//               size="small"
//               value={electionTime}
//               onChange={(e) => setElectionTime(e.target.value)}
//             />
//             <Button
//               variant="contained"
//               onClick={handleSetElectionDate}
//               sx={{
//                 backgroundColor: '#F5F5F5',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': {
//                   backgroundColor: '#e0e0e0'
//                 }
//               }}
//             >
//               Set
//             </Button>
//           </Box>
//         </Box>

//         {/* Countdown display */}
//         {electionDateTime && (
//           <Typography variant="body1" fontWeight="bold" mt={1} mb={3}>
//             Countdown to Election: {countdown}
//           </Typography>
//         )}

//         <Divider sx={{ my: 3 }} />

//         {/* Election Process Row */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//         >
//           <Typography sx={{ minWidth: 160 }}>Election Process</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="time"
//               size="small"
//               value={processTime}
//               onChange={(e) => setProcessTime(e.target.value)}
//             />
//             <Button
//               variant="contained"
//               disabled={electionStarted}
//               onClick={handleStartElection}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': {
//                   backgroundColor: '#FFEB3B'
//                 }
//               }}
//             >
//               Start
//             </Button>
//           </Box>
//         </Box>
//       </Box>
//     </AdminLayout>
//   );
// }





// import React, { useState, useEffect, useContext } from 'react';
// import {
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Divider
// } from '@mui/material';
// import AdminLayout from '../layout/AdminLayout';
// import { ElectionContext } from '../../context/ElectionContext';

// export default function ManageElection() {
//   const [electionDate, setElectionDate] = useState('');
//   const [electionTime, setElectionTime] = useState('');
//   const [countdown, setCountdown] = useState('');
//   const [processTime, setProcessTime] = useState('');
//   const [electionStarted, setElectionStarted] = useState(false);
//   // const [electionDateTime, setElectionDateTime] = useState(null);
//   const {setElectionDateTime} = useContext(ElectionContext);

//   // Countdown timer
//   useEffect(() => {
//     let timer;
//     if (electionDateTime) {
//       timer = setInterval(() => {
//         const now = new Date().getTime();
//         const distance = new Date(electionDateTime).getTime() - now;

//         if (distance <= 0) {
//           clearInterval(timer);
//           setCountdown('00d : 00h : 00m : 00s');
//         } else {
//           const days = Math.floor(distance / (1000 * 60 * 60 * 24));
//           const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//           const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//           const seconds = Math.floor((distance % (1000 * 60)) / 1000);
//           setCountdown(
//             `${String(days).padStart(2, '0')}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`
//           );
//         }
//       }, 1000);
//     }

//     return () => clearInterval(timer);
//   }, [electionDateTime]);

//   const handleSetElectionDate = () => {
//     if (!electionDate || !electionTime) {
//       alert('Please enter both date and time.');
//       return;
//     }
//     const fullDateTime = `${electionDate}T${electionTime}`;
//   setElectionDateTime(fullDateTime); // Set globally
//   alert(`Election date set to ${fullDateTime}`);
//     // const dateTime = new Date(`${electionDate}T${electionTime}`);
//     // setElectionDateTime(dateTime);
//     // alert(`Election date set to ${dateTime}`);
//   };

//   const handleStartElection = () => {
//     if (!processTime) {
//       alert('Please enter the election start time.');
//       return;
//     }
//     setElectionStarted(true);
//     alert('Election process started!');
//   };

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h6" fontWeight="bold" mb={1}>
//           Manage Elections
//         </Typography>
//         <Divider sx={{ mb: 3 }} />

//         {/* Set Election Date Row */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//           mb={2}
//         >
//           <Typography sx={{ minWidth: 160 }}>Set Election Date</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="date"
//               size="small"
//               value={electionDate}
//               onChange={(e) => setElectionDate(e.target.value)}
//             />
//             <TextField
//               type="time"
//               size="small"
//               value={electionTime}
//               onChange={(e) => setElectionTime(e.target.value)}
//             />
//             <Button
//               variant="contained"
//               sx={{
//                 backgroundColor: '#F5F5F5',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': {
//                   backgroundColor: '#e0e0e0'
//                 }
//               }}
//               onClick={handleSetElectionDate}
//             >
//               Set
//             </Button>
//           </Box>
//         </Box>

//         {/* Countdown display */}
//         {electionDateTime && (
//           <Typography variant="body1" fontWeight="bold" mt={1} mb={3}>
//             Countdown to Election: {countdown}
//           </Typography>
//         )}

//         <Divider sx={{ my: 3 }} />

//         {/* Election Process Row */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//         >
//           <Typography sx={{ minWidth: 160 }}>Election Process</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="time"
//               size="small"
//               value={processTime}
//               onChange={(e) => setProcessTime(e.target.value)}
//             />
//             <Button
//               variant="contained"
//               disabled={electionStarted}
//               onClick={handleStartElection}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': {
//                   backgroundColor: '#FFEB3B'
//                 }
//               }}
//             >
//               Start
//             </Button>
//           </Box>
//         </Box>
//       </Box>
//     </AdminLayout>
//   );
// }





// import React, { useState } from 'react';
// import {
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Divider
// } from '@mui/material';
// import AdminLayout from '../layout/AdminLayout';

// export default function ManageElection() {
//   const [electionDate, setElectionDate] = useState('');
//   const [electionTime, setElectionTime] = useState('');
//   const [processTime, setProcessTime] = useState('');
//   const [electionStarted, setElectionStarted] = useState(false);

//   const handleSetElectionDate = () => {
//     if (!electionDate || !electionTime) {
//       alert('Please enter both date and time.');
//       return;
//     }
//     alert(`Election date set to ${electionDate} ${electionTime}`);
//   };

//   const handleStartElection = () => {
//     if (!processTime) {
//       alert('Please enter the election start time.');
//       return;
//     }
//     setElectionStarted(true);
//     alert('Election process started!');
//   };

//   return (
//     <AdminLayout>
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h6" fontWeight="bold" mb={1}>
//           Manage Elections
//         </Typography>
//         <Divider sx={{ mb: 3 }} />

//         {/* Set Election Date Row */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//           mb={2}
//         >
//           <Typography sx={{ minWidth: 160 }}>Set Election Date</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="date"
//               size="small"
//               value={electionDate}
//               onChange={(e) => setElectionDate(e.target.value)}
//             />
//             <TextField
//               type="time"
//               size="small"
//               value={electionTime}
//               onChange={(e) => setElectionTime(e.target.value)}
//             />
//             <Button
//               variant="contained"
//               sx={{
//                 backgroundColor: '#F5F5F5',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': {
//                   backgroundColor: '#e0e0e0'
//                 }
//               }}
//               onClick={handleSetElectionDate}
//             >
//               Set
//             </Button>
//           </Box>
//         </Box>

//         <Divider sx={{ my: 3 }} />

//         {/* Election Process Row */}
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           flexWrap="wrap"
//         >
//           <Typography sx={{ minWidth: 160 }}>Election Process</Typography>
//           <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
//             <TextField
//               type="time"
//               size="small"
//               value={processTime}
//               onChange={(e) => setProcessTime(e.target.value)}
//             />
//             <Button
//               variant="contained"
//               disabled={electionStarted}
//               onClick={handleStartElection}
//               sx={{
//                 backgroundColor: '#FFD700',
//                 color: '#000',
//                 textTransform: 'none',
//                 '&:hover': {
//                   backgroundColor: '#FFEB3B'
//                 }
//               }}
//             >
//               Start
//             </Button>
//           </Box>
//         </Box>
//       </Box>
//     </AdminLayout>
//   );
// }





// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Grid,
//   Paper,
// } from '@mui/material';
// import AdminLayout from '../layout/AdminLayout';

// export default function ManageElection() {
//   const [startTime, setStartTime] = useState('');
//   const [endTime, setEndTime] = useState('');
//   const [countdownToStart, setCountdownToStart] = useState('');
//   const [countdownToEnd, setCountdownToEnd] = useState('');
//   const [electionStarted, setElectionStarted] = useState(false);
//   const [electionEnded, setElectionEnded] = useState(false);

//   const intervalRef = useRef(null);

//   useEffect(() => {
//     if (electionStarted) {
//       intervalRef.current = setInterval(() => {
//         const now = new Date();

//         if (startTime) {
//           const start = new Date(startTime);
//           const diffStart = start - now;
//           setCountdownToStart(getCountdownText(diffStart, 'Election has started!'));
//         }

//         if (endTime) {
//           const end = new Date(endTime);
//           const diffEnd = end - now;
//           setCountdownToEnd(getCountdownText(diffEnd, 'Election has ended!'));

//           if (diffEnd <= 0) {
//             setElectionEnded(true);
//             clearInterval(intervalRef.current);
//           }
//         }
//       }, 1000);

//       return () => clearInterval(intervalRef.current);
//     }
//   }, [electionStarted, startTime, endTime]);

//   const getCountdownText = (milliseconds, finishedText) => {
//     if (milliseconds <= 0) return finishedText;
//     const totalSeconds = Math.floor(milliseconds / 1000);
//     const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
//     const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
//     const seconds = String(totalSeconds % 60).padStart(2, '0');
//     return `${hours}:${minutes}:${seconds}`;
//   };

//   const handleStartElection = () => {
//     if (!startTime || !endTime) {
//       alert('Please set both start and end time.');
//       return;
//     }

//     const now = new Date();
//     if (new Date(endTime) <= now) {
//       alert('End time must be in the future.');
//       return;
//     }

//     setElectionStarted(true);
//     setElectionEnded(false);
//     alert('Election started!');
//   };

//   const handleDeclareWinner = () => {
//     alert('Winner declared!');
//   };

//   const handleGenerateReport = () => {
//     alert('Election report generated!');
//   };

//   return (
//     <AdminLayout>
//     <Container maxWidth="md">
//       <Box mt={5} component={Paper} p={4}>
//         <Typography variant="h5" mb={2}>Manage Election</Typography>

//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="Election Start Time"
//               type="datetime-local"
//               InputLabelProps={{ shrink: true }}
//               value={startTime}
//               onChange={(e) => setStartTime(e.target.value)}
//               disabled={electionStarted}
//             />
//             {startTime && electionStarted && (
//               <Typography variant="body2" color="primary" mt={1}>
//                 Starts in: {countdownToStart}
//               </Typography>
//             )}
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <TextField
//               fullWidth
//               label="Election End Time"
//               type="datetime-local"
//               InputLabelProps={{ shrink: true }}
//               value={endTime}
//               onChange={(e) => setEndTime(e.target.value)}
//               disabled={electionStarted}
//             />
//             {endTime && electionStarted && (
//               <Typography variant="body2" color="error" mt={1}>
//                 Ends in: {countdownToEnd}
//               </Typography>
//             )}
//           </Grid>
//         </Grid>

//         <Box mt={3} display="flex" gap={2} flexWrap="wrap">
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleStartElection}
//             disabled={electionStarted}
//           >
//             Start Election
//           </Button>
//           <Button variant="outlined" onClick={handleGenerateReport}>
//             Generate Report
//           </Button>
//           <Button
//             variant="contained"
//             color="success"
//             onClick={handleDeclareWinner}
//             disabled={!electionEnded}
//           >
//             Declare Winner
//           </Button>
//         </Box>
//       </Box>
//     </Container>
//     </AdminLayout>
//   );
// }
