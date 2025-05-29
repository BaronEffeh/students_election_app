// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AddCandidate from './components/admin/AddCandidate';
import AddVoter from './components/admin/AddVoter';
import ViewCandidates from './components/admin/ViewCandidates';
import ViewVoters from './components/admin/ViewVoters';
import ManageElection from './components/admin/ManageElection';
import VoteNow from './components/voter/VoteNow';
import ElectionReport from './components/admin/ElectionReport';
import VotingInstructions from './components/voter/VotingInstructions';
import Positions from './components/admin/Positions';

import { AuthProvider } from './context/AuthContext';
import { ElectionProvider } from './context/ElectionContext';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <AuthProvider>
      <ElectionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            {/* Shared Route */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Voter-only routes */}
            <Route
              path="/vote-now"
              element={
                <PrivateRoute allowedRoles={['voter']}>
                  <VoteNow />
                </PrivateRoute>
              }
            />
            <Route
              path="/voting-instructions"
              element={
                <PrivateRoute allowedRoles={['voter']}>
                  <VotingInstructions />
                </PrivateRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/add-candidate"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AddCandidate />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-voter"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AddVoter />
                </PrivateRoute>
              }
            />
            <Route
              path="/view-candidates"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ViewCandidates />
                </PrivateRoute>
              }
            />
            <Route
              path="/view-voters"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ViewVoters />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-election"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ManageElection />
                </PrivateRoute>
              }
            />
            <Route
              path="/election-report"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ElectionReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/position"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Positions />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </ElectionProvider>
    </AuthProvider>
  );
}





// // App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import "slick-carousel/slick/slick.css"; 
// import "slick-carousel/slick/slick-theme.css";
// import LoginPage from './components/LoginPage';
// import Dashboard from './components/Dashboard';
// import AddCandidate from './components/admin/AddCandidate';
// import AddVoter from './components/admin/AddVoter';
// import ViewCandidates from './components/admin/ViewCandidates';
// import ViewVoters from './components/admin/ViewVoters';
// import ManageElection from './components/admin/ManageElection';
// import VoteNow from './components/voter/VoteNow';
// import VotingInstructions from './components/voter/VotingInstructions';
// import ElectionReport from './components/admin/ElectionReport';
// import Positions from './components/admin/Positions';
// import { AuthProvider } from './context/AuthContext';
// import { ElectionProvider } from './context/ElectionContext';
// import PrivateRoute from './components/routes/PrivateRoute';
// import Unauthorized from './components/Unauthorized';

// function App() {
//   return (
//     <AuthProvider>
//       <ElectionProvider>
//         <Router>
//           <Routes>
//             {/* Public */}
//             <Route path="/" element={<LoginPage />} />
//             <Route path="/unauthorized" element={<Unauthorized />} />

//             {/* Shared Authenticated Routes */}
//             <Route element={<PrivateRoute allowedRoles={['admin', 'voter']} />}>
//               <Route path="/dashboard" element={<Dashboard />} />
//             </Route>

//             {/* Admin-only routes */}
//             <Route element={<PrivateRoute allowedRoles={['admin']} />}>
//               <Route path="/add-candidate" element={<AddCandidate />} />
//               <Route path="/add-voter" element={<AddVoter />} />
//               <Route path="/view-candidates" element={<ViewCandidates />} />
//               <Route path="/view-voters" element={<ViewVoters />} />
//               <Route path="/manage-election" element={<ManageElection />} />
//               <Route path="/election-report" element={<ElectionReport />} />
//               <Route path="/position" element={<Positions />} />
//             </Route>

//             {/* Voter-only routes */}
//             <Route element={<PrivateRoute allowedRoles={['voter']} />}>
//               <Route path="/vote-now" element={<VoteNow />} />
//               <Route path="/voting-instructions" element={<VotingInstructions />} />
//             </Route>
//           </Routes>
//         </Router>
//       </ElectionProvider>
//     </AuthProvider>
//   );
// }

// export default App;





// // App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import "slick-carousel/slick/slick.css"; 
// import "slick-carousel/slick/slick-theme.css";
// import LoginPage from './components/LoginPage';
// import Dashboard from './components/Dashboard';
// import AddCandidate from './components/admin/AddCandidate';
// import AddVoter from './components/admin/AddVoter';
// import ViewCandidates from './components/admin/ViewCandidates';
// import ViewVoters from './components/admin/ViewVoters';
// import ManageElection from './components/admin/ManageElection';
// import VoteNow from './components/voter/VoteNow';
// import { AuthProvider } from './context/AuthContext';
// import { ElectionProvider } from './context/ElectionContext';
// import ElectionReport from './components/admin/ElectionReport';
// import VotingInstructions from './components/voter/VotingInstructions';
// import Positions from './components/admin/Positions';
// function App() {
//   return (
//     <AuthProvider>
//       <ElectionProvider>
//       <Router>
//         <Routes>
//           <Route path="/" element={<LoginPage />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/add-candidate" element={<AddCandidate />} />
//           <Route path="/add-voter" element={<AddVoter />} />
//           <Route path="/view-candidates" element={<ViewCandidates />} />
//           <Route path="/view-voters" element={<ViewVoters />} />
//           <Route path="/manage-election" element={<ManageElection />} />
//           <Route path="/election-report" element={<ElectionReport />} />
//           <Route path="/vote-now" element={<VoteNow />} />
//           <Route path='/voting-instructions' element={<VotingInstructions />} />
//           <Route path='/position' element={<Positions />} />
//         </Routes>
//       </Router>
//       </ElectionProvider>
//     </AuthProvider>
//   );
// }

// export default App;
