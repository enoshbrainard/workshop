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
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import api from "../api/client";
import StatusChip from "../components/StatusChip";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "Employee",
  teamId: "",
  location: "",
  isDirectStaff: true
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [deletingId, setDeletingId] = useState("");

  const loadUsers = async () => {
    try {
      const [usersResponse, teamsResponse] = await Promise.all([
        api.get("/users", { params: query ? { search: query } : {} }),
        api.get("/teams")
      ]);
      setUsers(usersResponse.data.data);
      setTeams(teamsResponse.data.data);
      setError("");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async () => {
    try {
      await api.post("/users", form);
      setOpen(false);
      setForm(initialForm);
      setMessage("User created successfully.");
      loadUsers();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to create user");
    }
  };

  const handleDelete = async (userId) => {
    try {
      setDeletingId(userId);
      await api.delete(`/users/${userId}`);
      setMessage("User deleted successfully.");
      loadUsers();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4">People Directory</Typography>
          <Typography color="text.secondary">
            Manage workforce accounts, access levels, staffing type, and location coverage.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <TextField
            placeholder="Search by name or email"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: { sm: 260 } }}
          />
          <Button variant="outlined" startIcon={<SearchRoundedIcon />} onClick={loadUsers}>
            Search
          </Button>
          <Button variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} onClick={() => setOpen(true)}>
            Add User
          </Button>
        </Stack>
      </Stack>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {users.map((user) => (
          <Grid key={user._id} size={{ xs: 12, md: 6, xl: 4 }}>
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
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography color="text.secondary">{user.email}</Typography>
                  </Box>
                  <StatusChip type="role" value={user.role} label={user.role} />
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={user.location || "No location"} variant="outlined" />
                  <StatusChip
                    type="staff"
                    value={user.isDirectStaff}
                    label={user.isDirectStaff ? "Direct staff" : "Non-direct staff"}
                  />
                  <Chip label={user.teamId ? "Assigned to team" : "No team"} variant="outlined" />
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "rgba(15, 61, 98, 0.04)"
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Operational note
                  </Typography>
                  <Typography variant="body2">
                    {user.role === "Admin"
                      ? "This user has full platform control."
                      : user.role === "Manager"
                        ? "This user can manage assigned teams and achievements."
                        : "This user can view team data and update their own profile."}
                  </Typography>
                </Box>

                <Button
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => handleDelete(user._id)}
                  disabled={deletingId === user._id}
                >
                  {deletingId === user._id ? "Deleting..." : "Delete User"}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="Employee">Employee</MenuItem>
            </TextField>
            <TextField select label="Team" value={form.teamId} onChange={(e) => setForm((p) => ({ ...p, teamId: e.target.value }))}>
              <MenuItem value="">No team</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team._id} value={team._id}>
                  {team.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
            <TextField
              select
              label="Direct Staff"
              value={String(form.isDirectStaff)}
              onChange={(e) => setForm((p) => ({ ...p, isDirectStaff: e.target.value === "true" }))}
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save User
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default UsersPage;
