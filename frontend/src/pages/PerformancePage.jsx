import { useEffect, useMemo, useState } from "react";
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
  Rating,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusChip from "../components/StatusChip";

const initialForm = {
  employeeId: "",
  month: "",
  overallScore: 4,
  productivityScore: 4,
  collaborationScore: 4,
  qualityScore: 4,
  goalsCompleted: 0,
  goalsCommitted: 0,
  summary: "",
  strengths: "",
  improvementAreas: ""
};

const scoreColor = (value) => {
  if (value >= 4.5) {
    return "success";
  }

  if (value >= 3.5) {
    return "primary";
  }

  if (value >= 2.5) {
    return "warning";
  }

  return "error";
};

const PerformancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const canManage = user.role !== "Employee";

  const loadPage = async () => {
    try {
      const requests = [api.get("/performances"), api.get("/teams")];

      if (user.role === "Admin") {
        requests.push(api.get("/users", { params: { role: "Employee" } }));
      }

      const [performanceResponse, teamsResponse, usersResponse] = await Promise.all(requests);
      const visibleTeams = teamsResponse.data.data;

      setRecords(performanceResponse.data.data);
      setSummary(performanceResponse.data.summary || []);
      if (user.role === "Admin") {
        setEmployees(usersResponse.data.data.filter((entry) => entry.role === "Employee"));
      } else {
        const teamEmployees = visibleTeams.flatMap((team) => team.members || []);
        setEmployees(teamEmployees.filter((member) => member.role === "Employee"));
      }

      setError("");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load performance data");
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee._id === form.employeeId),
    [employees, form.employeeId]
  );

  const handleCreate = async () => {
    try {
      await api.post("/performances", {
        ...form,
        overallScore: Number(form.overallScore),
        productivityScore: Number(form.productivityScore),
        collaborationScore: Number(form.collaborationScore),
        qualityScore: Number(form.qualityScore),
        goalsCompleted: Number(form.goalsCompleted),
        goalsCommitted: Number(form.goalsCommitted)
      });

      setOpen(false);
      setForm(initialForm);
      setMessage("Performance record saved successfully.");
      loadPage();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to save performance");
    }
  };

  const handleDelete = async (recordId) => {
    try {
      setDeletingId(recordId);
      await api.delete(`/performances/${recordId}`);
      setMessage("Performance record deleted successfully.");
      loadPage();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete performance");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4">
            {user.role === "Employee" ? "My Performance" : "Performance Reviews"}
          </Typography>
          <Typography color="text.secondary">
            {user.role === "Employee"
              ? "Track your latest review scores, goals, and coaching feedback."
              : "Store monthly employee performance and review delivery trends by team."}
          </Typography>
        </Box>
        {canManage ? (
          <Button variant="contained" startIcon={<InsightsRoundedIcon />} onClick={() => setOpen(true)}>
            Add Performance
          </Button>
        ) : null}
      </Stack>

      {message ? <Alert severity="success">{message}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        {summary.map((entry) => (
          <Grid key={entry.employeeId} size={{ xs: 12, md: 6, xl: 4 }}>
            <Paper sx={{ p: 3, border: "1px solid rgba(15, 61, 98, 0.08)" }}>
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography variant="h6">{entry.employeeName}</Typography>
                    <Typography color="text.secondary">{entry.employeeEmail}</Typography>
                  </Box>
                  <Chip color={scoreColor(entry.averageScore)} label={`Avg ${entry.averageScore}`} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {entry.totalReviews} review{entry.totalReviews === 1 ? "" : "s"} recorded. Latest month: {entry.latestMonth}.
                </Typography>
                <Typography variant="body2">
                  Goals completed: {entry.totalGoalsCompleted}/{entry.totalGoalsCommitted}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {records.map((record) => (
          <Grid key={record._id} size={{ xs: 12, lg: 6 }}>
            <Paper sx={{ p: 3, border: "1px solid rgba(15, 61, 98, 0.08)" }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                  <Box>
                    <Typography variant="h6">{record.employeeId?.name || "Employee"}</Typography>
                    <Typography color="text.secondary">
                      {record.teamId?.name || "Unknown team"} | {record.month}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip label={`Overall ${record.overallScore}/5`} color={scoreColor(record.overallScore)} />
                    {canManage ? (
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteOutlineRoundedIcon />}
                        disabled={deletingId === record._id}
                        onClick={() => handleDelete(record._id)}
                      >
                        {deletingId === record._id ? "Deleting..." : "Delete"}
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Productivity
                    </Typography>
                    <Rating value={record.productivityScore || 0} readOnly />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Collaboration
                    </Typography>
                    <Rating value={record.collaborationScore || 0} readOnly />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Quality
                    </Typography>
                    <Rating value={record.qualityScore || 0} readOnly />
                  </Box>
                </Stack>

                <Typography variant="body2">{record.summary || "No summary provided."}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Goals completed: {record.goalsCompleted}/{record.goalsCommitted}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(record.strengths || []).map((item) => (
                    <Chip key={`${record._id}-strength-${item}`} label={`Strength: ${item}`} variant="outlined" />
                  ))}
                  {(record.improvementAreas || []).map((item) => (
                    <Chip key={`${record._id}-improvement-${item}`} label={`Improve: ${item}`} color="warning" variant="outlined" />
                  ))}
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <StatusChip type="role" value="Employee" label={record.employeeId?.role || "Employee"} />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Reviewed by {record.reviewerId?.name || "Unknown reviewer"}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Performance Review</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Employee"
              value={form.employeeId}
              onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
            >
              {employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.name} {employee.teamId?.name ? `• ${employee.teamId.name}` : ""}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Month (YYYY-MM)" value={form.month} onChange={(e) => setForm((prev) => ({ ...prev, month: e.target.value }))} />
            <TextField
              select
              label="Overall Score"
              value={form.overallScore}
              onChange={(e) => setForm((prev) => ({ ...prev, overallScore: e.target.value }))}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Productivity"
                  value={form.productivityScore}
                  onChange={(e) => setForm((prev) => ({ ...prev, productivityScore: e.target.value }))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Collaboration"
                  value={form.collaborationScore}
                  onChange={(e) => setForm((prev) => ({ ...prev, collaborationScore: e.target.value }))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Quality"
                  value={form.qualityScore}
                  onChange={(e) => setForm((prev) => ({ ...prev, qualityScore: e.target.value }))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Goals Completed"
                  value={form.goalsCompleted}
                  onChange={(e) => setForm((prev) => ({ ...prev, goalsCompleted: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Goals Committed"
                  value={form.goalsCommitted}
                  onChange={(e) => setForm((prev) => ({ ...prev, goalsCommitted: e.target.value }))}
                />
              </Grid>
            </Grid>
            <TextField
              multiline
              minRows={3}
              label="Summary"
              value={form.summary}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
            />
            <TextField
              label="Strengths"
              helperText="Comma separated, for example Ownership, Communication"
              value={form.strengths}
              onChange={(e) => setForm((prev) => ({ ...prev, strengths: e.target.value }))}
            />
            <TextField
              label="Improvement Areas"
              helperText="Comma separated, for example Testing discipline, Documentation"
              value={form.improvementAreas}
              onChange={(e) => setForm((prev) => ({ ...prev, improvementAreas: e.target.value }))}
            />
            {selectedEmployee ? (
              <Typography variant="caption" color="text.secondary">
                Review will be stored for {selectedEmployee.name}.
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Save Review
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PerformancePage;

