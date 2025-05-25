// context/AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (serialNumber) => {
    // Mock roles based on serialNumber
    const isAdmin = serialNumber === 'ADMIN123';
    const mockUser = isAdmin
      ? { name: 'Admin User', role: 'admin' }
      : { name: 'Adeleke Hussein', role: 'voter' };

    setUser(mockUser);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}





// // context/AuthContext.js
// import React, { createContext, useState } from 'react';

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   const login = async (email, password) => {
//     // Mock login logic: Replace this with a real API call
//     const mockUser = email === 'admin@example.com'
//       ? { name: 'Admin User', email, role: 'admin' }
//       : { name: 'Adeleke Hussein', email, role: 'voter' };
//     setUser(mockUser);
//     return true;
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }



// // context/AuthContext.js
// import React, { createContext, useState } from 'react';

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   const login = async (email, password) => {
//     // Mock login logic: Replace this with real API call
//     const mockUser = email === 'admin@example.com'
//       ? { email, role: 'admin', name: 'Admin User' }
//       : { email, role: 'voter' };
//     setUser(mockUser);
//     return true;
//   };

//   return (
//     <AuthContext.Provider value={{ user, login }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }
