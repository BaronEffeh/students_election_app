import { useEffect, useState, useContext } from 'react';
// import { ElectionContext } from '../context/ElectionContext';
import { ElectionContext } from '../../context/ElectionContext';
import { Typography } from '@mui/material';

export default function CountdownTimer() {
  const { electionDateTime, processEndTime } = useContext(ElectionContext);
  const [countdown, setCountdown] = useState('-- : -- : -- : --');

  useEffect(() => {
    let interval = setInterval(() => {
      const now = new Date().getTime();
      const targetTime = processEndTime ? new Date(processEndTime).getTime() : (electionDateTime ? new Date(electionDateTime).getTime() : null);

      if (!targetTime) return setCountdown('-- : -- : -- : --');

      const distance = targetTime - now;
      if (distance <= 0) {
        clearInterval(interval);
        setCountdown('00 : 00 : 00 : 00');
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${String(d).padStart(2, '0')} : ${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [electionDateTime, processEndTime]);

  return (
    <>
      <Typography style={{ fontSize: '3rem', fontWeight: 'bold' }}>{countdown}</Typography>
      <Typography variant="caption" letterSpacing={15} pl={3} mt={-1}>D &nbsp;&nbsp; H &nbsp;&nbsp; M &nbsp;&nbsp; S</Typography>
      {/* <small>D &nbsp;&nbsp; H &nbsp;&nbsp; M &nbsp;&nbsp; S</small> */}
    </>
  );
}
