import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import CorporateFareRoundedIcon from "@mui/icons-material/CorporateFareRounded";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusChip from "../components/StatusChip";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { label: "Dashboard", path: "/" },
    { label: "Teams", path: "/teams" },
    ...(user?.role === "Admin" ? [{ label: "Users", path: "/users" }] : []),
    { label: "Achievements", path: "/achievements" },
    { label: "Performance", path: "/performance" },
    { label: "Profile", path: "/profile" }
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(15, 61, 98, 0.12), transparent 28%), linear-gradient(180deg, #f5f8fb 0%, #e9eff5 100%)"
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{ backdropFilter: "blur(14px)", backgroundColor: "rgba(245, 248, 251, 0.78)" }}
      >
        <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                display: "grid",
                placeItems: "center",
                borderRadius: 3,
                bgcolor: "primary.main",
                color: "white"
              }}
            >
              <CorporateFareRoundedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Northstar Systems
              </Typography>
              <Typography variant="h6" component="div">
                Workforce Command
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {links.map((link) => (
              <Button
                key={link.path}
                component={RouterLink}
                to={link.path}
                color={location.pathname === link.path ? "primary" : "inherit"}
                variant={location.pathname === link.path ? "contained" : "text"}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main" }}>{user?.name?.[0] || "U"}</Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2">{user?.name}</Typography>
              <StatusChip type="role" value={user?.role} label={user?.role} size="small" sx={{ mt: 0.5 }} />
            </Box>
            <Button onClick={logout} color="primary" variant="text">
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, border: "1px solid rgba(20, 36, 51, 0.08)", bgcolor: "rgba(255,255,255,0.82)" }}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default MainLayout;
