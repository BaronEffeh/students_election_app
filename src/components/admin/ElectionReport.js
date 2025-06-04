import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Button, Grid, Divider
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LabelList, ResponsiveContainer, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AdminLayout from '../layout/AdminLayout';
import Logo from '../../assets/BSA_logo.png';
import { supabase } from '../../supabaseClient';

const colorPalette = ['#8884d8', '#FF8042', '#0088FE', '#3CC3DF'];

export default function ElectionReport() {
  const [chartData, setChartData] = useState([]);
  const reportRef = useRef();

  useEffect(() => {
    fetchElectionResults();
  }, []);

  const fetchElectionResults = async () => {
    const { data, error } = await supabase
      .from('vote_results')
      .select('*');

    if (error) {
      console.error('Error fetching vote results:', error);
      return;
    }

    const grouped = {};

    data.forEach(vote => {
      const pos = vote.voted_position;
      const name = vote.candidate_name || 'Unknown';

      if (!grouped[pos]) grouped[pos] = {};
      if (!grouped[pos][name]) grouped[pos][name] = 0;

      grouped[pos][name]++;
    });

    const structured = Object.entries(grouped).map(([position, candidatesObj]) => ({
      position,
      data: Object.entries(candidatesObj).map(([name, votes]) => ({
        name,
        votes
      }))
    }));

    setChartData(structured);
  };

  const handleDownloadPDF = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 30, marginTop = 40, marginBottom = 30;
    const imgWidth = pageWidth - marginX * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const totalPages = Math.ceil(imgHeight / (pageHeight - marginTop - marginBottom));

    const watermarkImg = new Image();
    watermarkImg.src = Logo;

    for (let page = 0; page < totalPages; page++) {
      const sourceY = (canvas.height / totalPages) * page;
      const chunkHeight = canvas.height / totalPages;

      const chunkCanvas = document.createElement('canvas');
      chunkCanvas.width = canvas.width;
      chunkCanvas.height = chunkHeight;

      const ctx = chunkCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, sourceY, canvas.width, chunkHeight, 0, 0, canvas.width, chunkHeight);
      const chunkImgData = chunkCanvas.toDataURL('image/png');

      if (page > 0) pdf.addPage();

      pdf.addImage(watermarkImg, 'PNG', pageWidth - 80, 10, 50, 30, undefined, 'FAST');
      pdf.addImage(chunkImgData, 'PNG', marginX, marginTop, imgWidth, (chunkHeight * imgWidth) / canvas.width);
      pdf.setFontSize(12);
      pdf.text('Britarch School Election Report', pageWidth / 2, 30, { align: 'center' });

      const date = new Date().toLocaleString();
      pdf.setFontSize(10);
      pdf.text(`Printed: ${date}`, marginX, pageHeight - 10);
      pdf.text(`Page ${page + 1} of ${totalPages}`, pageWidth - marginX, pageHeight - 10, { align: 'right' });
    }

    pdf.save('election-report.pdf');
  };

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Election Report</Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={handleDownloadPDF}
              sx={{
                border: '1px solid #002345',
                color: '#000',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F9F9F6' }
              }}
            >
              Download as PDF
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                textTransform: 'none',
                px: 3,
                '&:hover': { backgroundColor: '#FFEB3B' }
              }}
            >
              Public View Display
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box ref={reportRef} id="printable-section">
          <Grid container spacing={4}>
            {chartData.map((item, index) => {
              const totalVotes = item.data.reduce((sum, c) => sum + c.votes, 0);
              const maxVote = Math.max(...item.data.map((c) => c.votes));
              const chartWithColors = item.data.map((entry, i) => ({
                ...entry,
                fill: entry.votes === maxVote ? '#41DF3C' : colorPalette[i % colorPalette.length]
              }));

              return (
                <Grid item xs={12} md={6} key={index}>
                  <Box sx={{ pr: { md: 2 }, width: '100%' }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                      {item.position}
                    </Typography>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart layout="vertical" data={chartWithColors}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 'dataMax + 10']} />
                        <YAxis dataKey="name" type="category" width={110} />
                        <Tooltip formatter={(value) => `${value} votes`} />
                        <Bar dataKey="votes" barSize={30} isAnimationActive={false}>
                          <LabelList
                            dataKey="votes"
                            position="right"
                            fontWeight="700"
                            formatter={(val) => `${val} (${((val / totalVotes) * 100).toFixed(1)}%)`}
                          />
                          {chartWithColors.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </AdminLayout>
  );
}
