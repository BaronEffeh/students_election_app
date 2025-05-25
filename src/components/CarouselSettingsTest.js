import Slider from "react-slick";
import { Card, Typography, Box } from "@mui/material";

const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3, // Adjust based on screen size
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 960, // for tablets
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 600, // for mobile
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export default function ElectionCarousel() {
  const cards = [
    {
      text: "School elections let students choose their leaders through a fair voting process. It teaches responsibility and democracy.",
      bg: "#FDE7B1",
    },
    {
      text: "Voting gives you a voice in decisions that affect student life. It’s your chance to be heard!",
      bg: "#F1F9C4",
    },
    {
      text: "After voting ends, votes are counted, results are declared, and new leaders are announced.",
      bg: "#FAD4D4",
    },
    {
      text: "Think about leadership, character, and vision—not just popularity. Your Vote determines your next set of leaders",
      bg: "#C2FCAD",
    },
  ];

  return (
    <Box sx={{ px: 2 }}>
      <Slider {...carouselSettings}>
        {cards.map((card, index) => (
          <Box key={index} px={1}>
            <Card sx={{ backgroundColor: card.bg, borderRadius: 3, p: 2, minHeight: 150 }}>
              <Typography align="center" fontWeight="500">
                {card.text}
              </Typography>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}
