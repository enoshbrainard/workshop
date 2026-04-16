import { useState } from "react";
import { Alert, Box, Button, Grid2 as Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import CorporateFareRoundedIcon from "@mui/icons-material/CorporateFareRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(formData);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(circle at top left, rgba(15, 61, 98, 0.22), transparent 24%), linear-gradient(145deg, #0b2239 0%, #163f63 55%, #e9eff5 55%, #f6f8fb 100%)"
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1120,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 6
        }}
      >
        <Grid container>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              p: { xs: 3, md: 5 },
              color: "white",
              background:
                "linear-gradient(180deg, rgba(10, 39, 64, 0.96) 0%, rgba(15, 61, 98, 0.94) 100%)"
            }}
          >
            <Stack spacing={4} sx={{ height: "100%" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,0.12)"
                  }}
                >
                  <CorporateFareRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ opacity: 0.78 }}>
                    Northstar Systems
                  </Typography>
                  <Typography variant="h5">Workforce Command Center</Typography>
                </Box>
              </Stack>
              <Box>
                <Typography variant="h3" sx={{ maxWidth: 420, mb: 2 }}>
                  Built for distributed teams with executive visibility.
                </Typography>
                <Typography sx={{ maxWidth: 460, opacity: 0.82 }}>
                  Centralize org structure, achievements, and workforce reporting in one enterprise workspace.
                </Typography>
              </Box>
              <Stack spacing={2.5} sx={{ mt: "auto" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ShieldRoundedIcon />
                  <Typography>Role-based access for admins, managers, and employees</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <GroupsRoundedIcon />
                  <Typography>Team ownership, staffing visibility, and location alignment</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <InsightsRoundedIcon />
                  <Typography>Operational analytics for leadership reporting</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ p: { xs: 3, md: 5 }, bgcolor: "#f9fbfd" }}>
            <Stack spacing={3} sx={{ maxWidth: 430, mx: "auto", justifyContent: "center", minHeight: "100%" }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Sign in
                </Typography>
                <Typography color="text.secondary">
                  Access your workspace, dashboards, and team records.
                </Typography>
              </Box>
              {error ? (
                <Alert severity="error">{error}</Alert>
              ) : null}
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Work Email"
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                    required
                    fullWidth
                  />
                  <Button type="submit" variant="contained" size="large" disabled={submitting}>
                    {submitting ? "Signing in..." : "Enter workspace"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LoginPage;
