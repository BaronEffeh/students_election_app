import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ElectionContext } from '../context/ElectionContext';
import AdminLayout from './layout/AdminLayout';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Logo from '../assets/BSA_logo.png';
import CountdownTimer from './layout/CountdownTimer';
import { supabase } from '../supabaseClient';

const drawerWidth = 240;

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { countdown } = useContext(ElectionContext);
  const navigate = useNavigate();

  const [voterCount, setVoterCount] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [positionCount, setPositionCount] = useState(0);
  const [recentCandidates, setRecentCandidates] = useState([]);

  const handleVote = () => {
    navigate('/voting-instructions');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    const [{ count: voters }, { count: candidates }, { count: positions }] = await Promise.all([
      supabase.from('voters').select('*', { count: 'exact', head: true }),
      supabase.from('candidates').select('*', { count: 'exact', head: true }),
      supabase.from('positions').select('*', { count: 'exact', head: true })
    ]);

    setVoterCount(voters || 0);
    setCandidateCount(candidates || 0);
    setPositionCount(positions || 0);

    const { data: recent, error } = await supabase
      .from('candidate_with_fullname')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error) {
      setRecentCandidates(recent);
    }
  };

  // ---------------------- VOTER DASHBOARD ----------------------
  if (user?.role === 'voter') {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            },
          }}
        >
          <Box>
            <Box display="flex" justifyContent="center" p={2}>
              <img src={Logo} alt="Logo" style={{ width: 50 }} />
            </Box>
            <Divider />
            <List>
              <ListItem button>
                <ListItemIcon sx={{ color: '#DA5050' }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText sx={{ color: '#DA5050' }} primary="Dashboard" />
              </ListItem>
            </List>
          </Box>
          <Box>
            <Divider />
            <List>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Welcome, {user?.name}!
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Info Cards */}
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 2 }}>
            {[
              {
                text: 'School elections let students choose their leaders through a fair voting process.',
                bg: '#FDE7B1'
              },
              {
                text: 'Voting gives you a voice in decisions that affect student life. Be heard!',
                bg: '#F1F9C4'
              },
              {
                text: 'After voting ends, votes are counted, and new leaders are announced.',
                bg: '#FAD4D4'
              }
            ].map((card, index) => (
              <Card key={index} sx={{ minWidth: 250, backgroundColor: card.bg, borderRadius: 3, p: 2 }}>
                <Typography align="center" fontWeight="500">
                  {card.text}
                </Typography>
              </Card>
            ))}
          </Box>

          {/* Countdown & CTA */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={5}>
            <Typography variant="h6">Voting Begins in:</Typography>
            <Typography variant="h3" fontWeight="bold">
              {countdown}
              <CountdownTimer />
            </Typography>
          </Box>

          <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Your vote is your power. Step up and decide the future - Cast Now.</Typography>
            <Button
              onClick={handleVote}
              variant="contained"
              sx={{
                px: 6,
                backgroundColor: '#FFD500',
                color: '#000',
                borderRadius: 2,
                '&:hover': { backgroundColor: '#FFE452' }
              }}
            >
              Vote
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // ---------------------- ADMIN DASHBOARD ----------------------
  return (
    <AdminLayout>
      <Typography variant="h4" mb={1}>Welcome, {user?.name}!</Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Admin Stat Cards */}
      <Grid container spacing={5} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ width: 292, height: 150, borderRadius: 5, border: '1px solid #FFF1A3', backgroundColor: '#FAFAF7' }}>
            <CardContent align="center">
              <Typography variant="h3" fontWeight="400">{voterCount}</Typography>
              <Typography variant="h6">Total Number of Voters</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ width: 292, height: 150, borderRadius: 5, border: '1px solid #E89393', backgroundColor: '#FFF4B8' }}>
            <CardContent align="center">
              <Typography variant="h3" fontWeight="400">{candidateCount}</Typography>
              <Typography variant="h6">Total Number of Candidates</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ width: 292, height: 150, borderRadius: 5, border: '1px solid #E89393', backgroundColor: '#F5FCAD' }}>
            <CardContent align="center">
              <Typography variant="h3" fontWeight="400">{positionCount}</Typography>
              <Typography variant="h6">Number of Positions</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Countdown */}
      <Box display="flex" justifyContent="space-between" mt={5} mb={2}>
        <Typography variant="h6">Voting Begins in:</Typography>
        <Typography variant="h3" fontWeight="bold">
          <CountdownTimer />
        </Typography>
      </Box>

      {/* Recently Added */}
      <Box mt={5}>
        <Typography variant="h6" gutterBottom>Recently Added</Typography>

        {recentCandidates.map((item, index) => (
          <Box
            key={item.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            py={1}
            px={2}
            sx={{
              borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none',
              backgroundColor: index % 2 === 1 ? '#FAFAFA' : 'transparent'
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={item.photo_url || 'https://via.placeholder.com/40'}
                alt={item.fullname}
              />
              <Typography variant="body1">{item.fullname}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">{item.positions}</Typography>
          </Box>
        ))}

        {recentCandidates.length === 0 && (
          <Typography color="text.secondary" mt={2}>No candidates added yet.</Typography>
        )}
      </Box>
    </AdminLayout>
  );
}
