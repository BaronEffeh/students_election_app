import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function VotingInstructions() {
    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/vote-now');
    };

    return (
        <Box padding={17}>
            <Typography variant="h5" gutterBottom>Before you begin, please read this carefully.</Typography>
            <Typography mt={2} gutterBottom>
                Scroll through each position and select only one candidate for each role. 
                After making your selections, double-check your choices—you won’t be able to 
                change them once submitted. When you're confident, click the "Submit Vote" button 
                and wait for the confirmation message. Remember, each student is allowed to vote only once, 
                so make your vote count. All the best in selecting your student body representatives!
            </Typography>
            <Typography variant="h6" gutterBottom>Ready? click “Continue” to begin voting.</Typography>
            <Button
                onClick={handleContinue}
                variant="contained"
                sx={{
                    mt: 3,
                    px: 6,
                    backgroundColor: '#FFD500',
                    color: '#000',
                    borderRadius: 2,
                    '&:hover': {
                        backgroundColor: '#FFE452',
                    },
                }}
            >
                Continue
            </Button>
        </Box>
    );
}