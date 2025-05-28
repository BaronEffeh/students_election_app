// context/AuthContext.js
import React, { createContext, useState } from 'react';
import { supabase } from '../supabaseClient';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (serialNumber) => {
    const { data, error } = await supabase
      .from('voters')
      .select('id, fullname, role') // make sure these columns exist
      .eq('serial_number', serialNumber)
      .single();

    if (error || !data) {
      console.error('Login error:', error);
      return false;
    }

    setUser({
      id: data.id,
      name: data.fullname,
      role: data.role || 'voter',
    });

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
// import { supabase } from '../supabaseClient';

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   /**
//    * Login using serial number only
//    * @param {string} serialNumber
//    * @returns {boolean} success
//    */
//   const login = async (serialNumber) => {
//     if (!serialNumber.trim()) return false;

//     const { data, error } = await supabase
//       .from('voters')
//       .select('*')
//       .eq('serial_number', serialNumber.trim())
//       .single();

//     if (error || !data) {
//       console.error('Login failed:', error);
//       return false;
//     }

//     setUser(data); // Contains fullname, serial_number, role, etc.
//     return true;
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, setUser, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }





// // context/AuthContext.js
// import React, { createContext, useState } from 'react';

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);

//   const login = async (serialNumber) => {
//     // Mock roles based on serialNumber
//     const isAdmin = serialNumber === 'ADMIN123';
//     const mockUser = isAdmin
//       ? { name: 'Admin User', role: 'admin' }
//       : { name: 'Adeleke Hussein', role: 'voter' };

//     setUser(mockUser);
//     return true;
//   };

//   const logout = () => setUser(null);

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
