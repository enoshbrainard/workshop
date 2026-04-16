const Team = require("../models/Team");
const User = require("../models/User");
const Achievement = require("../models/Achievement");
const Performance = require("../models/Performance");
const asyncHandler = require("../utils/asyncHandler");
const { ensureMembersMatchTeam } = require("../utils/membership");

const canAccessTeam = (user, team) => {
  if (user.role === "Admin") {
    return true;
  }

  if (user.role === "Manager") {
    return String(team.managerId) === String(user._id);
  }

  return String(user.teamId || "") === String(team._id);
};

const getTeamsQueryForUser = (user) => {
  if (user.role === "Admin") {
    return {};
  }

  if (user.role === "Manager") {
    return { managerId: user._id };
  }

  return { _id: user.teamId };
};

const getTeams = asyncHandler(async (req, res) => {
  const { search, location, managerId } = req.query;
  const query = getTeamsQueryForUser(req.user);

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  if (managerId && req.user.role === "Admin") {
    query.managerId = managerId;
  }

  const teams = await Team.find(query)
    .populate("managerId", "name email location isDirectStaff")
    .populate("organizationLeaderId", "name email")
    .populate("members", "name email role location isDirectStaff")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: teams.length, data: teams });
});

const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate("managerId", "name email location isDirectStaff")
    .populate("organizationLeaderId", "name email")
    .populate("members", "name email role location isDirectStaff");

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

  res.json({ success: true, data: team });
});

const createTeam = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.user.role === "Manager") {
    payload.managerId = req.user._id;
  }

  const manager = await User.findById(payload.managerId);
  if (!manager || manager.role !== "Manager") {
    const error = new Error("Valid manager is required");
    error.statusCode = 400;
    throw error;
  }

  const team = await Team.create({
    name: payload.name,
    location: payload.location,
    managerId: payload.managerId,
    members: payload.members || [],
    organizationLeaderId: payload.organizationLeaderId || null
  });

  await ensureMembersMatchTeam(team._id, payload.members || []);

  const populated = await Team.findById(team._id)
    .populate("managerId", "name email")
    .populate("organizationLeaderId", "name email")
    .populate("members", "name email role");

  res.status(201).json({ success: true, data: populated });
});

const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

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

  const fields = ["name", "location", "organizationLeaderId"];
  fields.forEach((field) => {
    if (field in req.body) {
      team[field] = req.body[field];
    }
  });

  if (req.user.role === "Admin" && req.body.managerId) {
    const manager = await User.findById(req.body.managerId);

    if (!manager || manager.role !== "Manager") {
      const error = new Error("Valid manager is required");
      error.statusCode = 400;
      throw error;
    }

    team.managerId = req.body.managerId;
  }

  if (Array.isArray(req.body.members)) {
    team.members = req.body.members;
  }

  await team.save();
  await ensureMembersMatchTeam(team._id, team.members);

  const populated = await Team.findById(team._id)
    .populate("managerId", "name email location")
    .populate("organizationLeaderId", "name email")
    .populate("members", "name email role location isDirectStaff");

  res.json({ success: true, data: populated });
});

const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

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

  await ensureMembersMatchTeam(team._id, []);
  await Achievement.deleteMany({ teamId: team._id });
  await Performance.deleteMany({ teamId: team._id });
  await team.deleteOne();

  res.json({ success: true, message: "Team deleted successfully" });
});

const addTeamMember = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  const user = await User.findById(req.body.userId);

  if (!team || !user) {
    const error = new Error("Team or user not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canAccessTeam(req.user, team)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  team.members.addToSet(user._id);
  await team.save();

  user.teamId = team._id;
  await user.save();

  const populated = await Team.findById(team._id).populate("members", "name email role location isDirectStaff");

  res.json({ success: true, data: populated });
});

const removeTeamMember = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  const user = await User.findById(req.params.userId);

  if (!team || !user) {
    const error = new Error("Team or user not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canAccessTeam(req.user, team)) {
    const error = new Error("Forbidden");
    error.statusCode = 403;
    throw error;
  }

  team.members.pull(user._id);
  await team.save();

  if (String(user.teamId || "") === String(team._id)) {
    user.teamId = null;
    await user.save();
  }

  const populated = await Team.findById(team._id).populate("members", "name email role location isDirectStaff");

  res.json({ success: true, data: populated });
});

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  canAccessTeam,
  getTeamsQueryForUser
};
