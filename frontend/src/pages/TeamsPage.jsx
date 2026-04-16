import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusChip from "../components/StatusChip";

const initialForm = {
  name: "",
  location: "",
  managerId: "",
  organizationLeaderId: "",
  members: []
};

const TeamsPage = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadTeams = async () => {
    try {
      const requests = [api.get("/teams", { params: query ? { search: query } : {} })];

      if (user.role === "Admin") {
        requests.push(api.get("/users"));
      }

      const [teamsResponse, usersResponse] = await Promise.all(requests);
      setTeams(teamsResponse.data.data);
      setUsers(usersResponse?.data?.data || []);
      setError("");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load teams");
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const employeeOptions =
    user.role === "Admin"
      ? users.filter((entry) => entry.role === "Employee")
      : teams.flatMap((team) => team.members || []).filter((member) => member.role === "Employee");

  const leaderOptions = user.role === "Admin" ? users : [];

  const managerOptions = user.role === "Admin" ? users.filter((entry) => entry.role === "Manager") : [];

  const handleCreate = async () => {
    try {
      await api.post("/teams", form);
      setOpen(false);
      setForm(initialForm);
      setMessage("Team created successfully.");
      loadTeams();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to save team");
    }
  };

  const handleDelete = async (teamId) => {
    try {
      setDeletingId(teamId);
      await api.delete(`/teams/${teamId}`);
      setMessage("Team deleted successfully.");
      loadTeams();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete team");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4">Team Portfolio</Typography>
          <Typography color="text.secondary">
            Monitor team ownership, location structure, and reporting alignment across the organization.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <TextField
            placeholder="Search teams"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            size="small"
            sx={{ minWidth: { sm: 240 } }}
          />
          <Button variant="outlined" startIcon={<SearchRoundedIcon />} onClick={loadTeams}>
            Search
          </Button>
          {user.role !== "Employee" ? (
            <Button variant="contained" startIcon={<Groups2RoundedIcon />} onClick={() => setOpen(true)}>
              New Team
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid key={team._id} size={{ xs: 12, md: 6, xl: 4 }}>
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
                  <Box>
                    <Typography variant="h6">{team.name}</Typography>
                    <Typography color="text.secondary">{team.location || "No location"}</Typography>
                  </Box>
                  <Chip label={`${team.members?.length || 0} members`} color="primary" variant="outlined" />
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StatusChip
                    type="role"
                    value="Manager"
                    label={`Manager: ${team.managerId?.name || "Unassigned"}`}
                  />
                  <StatusChip
                    type="role"
                    value={team.organizationLeaderId ? "Admin" : "Employee"}
                    label={`Leader: ${team.organizationLeaderId?.name || "Not assigned"}`}
                    variant="outlined"
                  />
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "rgba(15, 61, 98, 0.04)"
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Team scope
                  </Typography>
                  <Typography variant="body2">
                    Managed from {team.location || "an unspecified location"} with {team.members?.length || 0} active member
                    {(team.members?.length || 0) === 1 ? "" : "s"}.
                  </Typography>
                </Box>

                {user.role !== "Employee" ? (
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={() => handleDelete(team._id)}
                    disabled={deletingId === team._id}
                  >
                    {deletingId === team._id ? "Deleting..." : "Delete Team"}
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Team</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Team Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <TextField label="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
            {user.role === "Admin" ? (
              <TextField
                select
                label="Manager"
                value={form.managerId}
                onChange={(e) => setForm((p) => ({ ...p, managerId: e.target.value }))}
              >
                <MenuItem value="">Select manager</MenuItem>
                {managerOptions.map((manager) => (
                  <MenuItem key={manager._id} value={manager._id}>
                    {manager.name} | {manager.location || "No location"}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
            <TextField
              select
              label="Organization Leader"
              value={form.organizationLeaderId}
              onChange={(e) => setForm((p) => ({ ...p, organizationLeaderId: e.target.value }))}
            >
              <MenuItem value="">No organization leader</MenuItem>
              {leaderOptions.map((leader) => (
                <MenuItem key={leader._id} value={leader._id}>
                  {leader.name} | {leader.role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              SelectProps={{
                multiple: true,
                renderValue: (selected) =>
                  employeeOptions
                    .filter((employee) => selected.includes(employee._id))
                    .map((employee) => employee.name)
                    .join(", ")
              }}
              label="Members"
              value={form.members}
              onChange={(e) => setForm((p) => ({ ...p, members: e.target.value }))}
            >
              {employeeOptions.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  <Checkbox checked={form.members.includes(employee._id)} />
                  <ListItemText primary={employee.name} secondary={employee.location || "No location"} />
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Save Team
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TeamsPage;

