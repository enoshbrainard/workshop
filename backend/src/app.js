const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/performances", performanceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
