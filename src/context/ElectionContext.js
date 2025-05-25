import { createContext, useState } from 'react';

export const ElectionContext = createContext();

export const ElectionProvider = ({ children }) => {
  const [electionDateTime, setElectionDateTime] = useState(null); // Global election date/time
  const [processEndTime, setProcessEndTime] = useState(null); // Global process end time

  return (
    <ElectionContext.Provider value={{
      electionDateTime,
      setElectionDateTime,
      processEndTime,
      setProcessEndTime
    }}>
      {children}
    </ElectionContext.Provider>
  );
};





// import React, { createContext, useState, useEffect } from 'react';

// export const ElectionContext = createContext();

// export const ElectionProvider = ({ children }) => {
//   const [electionDateTime, setElectionDateTime] = useState(null);
//   const [countdown, setCountdown] = useState('00 : 00 : 00 : 00');

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (electionDateTime) {
//         const now = new Date();
//         const target = new Date(electionDateTime);
//         const diff = target - now;

//         if (diff <= 0) {
//           setCountdown('00 : 00 : 00 : 00');
//         } else {
//           const d = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
//           const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
//           const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
//           const s = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
//           setCountdown(`${d} : ${h} : ${m} : ${s}`);
//         }
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [electionDateTime]);

//   return (
//     <ElectionContext.Provider value={{ electionDateTime, setElectionDateTime, countdown }}>
//       {children}
//     </ElectionContext.Provider>
//   );
// };
