import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function CircularIndeterminate() {
  return (
    <Box sx={{display: "flex", bgcolor: "grey.900", p: 4, borderRadius: 1}}>
      <CircularProgress sx={{color: "white"}} />
    </Box>
  );
}
