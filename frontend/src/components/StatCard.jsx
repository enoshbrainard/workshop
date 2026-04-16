import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

const StatCard = ({ title, value, subtitle }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      border: "1px solid rgba(15, 61, 98, 0.08)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,248,251,0.92) 100%)"
    }}
  >
    <CardContent>
      <Stack spacing={1.25}>
        <Box sx={{ width: 44, height: 4, borderRadius: 999, bgcolor: "primary.main" }} />
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ color: "primary.dark" }}>
          {value}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
    </CardContent>
  </Card>
);

export default StatCard;
