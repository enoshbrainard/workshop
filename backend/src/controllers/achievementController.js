const Achievement = require("../models/Achievement");
const Team = require("../models/Team");
const asyncHandler = require("../utils/asyncHandler");
const { canAccessTeam, getTeamsQueryForUser } = require("./teamController");

const getAchievements = asyncHandler(async (req, res) => {
  const { teamId, month, search } = req.query;
  const teamScope = await Team.find(getTeamsQueryForUser(req.user)).select("_id");
  const teamIds = teamScope.map((team) => team._id);
  const query = {
    teamId: { $in: teamIds }
  };

  if (teamId) {
    query.teamId = teamId;
  }

  if (month) {
    query.month = month;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const achievements = await Achievement.find(query)
    .populate("teamId", "name location")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: achievements.length, data: achievements });
});

const getAchievementById = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id)
    .populate("teamId", "name location managerId")
    .populate("createdBy", "name email role");

  if (!achievement) {
    const error = new Error("Achievement not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canAccessTeam(req.user, achievement.teamId)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  res.json({ success: true, data: achievement });
});

const createAchievement = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.body.teamId);

  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canAccessTeam(req.user, team)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  const achievement = await Achievement.create({
    ...req.body,
    createdBy: req.user._id
  });

  const populated = await Achievement.findById(achievement._id)
    .populate("teamId", "name location")
    .populate("createdBy", "name email role");

  res.status(201).json({ success: true, data: populated });
});

const updateAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id).populate("teamId", "managerId");

  if (!achievement) {
    const error = new Error("Achievement not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canAccessTeam(req.user, achievement.teamId)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  const fields = ["teamId", "title", "description", "month"];
  fields.forEach((field) => {
    if (field in req.body) {
      achievement[field] = req.body[field];
    }
  });

  await achievement.save();

  const populated = await Achievement.findById(achievement._id)
    .populate("teamId", "name location")
    .populate("createdBy", "name email role");

  res.json({ success: true, data: populated });
});

const deleteAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id).populate("teamId", "managerId");

  if (!achievement) {
    const error = new Error("Achievement not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canAccessTeam(req.user, achievement.teamId)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  await achievement.deleteOne();

  res.json({ success: true, message: "Achievement deleted successfully" });
});

module.exports = {
  getAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement
};
