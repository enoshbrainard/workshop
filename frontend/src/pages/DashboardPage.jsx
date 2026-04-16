import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Divider,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import StatusChip from "../components/StatusChip";

const SectionCard = ({ title, subtitle, children }) => (
  <Paper sx={{ p: 3, border: "1px solid rgba(15, 61, 98, 0.08)", height: "100%" }}>
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">{title}</Typography>
        {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
      </Box>
      {children}
    </Stack>
  </Paper>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (user.role === "Admin") {
          const [analyticsResponse, performanceResponse] = await Promise.all([
            api.get("/analytics/dashboard"),
            api.get("/performances")
          ]);

          setData({
            analytics: analyticsResponse.data.data,
            performance: performanceResponse.data
          });
        } else {
          const [teamsResponse, achievementsResponse, performanceResponse] = await Promise.all([
            api.get("/teams"),
            api.get("/achievements"),
            api.get("/performances")
          ]);

          setData({
            teams: teamsResponse.data.data,
            achievements: achievementsResponse.data.data,
            performance: performanceResponse.data
          });
        }
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Failed to load dashboard");
      }
    };

    fetchDashboard();
  }, [user.role]);

  const employeeSummary = useMemo(() => {
    if (!data?.performance?.summary || user.role !== "Employee") {
      return null;
    }

    return data.performance.summary.find((entry) => String(entry.employeeId) === String(user._id)) || null;
  }, [data, user, user.role]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) {
    return <Typography>Loading dashboard...</Typography>;
  }

  if (user.role === "Admin") {
    const analytics = data.analytics;

    return (
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4">Executive Dashboard</Typography>
            <Typography color="text.secondary">
              Direct answers to the key team questions with linked team, staffing, and monthly achievement data.
            </Typography>
          </Box>
          <StatusChip type="role" value="Admin" label="Admin Access" />
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title="Leader Not Co-located" value={analytics.managerNotColocatedCount} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title="Leader Is Non-direct Staff" value={analytics.managerNonDirectStaffCount} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title="Non-direct Ratio Above 20%" value={analytics.nonDirectStaffRatioAbove20Count} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard title="Reporting To Org Leader" value={analytics.reportingToOrganizationLeaderCount} />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Who Are The Members Of Each Team?" subtitle="Every team with its member roster.">
              <List dense>
                {analytics.membersPerTeam.map((team) => (
                  <ListItem key={team._id} divider alignItems="flex-start">
                    <ListItemText
                      primary={`${team.name} (${team.memberCount} members)`}
                      secondary={
                        team.members.length
                          ? team.members.map((member) => `${member.name} | ${member.location || "No location"}`).join(", ")
                          : "No members assigned"
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Where Are The Teams Located?" subtitle="Primary operating location for each team.">
              <List dense>
                {analytics.teamLocations.map((team) => (
                  <ListItem key={team._id} divider>
                    <ListItemText primary={team.name} secondary={team.location || "No location"} />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Monthly Achievements By Team" subtitle="Key achievements grouped by month.">
              <List dense>
                {analytics.monthlyAchievements.map((entry) => (
                  <ListItem key={`${entry.teamId}-${entry.month}`} divider alignItems="flex-start">
                    <ListItemText
                      primary={`${entry.teamName} | ${entry.month}`}
                      secondary={entry.achievements.map((item) => item.title).join(", ")}
                    />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Employee Performance Snapshot" subtitle="Average review score by employee.">
              <List dense>
                {(data.performance.summary || []).map((entry) => (
                  <ListItem key={entry.employeeId} divider>
                    <ListItemText
                      primary={`${entry.employeeName} | Avg ${entry.averageScore}`}
                      secondary={`Reviews: ${entry.totalReviews} | Goals: ${entry.totalGoalsCompleted}/${entry.totalGoalsCommitted}`}
                    />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Teams With Leader Not Co-located" subtitle="Team leader location differs from one or more team members.">
              <List dense>
                {analytics.managerNotColocatedTeams.map((team) => (
                  <ListItem key={team._id} divider>
                    <ListItemText
                      primary={team.name}
                      secondary={`Leader: ${team.manager?.name || "Unknown"} (${team.manager?.location || "No location"})`}
                    />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Teams With Non-direct Leaders" subtitle="Team leader is marked as non-direct staff.">
              <List dense>
                {analytics.managerNonDirectStaffTeams.map((team) => (
                  <ListItem key={team._id} divider>
                    <ListItemText primary={team.name} secondary={team.manager?.name || "Unknown leader"} />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Teams Above 20% Non-direct Ratio" subtitle="Non-direct staff proportion is above 20%.">
              <List dense>
                {analytics.nonDirectStaffRatioAbove20Teams.map((team) => (
                  <ListItem key={team._id} divider>
                    <ListItemText
                      primary={team.name}
                      secondary={`${team.nonDirectStaff}/${team.totalMembers} non-direct staff (${Math.round((team.nonDirectStaffRatio || 0) * 100)}%)`}
                    />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Teams Reporting To Organization Leader" subtitle="Teams with an assigned organization leader.">
              <List dense>
                {analytics.reportingToOrganizationLeaderTeams.map((team) => (
                  <ListItem key={team._id} divider>
                    <ListItemText primary={team.name} secondary={team.organizationLeader?.name || "Unknown leader"} />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
        </Grid>
      </Stack>
    );
  }

  if (user.role === "Manager") {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">Manager Workspace</Typography>
          <Typography color="text.secondary">
            Review your teams, their recent achievements, and employee performance in one place.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="My Teams" value={data.teams.length} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="Achievements Logged" value={data.achievements.length} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="Performance Reviews" value={data.performance.count || 0} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Team Portfolio">
              <List dense>
                {data.teams.map((team) => (
                  <ListItem key={team._id} divider>
                    <ListItemText
                      primary={team.name}
                      secondary={`${team.location || "No location"} | ${team.members?.length || 0} members`}
                    />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Employee Performance Summary">
              <List dense>
                {(data.performance.summary || []).map((entry) => (
                  <ListItem key={entry.employeeId} divider>
                    <ListItemText primary={`${entry.employeeName} | Avg ${entry.averageScore}`} secondary={`Latest month: ${entry.latestMonth}`} />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Employee Workspace</Typography>
        <Typography color="text.secondary">See your assigned team, recognition, and latest performance feedback.</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Assigned Teams" value={data.teams.length} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Visible Achievements" value={data.achievements.length} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard title="Average Performance" value={employeeSummary?.averageScore || 0} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title="My Team">
            {data.teams.map((team) => (
              <Box key={team._id}>
                <Typography variant="h6">{team.name}</Typography>
                <Typography color="text.secondary">{team.location || "No location"}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  Manager: {team.managerId?.name || "Unassigned"} | Team members: {team.members?.length || 0}
                </Typography>
              </Box>
            ))}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title="Recent Achievements">
            <List dense>
              {data.achievements.map((achievement) => (
                <ListItem key={achievement._id} divider>
                  <ListItemText primary={achievement.title} secondary={`${achievement.month} | ${achievement.teamId?.name || "Unknown team"}`} />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DashboardPage;

