import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  teamId: "",
  title: "",
  description: "",
  month: ""
};

const AchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [teams, setTeams] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [deletingId, setDeletingId] = useState("");

  const loadAchievements = async () => {
    try {
      const [achievementsResponse, teamsResponse] = await Promise.all([
        api.get("/achievements", { params: query ? { search: query } : {} }),
        api.get("/teams")
      ]);
      setAchievements(achievementsResponse.data.data);
      setTeams(teamsResponse.data.data);
      setError("");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load achievements");
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleSave = async () => {
    try {
      await api.post("/achievements", form);
      setOpen(false);
      setForm(initialForm);
      setMessage("Achievement created successfully.");
      loadAchievements();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to create achievement");
    }
  };

  const handleDelete = async (achievementId) => {
    try {
      setDeletingId(achievementId);
      await api.delete(`/achievements/${achievementId}`);
      setMessage("Achievement deleted successfully.");
      loadAchievements();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete achievement");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4">Achievement Ledger</Typography>
          <Typography color="text.secondary">
            Capture delivery highlights, monthly wins, and team momentum in a leadership-friendly format.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <TextField
            placeholder="Search achievements"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: { sm: 260 } }}
          />
          <Button variant="outlined" startIcon={<SearchRoundedIcon />} onClick={loadAchievements}>
            Search
          </Button>
          {user.role !== "Employee" ? (
            <Button variant="contained" startIcon={<AutoAwesomeRoundedIcon />} onClick={() => setOpen(true)}>
              Add Achievement
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {achievements.map((achievement) => (
          <Grid key={achievement._id} size={{ xs: 12, md: 6, xl: 4 }}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                border: "1px solid rgba(15, 61, 98, 0.08)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,249,252,0.94) 100%)"
              }}
            >
              <Stack spacing={2.25}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="h6">{achievement.title}</Typography>
                  <Chip label={achievement.month} color="primary" variant="outlined" />
                </Stack>

                <Typography color="text.secondary">{achievement.description || "No description provided."}</Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={achievement.teamId?.name || "Unknown team"} />
                  <Chip label={achievement.createdBy?.name || "Unknown owner"} variant="outlined" />
                </Stack>

                {user.role !== "Employee" ? (
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={() => handleDelete(achievement._id)}
                    disabled={deletingId === achievement._id}
                  >
                    {deletingId === achievement._id ? "Deleting..." : "Delete Achievement"}
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Achievement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Team" value={form.teamId} onChange={(e) => setForm((p) => ({ ...p, teamId: e.target.value }))}>
              {teams.map((team) => (
                <MenuItem key={team._id} value={team._id}>
                  {team.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <TextField label="Month (YYYY-MM)" value={form.month} onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save Achievement
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AchievementsPage;
