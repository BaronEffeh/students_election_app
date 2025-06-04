import React, { useContext } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
//   Dashboard as DashboardIcon,
  Home as HomeIcon,
  HowToReg as HowToRegIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
// import HomeIcon from '@mui/icons-material/Home';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Logo from '../../assets/BSA_logo.png';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
  { text: 'Positions', icon: <HowToRegIcon />, path: '/position' },
  { text: 'Candidates', icon: <PersonIcon />, path: '/view-candidates' },
  { text: 'Voters', icon: <HowToRegIcon />, path: '/view-voters' },
  { text: 'Manage Election', icon: <SettingsIcon />, path: '/manage-election' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
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
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    cursor: 'pointer',
                    color: isActive ? '#DA5050' : 'inherit',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#DA5050' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              );
            })}
          </List>
        </Box>
        <Box>
          <Divider />
          <List>
            <ListItem
              button
              onClick={logout}
              sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Page Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
