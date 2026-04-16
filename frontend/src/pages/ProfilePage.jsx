import { useState } from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    location: user?.location || "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      await api.put("/users/me", form);
      await refreshUser();
      setMessage("Profile updated successfully");
      setError("");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to update profile");
      setMessage("");
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 680 }}>
      <Stack spacing={2}>
        <Typography variant="h4">Profile</Typography>
        <Typography color="text.secondary">Update your personal details and password.</Typography>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <TextField label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <TextField label="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
        <TextField label="New Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Stack>
    </Paper>
  );
};

export default ProfilePage;
